// Local checkpoints are scoped to one tab, account and exact timeline URL.
(() => {
  const key=id=>'deleteCheckpoint:'+id;
  const lease=id=>'deleteResume:'+id;
  const files=['core.js','language.js','follow.js','content.js'];
  const generations=new Map();
  async function cancel(id){
    generations.set(id,(generations.get(id)||0)+1);
    await chrome.storage.session.remove(lease(id));
    const saved=(await chrome.storage.local.get(key(id)))[key(id)];
    if(saved){saved.resume=false;await chrome.storage.local.set({[key(id)]:saved});}
  }
  chrome.runtime.onMessage.addListener((message,sender,respond)=>{
    if(!['delete-checkpoint','delete-restore','delete-cancel','delete-save'].includes(message?.type)||!sender.tab?.id||!/^https:\/\/x\.com\//.test(sender.tab.url||''))return;
    const id=sender.tab.id;
    let replied=false;const reply=value=>{if(!replied){replied=true;respond(value);}};
    (async()=>{
      if(message.type==='delete-cancel'){await cancel(id);return {ok:true};}
      if(message.type==='delete-restore'){
        const saved=(await chrome.storage.local.get(key(id)))[key(id)];if(!saved)return {};
        const token=(await chrome.storage.session.get(lease(id)))[lease(id)];
        const auto=!!saved.resume&&token===saved.token&&Date.now()-saved.savedAt<300000&&sender.tab.url===saved.scope.page;
        await cancel(id);
        if(sender.tab.url!==saved.scope.page)return {};
        return {checkpoint:saved,auto};
      }
      const checkpoint=message.checkpoint;
      if(!checkpoint||!Array.isArray(checkpoint.results)||!Array.isArray(checkpoint.archive)||!checkpoint.scope||checkpoint.scope.page!==sender.tab.url)throw Error('保存対象のページが一致しません。');
      const scope=checkpoint.scope;
      if(!/^[a-z0-9_]{1,15}$/.test(scope.self)||!new RegExp('^/'+scope.self+'(?:/(?:all|with_replies|media))?/?$','i').test(new URL(scope.page).pathname))throw Error('保存対象のアカウントを確認できません。');
      const token=crypto.randomUUID(),resume=message.type==='delete-checkpoint';
      const generation=generations.get(id)||0;
      const saved={...checkpoint,token,resume,savedAt:Date.now()};
      await chrome.storage.local.set({[key(id)]:saved});
      if(!resume){await chrome.storage.session.remove(lease(id));return {ok:true};}
      await chrome.storage.session.set({[lease(id)]:token});
      if((generations.get(id)||0)!==generation){await cancel(id);return {error:'停止しました。'};}
      reply({ok:true,reloading:true});
      try{await chrome.tabs.reload(id,{bypassCache:true});}catch(error){await cancel(id);await chrome.scripting.executeScript({target:{tabId:id},func:()=>globalThis.__postClear?.reloadFailed?.()});}
      return {ok:true,reloading:true};
    })().then(reply,error=>reply({error:error.message}));return true;
  });
  chrome.tabs.onUpdated.addListener((id,change,tab)=>{
    if(change.status!=='complete')return;
    (async()=>{
      const saved=(await chrome.storage.local.get(key(id)))[key(id)];if(!saved?.resume)return;
      const token=(await chrome.storage.session.get(lease(id)))[lease(id)];
      if(token!==saved.token||Date.now()-saved.savedAt>=300000||tab.url!==saved.scope.page){await cancel(id);return;}
      await chrome.scripting.executeScript({target:{tabId:id},files});
    })().catch(()=>cancel(id));
  });
  chrome.tabs.onRemoved.addListener(id=>{cancel(id).then(()=>chrome.storage.local.remove(key(id))).catch(()=>{});});
})();

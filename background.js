if(typeof importScripts==='function')importScripts('delete-recovery.js','follow-list.js');
chrome.action.onClicked.addListener(async tab => {
  if (!tab.id || !/^https:\/\/x\.com\//.test(tab.url || '')) {
    await chrome.action.setBadgeText({tabId:tab.id,text:'X'});
    await chrome.action.setTitle({tabId:tab.id,title:'x.comで自分のプロフィールを開いてから押してください'});
    return;
  }
  try {
    const context=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>({profile:document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href'),panelOpen:!!globalThis.__postClear})});
    const own=context[0]?.result;
    const self=own?.profile?.match(/^\/([\w]{1,15})\/?$/)?.[1]?.toLowerCase();
    const destination=new URL(tab.url);
    // Never navigate an existing panel: its deletion memo may still be in memory.
    if(!own?.panelOpen&&self&&new RegExp('^/'+self+'/?$','i').test(destination.pathname)){
      destination.pathname='/'+self+'/all';destination.search='';destination.hash='';
      await chrome.tabs.update(tab.id,{url:destination.href});
      let loaded=false;
      for(let i=0;i<60;i++){
        const current=await chrome.tabs.get(tab.id);
        if((current.pendingUrl&&current.pendingUrl!==destination.href)||(current.url!==destination.href&&current.url!==tab.url))throw Error('ページが移動されました。');
        if(current.url===destination.href&&current.status==='complete'){loaded=true;break;}
        await new Promise(resolve=>setTimeout(resolve,500));
      }
      if(!loaded)throw Error('一覧の読み込みを確認できません。');
    }
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['core.js','language.js','follow.js','content.js']});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
  } catch {
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setTitle({tabId:tab.id,title:'Xを再読み込みしてから、もう一度押してください'});
  }
});

const FOLLOW_ALARM='tweet-sweep-follow';
let followTickBusy=false;
let followWrites=Promise.resolve();
const loadFollow=async()=>(await chrome.storage.local.get('followJob')).followJob;
function withFollowWrite(write){const task=followWrites.then(write);followWrites=task.catch(()=>{});return task;}
async function storeFollow(job,force=false){return withFollowWrite(async()=>{const current=await loadFollow();if(!force&&(!current||current.token!==job.token||(!current.running&&job.running)))return false;await chrome.storage.local.set({followJob:job});return true;});}
async function scheduleFollow(job,ms){job.nextAt=Date.now()+ms;if(await storeFollow(job))await chrome.alarms.create(FOLLOW_ALARM,{when:job.nextAt});}
function ownLikesUrl(url,account){try{const parsed=new URL(url);return parsed.origin==='https://x.com'&&new RegExp('^/'+account+'/status/[0-9]+/likes/?$','i').test(parsed.pathname);}catch{return false;}}
async function finishFollowMode(job){job.running=false;job.inFlight=false;job.message=job.mode==='collect'?'表示できた範囲の収集が終わりました。':'保存リストの処理が終わりました。';if(job.mode==='collect'){job.collectionDone=true;job.collectPhase='posts';job.collectIndex=0;}if(await storeFollow(job))await chrome.alarms.clear(FOLLOW_ALARM);}
async function followTick(){
  if(followTickBusy){await chrome.alarms.create(FOLLOW_ALARM,{when:Date.now()+30000});return;}followTickBusy=true;
  let job;
  try{
    job=await loadFollow();if(!job?.running)return;
    if(!['collect','follow'].includes(job.mode)){job.running=false;job.inFlight=false;job.message='収集か、リストからフォローを選んでください。';if(await storeFollow(job))await chrome.alarms.clear(FOLLOW_ALARM);return;}
    if(job.inFlight)throw Error('前回の処理が中断されました。Xを確認して再開してください。');
    if(job.nextAt>Date.now()+500){await chrome.alarms.create(FOLLOW_ALARM,{when:job.nextAt});return;}
    if(job.mode==='follow'){
      if(!job.queue.some(p=>p.state==='pending')){await finishFollowMode(job);return;}
      if(Date.now()<(job.nextFollowAt||0)){job.message='次のフォローを待っています…';await scheduleFollow(job,Math.max(1000,job.nextFollowAt-Date.now()));return;}
      job.phase='follow';
    }else{
      job.phase=job.collectPhase||job.phase;
      job.postIndex=job.collectIndex??job.postIndex??0;
      if(job.phase==='likes'&&job.postIndex>=job.posts.length){await finishFollowMode(job);return;}
      if(!['posts','likes'].includes(job.phase))throw Error('収集設定を確認できません。収集を開始し直してください。');
    }
    // A watchdog stops on interruption rather than repeating an ambiguous action.
    job.inFlight=true;job.message=job.phase==='posts'?'投稿を調査中…':job.phase==='likes'?'いいねした人を取得中: '+(job.postIndex+1)+' / '+job.posts.length+' 投稿':'フォローを確認中…';job.nextAt=Date.now()+180000;if(!await storeFollow(job))return;await chrome.alarms.create(FOLLOW_ALARM,{when:job.nextAt});
    const tab=await chrome.tabs.get(job.tabId);
    if(!/^https:\/\/x\.com\//.test(tab.url||''))throw Error('専用のXタブが移動されました。');
    let url,followTarget,followOnList=false;const previousNextFollowAt=job.nextFollowAt||0;
    if(job.phase==='posts')url=job.source;
    else if(job.phase==='likes')url=job.posts[job.postIndex].url;
    if(job.phase==='follow'){
      const pending=job.queue.filter(p=>p.state==='pending');
      const next=pending.find(p=>!p.profileFallback&&p.sourceUrl===tab.url)||pending[0];
      if(!next){await finishFollowMode(job);return;}
      followTarget=next.handle;
      job.followTarget=followTarget;
      const list=next.sourceUrl||(ownLikesUrl(tab.url,job.account)?tab.url:null);
      url=!next.profileFallback&&ownLikesUrl(list,job.account)?list:'https://x.com/'+next.handle;
      followOnList=ownLikesUrl(url,job.account);
    }
    if(tab.url!==url)await chrome.tabs.update(job.tabId,{url});
    let loaded=false;
    for(let i=0;i<60;i++){
      const current=await loadFollow();if(!current?.running||current.token!==job.token)return;
      const page=await chrome.tabs.get(job.tabId);if(page.status==='complete'&&page.url===url){loaded=true;break;}
      await new Promise(r=>setTimeout(r,500));
    }
    if(!loaded)throw Error('Xのページの読み込みを確認できません。');
    if(job.phase==='follow'){job.nextFollowAt=Date.now()+job.interval*1000;if(!await storeFollow(job))return;}
    await chrome.scripting.executeScript({target:{tabId:job.tabId},files:['follow-worker.js']});
    const responses=await chrome.scripting.executeScript({target:{tabId:job.tabId},func:async data=>{
      try{return {ok:true,value:await globalThis.TweetSweepFollowStep(data)};}
      catch(error){return {ok:false,error:error?.message||String(error)};}
    },args:[job]});
    const current=await loadFollow();if(!current?.running||current.token!==job.token)return;
    const response=responses[0]?.result;
    if(!response)throw Error((job.phase==='likes'?'投稿 '+(job.postIndex+1)+' のいいね取得':job.phase==='follow'?'フォロー':'投稿取得')+'の結果が返りませんでした。専用タブを確認してください。');
    if(!response.ok)throw Error(response.error||'処理に失敗しました。');
    const result=response.value;if(!result)throw Error('処理結果が空でした。専用タブを確認してください。');
    if(job.phase==='posts'){
      job.posts=[...new Map(result.items.map(post=>[post.id||post.url,post])).values()];job.postIndex=0;job.collectIndex=0;job.phase='likes';job.collectPhase='likes';
      if(!job.posts.length){await finishFollowMode(job);return;}
      job.message='投稿 '+job.posts.length+' 件を取得しました。';
    }else if(job.phase==='likes'){
      const known=new Map(job.queue.map(p=>[p.handle,p]));for(const person of result.items){const saved=known.get(person.handle);if(!saved){known.set(person.handle,person);job.queue.push(person);}else if(saved.state==='pending'){if(person.state==='existing')saved.state='existing';if(ownLikesUrl(person.sourceUrl,job.account)){saved.sourceUrl=person.sourceUrl;saved.profileFallback=false;}}}
      job.postIndex++;job.collectIndex=job.postIndex;job.collectPhase='likes';job.message='いいねした人を取得中: '+job.postIndex+' / '+job.posts.length+' 投稿';
    }else{
      if((!followOnList&&result.handle!==followTarget)||!job.queue.some(p=>p.handle===result.handle&&p.state==='pending')||!['followed','existing','locate-profile'].includes(result.state))throw Error('フォロー対象の処理結果が一致しません。');
      job.nextFollowAt=result.state==='followed'?Date.now()+job.interval*1000:previousNextFollowAt;
      const person=job.queue.find(p=>p.handle===result.handle);if(person)person.state=result.state;
      if(result.state==='locate-profile'){person.state='pending';person.profileFallback=true;job.message='一覧に対象がないためプロフィールを確認します…';}
      else job.message='@'+result.handle+(result.state==='existing'?' はフォロー・申請済み':' をフォローしました');
    }
    job.inFlight=false;await scheduleFollow(job,1000);
  }catch(e){
    const current=await loadFollow();if(job&&current?.token===job.token&&current.running){job.running=false;job.message=e.message;if(await storeFollow(job))await chrome.alarms.clear(FOLLOW_ALARM);}
  }finally{followTickBusy=false;}
}
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name===FOLLOW_ALARM)followTick();});
chrome.runtime.onStartup.addListener(async()=>{const job=await loadFollow();if(job?.running){job.running=false;job.message='Chromeが再起動されました。再開してください。';await storeFollow(job);}await chrome.alarms.clear(FOLLOW_ALARM);});
chrome.runtime.onInstalled?.addListener(async()=>{const job=await loadFollow();if(job?.running){job.running=false;job.inFlight=false;job.token=crypto.randomUUID();job.message='更新しました。収集か、リストからフォローを選んでください。';await storeFollow(job,true);}await chrome.alarms.clear(FOLLOW_ALARM);});
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(!['follow-collect','follow-start','follow-stop','follow-reset','follow-export','follow-import'].includes(message?.type)||!sender.tab||!/^https:\/\/x\.com\//.test(sender.tab.url||''))return;
  (async()=>{
    let job=await loadFollow();
    if(message.type==='follow-stop'){job=await withFollowWrite(async()=>{const current=await loadFollow();if(current){current.running=false;current.token=crypto.randomUUID();current.message='停止しました。';await chrome.storage.local.set({followJob:current});}return current;});await chrome.alarms.clear(FOLLOW_ALARM);return {job};}
    if(message.type==='follow-reset'){if(job?.running)throw Error('停止してからリストを作り直してください。');await withFollowWrite(()=>chrome.storage.local.remove('followJob'));return {job:null};}
    if(message.type==='follow-export'){if(!job?.queue?.length)throw Error('保存リストは空です。');return {data:globalThis.TweetSweepFollowList.encode(job)};}
    if(job?.running){if(message.type==='follow-import')throw Error('停止してから読み込んでください。');return {job};}
    const result=await chrome.scripting.executeScript({target:{tabId:sender.tab.id},func:()=>document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')});
    const account=result[0]?.result?.match(/^\/([\w]{1,15})\/?$/)?.[1]?.toLowerCase();if(!account)throw Error('ログイン中のアカウントを確認できません。');
    if(job&&job.account!==account)throw Error('別アカウントのリストがあります。書き出してから新しいリストを作ってください。');
    if(message.type==='follow-import'){
      const imported=globalThis.TweetSweepFollowList.decode(message.data);if(imported.account!==account)throw Error('リストのアカウントとログイン中のアカウントが違います。');
      job=job||{account,source:'https://x.com/'+account+'/all',posts:[],postIndex:0,queue:[]};
      job.queue=globalThis.TweetSweepFollowList.merge(job.queue,imported.people);job.running=false;job.inFlight=false;job.mode=null;job.token=crypto.randomUUID();job.message='リストを読み込みました。';
      await storeFollow(job,true);await chrome.alarms.clear(FOLLOW_ALARM);return {job};
    }
    const interval=message.type==='follow-start'?Number(message.interval):(job?.interval||60);
    if(!Number.isSafeInteger(interval)||interval<30||interval>86400)throw Error('間隔は30〜86400秒で入力してください。');
    if(message.type==='follow-collect'){
      const path=new URL(sender.tab.url).pathname;
      if(!new RegExp('^/'+account+'(?:/(?:all|with_replies|media)|/status/[0-9]+)?/?$','i').test(path))throw Error('自分のプロフィールか、自分の投稿を開いてください。');
      const post=path.match(/\/status\/(\d+)/),source=new RegExp('^/'+account+'/?$','i').test(path)?'https://x.com/'+account+'/all':sender.tab.url;
      const resume=job?.source===source&&!job.collectionDone&&job.collectPhase;
      job=job||{account,queue:[]};
      if(!resume){job.source=source;job.posts=post?[{id:post[1],url:'https://x.com/'+account+'/status/'+post[1]+'/likes'}]:[];job.collectIndex=0;job.collectPhase=post?'likes':'posts';}
      job.collectionDone=false;job.mode='collect';job.phase=job.collectPhase;job.postIndex=job.collectIndex||0;
    }else{
      if(!job?.queue?.some(p=>p.state==='pending'))throw Error('フォロー待ちのリストは空です。');
      job.mode='follow';job.phase='follow';
    }
    job.inFlight=false;job.interval=interval;job.token=crypto.randomUUID();job.running=true;job.message=job.mode==='collect'?'収集を開始します…':'保存リストからフォローを開始します…';job.nextAt=Date.now();
    let worker;try{if(job.tabId)worker=await chrome.tabs.get(job.tabId);}catch{}
    if(!worker||!/^https:\/\/x\.com\//.test(worker.url||''))worker=await chrome.tabs.create({url:job.mode==='collect'?job.source:'https://x.com/'+job.queue.find(p=>p.state==='pending').handle,active:true});
    job.tabId=worker.id;await storeFollow(job,true);await chrome.alarms.create(FOLLOW_ALARM,{when:Date.now()+1000});return {job};
  })().then(respond,e=>respond({error:e.message}));return true;
});

chrome.action.onClicked.addListener(async tab => {
  if (!tab.id || !/^https:\/\/x\.com\//.test(tab.url || '')) {
    await chrome.action.setBadgeText({tabId:tab.id,text:'X'});
    await chrome.action.setTitle({tabId:tab.id,title:'x.comで自分のプロフィールを開いてから押してください'});
    return;
  }
  try {
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['core.js','language.js','follow.js','content.js']});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
  } catch {
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setTitle({tabId:tab.id,title:'Xを再読み込みしてから、もう一度押してください'});
  }
});

const FOLLOW_ALARM='tweet-sweep-follow';
let followTickBusy=false;
const loadFollow=async()=>(await chrome.storage.local.get('followJob')).followJob;
async function storeFollow(job){await chrome.storage.local.set({followJob:job});return job;}
async function scheduleFollow(job,ms){job.nextAt=Date.now()+ms;await storeFollow(job);await chrome.alarms.create(FOLLOW_ALARM,{when:job.nextAt});}
async function followTick(){
  if(followTickBusy){await chrome.alarms.create(FOLLOW_ALARM,{when:Date.now()+30000});return;}followTickBusy=true;
  let job;
  try{
    job=await loadFollow();if(!job?.running)return;
    if(job.inFlight)throw Error('前回の処理が中断されました。Xを確認して再開してください。');
    if(job.nextAt>Date.now()+500){await chrome.alarms.create(FOLLOW_ALARM,{when:job.nextAt});return;}
    // Follow discovered people immediately, then use the interval to scan more posts.
    if(job.phase!=='posts'){
      const pending=job.queue.some(p=>p.state==='pending');
      if(pending&&Date.now()>=(job.nextFollowAt||0))job.phase='follow';
      else if(job.postIndex<job.posts.length)job.phase='likes';
      else if(pending){job.message='次のフォローを待っています…';await scheduleFollow(job,Math.max(1000,job.nextFollowAt-Date.now()));return;}
      else{job.running=false;job.inFlight=false;job.message='完了しました。';await chrome.alarms.clear(FOLLOW_ALARM);await storeFollow(job);return;}
    }
    // A watchdog stops on interruption rather than repeating an ambiguous action.
    job.inFlight=true;job.message='処理中…';job.nextAt=Date.now()+420000;await storeFollow(job);await chrome.alarms.create(FOLLOW_ALARM,{when:job.nextAt});
    const tab=await chrome.tabs.get(job.tabId);
    if(!/^https:\/\/x\.com\//.test(tab.url||''))throw Error('専用のXタブが移動されました。');
    let url;
    if(job.phase==='posts')url=job.source;
    else if(job.phase==='likes')url=job.posts[job.postIndex].url;
    if(job.phase==='follow'){
      const next=job.queue.find(p=>p.state==='pending');
      if(!next){job.running=false;job.message='完了しました。';await chrome.alarms.clear(FOLLOW_ALARM);await storeFollow(job);return;}
      url='https://x.com/'+next.handle;
    }
    if(tab.url!==url)await chrome.tabs.update(job.tabId,{url});
    let loaded=false;
    for(let i=0;i<60;i++){
      const current=await loadFollow();if(!current?.running||current.token!==job.token)return;
      const page=await chrome.tabs.get(job.tabId);if(page.status==='complete'&&page.url===url){loaded=true;break;}
      await new Promise(r=>setTimeout(r,500));
    }
    if(!loaded)throw Error('Xのページの読み込みを確認できません。');
    if(job.phase==='follow'){job.nextFollowAt=Date.now()+job.interval*1000;await storeFollow(job);}
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
      job.posts=result.items;job.postIndex=0;job.phase='likes';
      if(!job.posts.length)throw Error('自分の投稿を取得できません。プロフィールを確認してください。');
      job.message='投稿 '+job.posts.length+' 件を取得しました。';
    }else if(job.phase==='likes'){
      const known=new Set(job.queue.map(p=>p.handle));for(const person of result.items)if(!known.has(person.handle)){known.add(person.handle);job.queue.push(person);}
      job.postIndex++;job.message='いいねした人を取得中: '+job.postIndex+' / '+job.posts.length+' 投稿';
    }else{
      job.nextFollowAt=Date.now()+job.interval*1000;
      const person=job.queue.find(p=>p.handle===result.handle);if(person)person.state=result.state;
      job.message='@'+result.handle+(result.state==='existing'?' はフォロー・申請済み':' をフォローしました');
    }
    job.inFlight=false;await scheduleFollow(job,1000);
  }catch(e){
    const current=await loadFollow();if(job&&current?.token===job.token&&current.running){job.running=false;job.message=e.message;await storeFollow(job);await chrome.alarms.clear(FOLLOW_ALARM);}
  }finally{followTickBusy=false;}
}
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name===FOLLOW_ALARM)followTick();});
chrome.runtime.onStartup.addListener(async()=>{const job=await loadFollow();if(job?.running){job.running=false;job.message='Chromeが再起動されました。再開してください。';await storeFollow(job);}await chrome.alarms.clear(FOLLOW_ALARM);});
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(!['follow-start','follow-stop','follow-reset'].includes(message?.type)||!sender.tab||!/^https:\/\/x\.com\//.test(sender.tab.url||''))return;
  (async()=>{
    let job=await loadFollow();
    if(message.type==='follow-stop'){if(job){job.running=false;job.token=crypto.randomUUID();job.message='停止しました。';await storeFollow(job);}await chrome.alarms.clear(FOLLOW_ALARM);return {job};}
    if(message.type==='follow-reset'){if(job?.running)throw Error('停止してからリストを作り直してください。');await chrome.storage.local.remove('followJob');return {job:null};}
    if(job?.running)return {job};
    const interval=Number(message.interval);if(!Number.isSafeInteger(interval)||interval<30||interval>86400)throw Error('間隔は30〜86400秒で入力してください。');
    const result=await chrome.scripting.executeScript({target:{tabId:sender.tab.id},func:()=>document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')});
    const account=result[0]?.result?.match(/^\/([\w]{1,15})\/?$/)?.[1]?.toLowerCase();if(!account)throw Error('ログイン中のアカウントを確認できません。');
    if(job&&job.account!==account)throw Error('別アカウントのリストがあります。「新しいリスト」で作り直してください。');
    if(!job){
      const path=new URL(sender.tab.url).pathname;
      if(!new RegExp('^/'+account+'(?:/(?:with_replies|media)|/status/[0-9]+)?/?$','i').test(path))throw Error('自分のプロフィールか、自分の投稿を開いてください。');
      const post=path.match(/\/status\/(\d+)/);
      job={account,source:sender.tab.url,phase:post?'likes':'posts',posts:post?[{id:post[1],url:'https://x.com/'+account+'/status/'+post[1]+'/likes'}]:[],postIndex:0,queue:[]};
    }
    job.inFlight=false;job.interval=interval;job.token=crypto.randomUUID();job.running=true;job.message='開始します…';job.nextAt=Date.now();
    // Keep the control panel in the original tab; navigation happens in a separate tab.
    let worker;try{if(job.tabId)worker=await chrome.tabs.get(job.tabId);}catch{}
    if(!worker||!/^https:\/\/x\.com\//.test(worker.url||''))worker=await chrome.tabs.create({url:job.source,active:true});
    job.tabId=worker.id;await storeFollow(job);await chrome.alarms.create(FOLLOW_ALARM,{when:Date.now()+1000});return {job};
  })().then(respond,e=>respond({error:e.message}));return true;
});

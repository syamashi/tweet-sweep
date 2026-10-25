// Runs only in the dedicated X tab created by an explicitly started follow job.
globalThis.TweetSweepFollowStep=async function(job){
  const originalLocation=location.href;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const visible=e=>!!e&&e.isConnected&&e.getClientRects().length>0;
  const account=()=>document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')?.match(/^\/([\w]{1,15})\/?$/)?.[1]?.toLowerCase();
  async function guard(){const saved=(await chrome.storage.local.get('followJob')).followJob;if(!saved?.running||saved.token!==job.token)throw Error('停止しました。');if(location.href!==originalLocation)throw Error('ページが移動されました。');if(account()!==job.account)throw Error('ログイン中のアカウントが変わりました。');}
  function blocked(){return [...document.querySelectorAll('[role="alert"],[data-testid="toast"],[role="dialog"]')].filter(visible).some(e=>/rate limit|following limit|unable to follow|temporarily restricted|verify your|unusual activity|不審な|制限|認証|フォローできません|しばらくして/i.test(e.textContent));}
  for(let i=0;i<60&&!account();i++)await sleep(500);
  await guard();if(blocked())throw Error('Xの制限・確認画面を検出しました。');
  if(job.phase==='follow'){
    const handle=job.queue.find(p=>p.state==='pending')?.handle;
    if(!handle||location.pathname.toLowerCase()!=='/'+handle)throw Error('対象プロフィールを確認できません。');
    let button;
    for(let i=0;i<40;i++){await guard();button=[...document.querySelectorAll('main [data-testid$="-unfollow"],main [data-testid$="-follow"],main [data-testid$="-pending"]')].find(e=>visible(e)&&!e.closest('[data-testid="UserCell"],aside,article'));if(button)break;if(blocked())throw Error('Xの制限・確認画面を検出しました。');await sleep(500);}
    if(!button)throw Error('プロフィールのフォローボタンが見つかりません。');
    const id=button.getAttribute('data-testid');
    if(id.endsWith('-unfollow')||id.endsWith('-pending')||/Pending|リクエスト済み|申請済み/i.test(button.textContent))return {handle,state:'existing'};
    if(!/^(Follow|フォロー|フォローする)$/i.test(button.textContent.trim()))throw Error('フォローボタンを識別できません。');
    await guard();button.click();
    for(let i=0;i<60;i++){await guard();if(blocked())throw Error('Xの制限・確認画面を検出しました。');const confirmed=document.querySelector('main [data-testid="'+id.replace(/-follow$/,'-unfollow')+'"],main [data-testid="'+id.replace(/-follow$/,'-pending')+'"]');if(visible(confirmed)||/Pending|リクエスト済み|申請済み/i.test(button.textContent))return {handle,state:'followed'};await sleep(500);}
    // Never automatically click again when the outcome is ambiguous.
    throw Error('フォロー結果を確認できません。Xで確認してから再開してください。');
  }
  const found=new Map();let last='',stalls=0;
  window.scrollTo(0,0);
  for(let i=0;i<300;i++){
    await guard();if(blocked())throw Error('Xの制限・確認画面を検出しました。');
    if(job.phase==='posts'){
      for(const article of document.querySelectorAll('article[data-testid="tweet"]')){
        const likes=article.querySelector('[data-testid="like"],[data-testid="unlike"]');
        if(/^0(?:\s|件)/.test(likes?.getAttribute('aria-label')||''))continue;
        const time=[...article.querySelectorAll('time')].find(t=>t.closest('article')===article);
        const href=time?.closest('a[href]')?.getAttribute('href');
        const match=href?.match(/^\/([\w]{1,15})\/status\/(\d+)$/);
        if(match&&match[1].toLowerCase()===job.account)found.set(match[2],{id:match[2],url:'https://x.com/'+job.account+'/status/'+match[2]+'/likes'});
      }
    }else{
      // Exclude recommendation cells: only accept the labelled liker timeline.
      const timeline=[...document.querySelectorAll('main section')].find(section=>{
        const label=section.getAttribute('aria-label')||section.getAttribute('aria-labelledby')?.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ')||'';
        return /liked by|likes|いいね/i.test(label);
      });
      for(const cell of timeline?.querySelectorAll('[data-testid="UserCell"]')||[]){
        const handle=[...cell.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')?.match(/^\/([\w]{1,15})\/?$/)?.[1]?.toLowerCase()).find(Boolean);
        if(handle&&handle!==job.account)found.set(handle,{handle,state:cell.querySelector('[data-testid$="-unfollow"],[data-testid$="-pending"]')?'existing':'pending'});
      }
    }
    const fingerprint=found.size+'|'+document.querySelector('main')?.textContent.slice(-400);
    if(fingerprint===last)stalls++;else stalls=0;last=fingerprint;
    if(stalls>=12&&!document.querySelector('main [role="progressbar"]'))break;
    window.scrollBy(0,Math.max(500,innerHeight*.8));await sleep(1000);
  }
  await guard();
  if(job.phase==='likes'&&!found.size){const main=document.querySelector('main');if(!main||!/(No likes|No one has liked|Nothing to see here|まだ.*いいね|いいね.*ありません|まだ何もありません|表示するものはありません)/i.test(main.textContent))throw Error('いいね一覧を取得できません。対象ポストの「いいね」一覧が表示できるか確認してください。');}
  return {items:[...found.values()]};
};

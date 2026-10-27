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
  const cellHandle=cell=>[...cell.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')?.match(/^\/([\w]{1,15})\/?$/)?.[1]?.toLowerCase()).find(Boolean);
  const likesRoute=()=>new RegExp('^/'+job.account+'/status/[0-9]+/likes/?$','i').test(location.pathname);
  function likerCells(){
    if(!likesRoute())return [];
    const main=document.querySelector('main [data-testid="primaryColumn"]')||document.querySelector('main');
    let timeline=[...document.querySelectorAll('main section')].find(section=>{
      const label=section.getAttribute('aria-label')||section.getAttribute('aria-labelledby')?.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ')||'';
      return visible(section)&&/liked by|likes|いいね/i.test(label);
    });
    const selected=[...main?.querySelectorAll('[role="tab"][aria-selected="true"]')||[]].some(tab=>/^(Likes|いいね)$/i.test(tab.textContent.trim()));
    const activity=[...main?.querySelectorAll('h1,h2,[role="heading"]')||[]].some(e=>/^(Post activity|ポストアクティビティ|ポストのアクティビティ)$/i.test(e.textContent.trim()));
    if(!timeline&&selected&&activity)timeline=main;
    return [...timeline?.querySelectorAll('[data-testid="UserCell"]')||[]].filter(cell=>{
      const section=cell.closest('section'),label=section?.getAttribute('aria-label')||section?.getAttribute('aria-labelledby')?.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ')||'';
      return visible(cell)&&!cell.closest('aside,[data-testid="sidebarColumn"]')&&!/who to follow|you might like|おすすめ|関連するアカウント/i.test(label);
    });
  }
  const followButtons=scope=>[...scope.querySelectorAll('[data-testid$="-unfollow"],[data-testid$="-follow"],[data-testid$="-pending"]')].filter(visible);
  const existing=button=>/-(unfollow|pending)$/.test(button?.getAttribute('data-testid')||'')||/^(Following|Requested|Pending|フォロー中|リクエスト済み|申請済み)$/i.test(button?.textContent.trim()||'');
  if(job.phase==='follow'){
    if(job.mode!=='follow')throw Error('収集モードではフォローしません。');
    let handle=job.followTarget||job.queue.find(p=>p.state==='pending')?.handle;
    const onList=likesRoute(),pending=new Set(job.queue.filter(p=>p.state==='pending').map(p=>p.handle));
    const chooseVisible=()=>{const cell=likerCells().find(row=>pending.has(cellHandle(row)));if(cell)handle=cellHandle(cell);};
    if(onList)chooseVisible();
    if(!handle||(!onList&&location.pathname.toLowerCase()!=='/'+handle))throw Error('対象プロフィールを確認できません。');
    const findRow=()=>likerCells().find(cell=>cellHandle(cell)===handle);
    const findButton=()=>onList?(findRow()?followButtons(findRow())[0]:null):followButtons(document.querySelector('main')||document).find(e=>!e.closest('[data-testid="UserCell"],aside,article'));
    let button;
    for(let i=0;i<(onList?8:40);i++){await guard();if(onList){if(i===1)window.scrollTo(0,0);chooseVisible();}button=findButton();if(button)break;if(blocked())throw Error('Xの制限・確認画面を検出しました。');await sleep(onList?250:500);}
    if(!button){if(onList)return {handle,state:'locate-profile'};throw Error('プロフィールのフォローボタンが見つかりません。');}
    if(existing(button))return {handle,state:'existing'};
    await guard();
    // Re-resolve the exact handle immediately before clicking a virtualized row.
    button=findButton();
    if(!button)throw Error('対象の表示が変わりました。');
    if(existing(button))return {handle,state:'existing'};
    if(!/-follow$/.test(button.getAttribute('data-testid')||'')||!/^(Follow|フォロー|フォローする)$/i.test(button.textContent.trim())||button.disabled||button.getAttribute('aria-disabled')==='true')throw Error('フォローボタンを識別できません。');
    button.click();
    for(let i=0;i<60;i++){await guard();if(blocked())throw Error('Xの制限・確認画面を検出しました。');const confirmed=findButton();if(confirmed&&existing(confirmed))return {handle,state:'followed'};await sleep(500);}
    throw Error('フォロー結果を確認できません。Xで確認してから再開してください。');
  }
  const found=new Map();let last='',stalls=0,retries=0,scanned=0;
  const deadline=Date.now()+90000;
  window.scrollTo(0,0);
  for(let i=0;i<120&&Date.now()<deadline;i++){
    scanned=i+1;let visibleIds=[];
    await guard();if(blocked())throw Error('Xの制限・確認画面を検出しました。');
    if(job.phase==='posts'){
      for(const article of document.querySelectorAll('article[data-testid="tweet"]')){
        const likes=article.querySelector('[data-testid="like"],[data-testid="unlike"]');
        if(/^0(?:\s|件)/.test(likes?.getAttribute('aria-label')||''))continue;
        const time=[...article.querySelectorAll('time')].find(t=>t.closest('article')===article);
        const href=time?.closest('a[href]')?.getAttribute('href');
        const match=href?.match(/^\/([\w]{1,15})\/status\/(\d+)$/);
        if(match)visibleIds.push(match[2]);
        if(match&&match[1].toLowerCase()===job.account)found.set(match[2],{id:match[2],url:'https://x.com/'+job.account+'/status/'+match[2]+'/likes'});
      }
    }else{
      for(const cell of likerCells()){
        const handle=cellHandle(cell);
        if(handle)visibleIds.push(handle);
        if(handle&&handle!==job.account)found.set(handle,{handle,state:followButtons(cell).some(existing)?'existing':'pending',sourceUrl:originalLocation});
      }
    }
    const fingerprint=found.size+'|'+visibleIds.join('|');
    if(fingerprint===last)stalls++;else stalls=0;last=fingerprint;
    const loading=[...document.querySelectorAll('main [role="progressbar"]')].some(e=>visible(e)&&!e.hidden&&getComputedStyle(e).display!=='none');
    if(stalls>=12&&!loading){
      if(retries>=2)break;
      retries++;stalls=0;window.scrollBy(0,-Math.max(250,innerHeight*.5));await sleep(3000*retries);
    }
    window.scrollBy(0,Math.max(500,innerHeight*.8));await sleep(1000);
  }
  await guard();
  if(job.phase==='likes'&&!found.size){const main=document.querySelector('main');if(!main||!/(No likes|No one has liked|Nothing to see here|まだ.*いいね|いいね.*ありません|まだ何もありません|表示するものはありません)/i.test(main.textContent))throw Error('いいね一覧を取得できません。対象ポストの「いいね」一覧が表示できるか確認してください。');}
  return {items:[...found.values()],scanned};
};

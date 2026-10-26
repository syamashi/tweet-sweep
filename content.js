(() => {
  if(globalThis.__postClear){globalThis.__postClear.toggle();return;}
  const C=globalThis.PostClearCore;
  const host=document.createElement('div');
  host.id='post-clear-personal';
  host.style.cssText='position:fixed;right:18px;top:18px;width:min(390px,calc(100vw - 36px));max-height:calc(100vh - 36px);z-index:2147483647;color-scheme:light;';
  const root=host.attachShadow({mode:'closed'});
  root.innerHTML=`<style>
  :host{all:initial;font:13px/1.65 system-ui,sans-serif;color:#27382d}*{box-sizing:border-box}section{background:#f7f8f2;border:1px solid #d5dfcf;border-radius:16px;box-shadow:0 12px 55px #0005;max-height:calc(100vh - 36px);overflow:auto;padding:22px}header{display:flex;align-items:center;justify-content:space-between}h1{font-size:22px;letter-spacing:-.6px;margin:0}h2{font-size:14px;margin:20px 0 8px}.muted{color:#697764;font-size:11px}button,input{font:inherit}button{padding:9px 12px;border:1px solid #ced9c7;background:white;color:#314e37;border-radius:7px;cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}.primary{background:#345e42;color:#fff;border-color:#345e42}.danger{background:#fff0e9;color:#9d4434;border-color:#e8cfc4}.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}input[type=number],input[type=text]{padding:9px;border:1px solid #cdd7c7;border-radius:6px;background:#fff;color:#233324;width:100%}input[type=checkbox]{accent-color:#355d40}label{display:block;margin:9px 0}#list{max-height:210px;overflow:auto;border-top:1px solid #dce3d5;margin:12px 0}.post{padding:10px 0;border-bottom:1px solid #e0e5da;overflow-wrap:anywhere}.post a{color:#436e4a;font-size:11px}.text{white-space:pre-wrap;font-size:12px}.notice{background:#edf0e5;border-radius:8px;padding:10px;margin:12px 0;font-size:11px}#status{white-space:pre-wrap;margin:12px 0;overflow-wrap:anywhere}progress{width:100%;accent-color:#416d46}#confirmbox{padding:12px;background:#fff5ee;border:1px solid #e5cdbf;border-radius:8px;margin-top:12px}[hidden]{display:none!important}a{color:#3f7049}#close{border:0;background:transparent;font-size:19px;padding:0 6px}
  #limit:disabled{background:#d9dde1;color:#737b83;border-color:#b9c0c7;cursor:not-allowed;opacity:1;-webkit-text-fill-color:#737b83}
  .display-warning{color:#b91c1c;background:#fff0f0;border:2px solid #dc2626;border-radius:8px;padding:12px;margin:12px 0;font-size:17px;font-weight:800;line-height:1.65}.display-warning p{margin:5px 0 0;font-size:15px}
  </style><section><header><h1>↗ Tweet Sweep</h1><button id="close" aria-label="閉じる">×</button></header><div class="muted">DELETE TWEETS FOR X · ツイート・ポストの一括削除</div>
  <div class="display-warning" role="note"><strong>処理中はXのタブを表示してください。</strong><p>タブ切替・最小化で停止することがあります。</p></div>
  <div id="identity">自分のプロフィールを開いてください。</div><label><input id="all" type="checkbox" checked>∞ 全件</label><label>件数<input id="limit" type="number" min="1" step="1" value="20" disabled></label>
  <div class="row"><label><input id="posts" type="checkbox" checked>投稿・返信・引用</label><label><input id="reposts" type="checkbox" checked>リポスト</label></div>
  <p class="muted">返信も含めるなら「返信」タブへ。対象はXで読み込めた範囲です。</p>
  <label><input id="ack" type="checkbox">このアカウントの投稿を削除します（取り消し不可）</label>
  <div class="row"><button id="start" class="danger" disabled>削除する</button><button id="stop" disabled>停止</button></div>
  <div class="row" style="margin-top:10px"><button id="backup" disabled>JSONを保存</button></div>
  <progress id="progress" max="1" value="0"></progress><div id="status" role="status">待機中</div><details class="muted"><summary>注意事項</summary>JSON保存は任意。読み込み停止時は記録を保存して一覧を読み直します。Xの非API自動化規則をご確認ください。</details></section>`;
  document.documentElement.append(host);
  const minimize=document.createElement('button');
  minimize.textContent='−';minimize.title='パネルを折りたたむ／開く';
  root.querySelector('header').insertBefore(minimize,root.getElementById('close'));
  minimize.addEventListener('click',e=>{if(!e.isTrusted)return;const section=root.querySelector('section');const collapsed=section.dataset.collapsed!=='true';section.dataset.collapsed=String(collapsed);for(const child of section.children)if(child.tagName!=='HEADER')child.style.display=collapsed?'none':'';minimize.textContent=collapsed?'＋':'−';});
  const $=id=>root.getElementById(id);
  let follow=null,reloading=false,restoring=true,disposed=false;
  let results=[],archive=new Map(),busy=false,aborted=false,jobLocation='',jobSelf='';
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  const visible=e=>!!e&&e.isConnected&&e.getClientRects().length>0;
  function identity(){return C.account(document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')||'');}
  function validPage(){const self=identity(),route=location.pathname.match(/^\/([A-Za-z0-9_]{1,15})(?:\/(all|with_replies|media))?\/?$/);return self&&route&&route[1].toLowerCase()===self?self:null;}
  function guard(){if(aborted)throw Error('停止しました。');if(location.href!==jobLocation||identity()!==jobSelf||validPage()!==jobSelf)throw Error('ページまたはアカウントが変わったため停止しました。');}
  function totals(self){const latest=new Map(),confirmed=new Set();for(const r of results){if(r.account!==self)continue;latest.set(r.id,r);if(r.ok)confirmed.add(r.id);}return {done:confirmed.size,skipped:[...latest.values()].filter(r=>!confirmed.has(r.id)&&r.state==='unconfirmed').length};}
  function status(s){$('status').textContent=s;}
  function setBusy(value){busy=value;for(const id of ['all','limit','posts','reposts','ack'])$(id).disabled=value;$('limit').disabled=value||$('all').checked;$('stop').disabled=!value;$('close').disabled=value;render();}
  function record(article,self=identity()){
    if(article.querySelector('[data-testid="tombstone"]'))return null;
    const ownTime=[...article.querySelectorAll('time')].find(t=>t.closest('article')===article);
    const link=ownTime?.closest('a[href]');const parsed=C.permalink(link?.getAttribute('href')||'');if(!parsed)return null;
    const social=article.querySelector('[data-testid="socialContext"]');
    if(!self)return null;
    const selfRepost=!!social&&[...social.querySelectorAll('a[href]')].some(a=>C.account(a.getAttribute('href'))===self)&&!!article.querySelector('[data-testid="unretweet"]');
    const kind=C.classify({author:parsed.author,self,reposted:selfRepost,reply:false});if(!kind)return null;
    // A status timestamp belongs to the outer post. Quote cards must never supply its identity.
    const primaryText=article.querySelector('[data-testid="tweetText"]');
    return {...parsed,kind,text:primaryText?.textContent||'(本文なし・メディア投稿)',date:ownTime.getAttribute('datetime')||'',node:article};
  }
  function records(){const self=identity();return [...document.querySelectorAll('article[data-testid="tweet"]')].map(article=>record(article,self)).filter(Boolean);}
  function render(){const ready=validPage();$('identity').textContent=ready?'対象: @'+ready:'自分のプロフィールを開いてください。';$('backup').disabled=busy||!archive.size;$('start').disabled=restoring||busy||follow?.running||!$('ack').checked||!ready||(!$('posts').checked&&!$('reposts').checked)||(!$('all').checked&&(!Number.isSafeInteger(Number($('limit').value))||Number($('limit').value)<1));$('limit').disabled=busy||$('all').checked;}
  function timelineFingerprint(){return [...document.querySelectorAll('article[data-testid="tweet"] time')].map(t=>t.closest('a[href]')?.getAttribute('href')||'').join('|')+'@'+Math.round(window.scrollY);}
  async function waitFor(fn,timeout=30000,phase='画面応答'){const started=Date.now(),end=started+timeout;let notified=false;while(Date.now()<end){guard();const value=fn();if(value)return value;if(!notified&&Date.now()-started>=7000){notified=true;status('Xの応答を待っています…');}await delay(150)}const error=new Error(phase+'を確認できませんでした。');error.recoverable=true;throw error;}
  async function returnToTop(){let last='',stable=0;for(let i=0;i<50;i++){guard();window.scrollTo(0,0);await delay(300);guard();const fingerprint=timelineFingerprint(),loading=[...document.querySelectorAll('[role="progressbar"]')].some(visible);if(!loading&&Math.abs(window.scrollY)<3&&fingerprint===last)stable++;else stable=0;last=fingerprint;if(i>=6&&stable>=4)return;}throw Error('先頭の一覧が安定しないため停止しました。');}
  async function settleCurrent(){let last='',stable=0;for(let i=0;i<20;i++){guard();await delay(300);const next=timelineFingerprint();if(next===last)stable++;else stable=0;last=next;if(i>=3&&stable>=3)return;}}
  function retryable(message){const error=Error(message);error.recoverable=true;return error;}
  function scanFingerprint(){return [...document.querySelectorAll('article[data-testid="tweet"] time')].map(t=>t.closest('a[href]')?.getAttribute('href')||'').join('|');}
  async function cooldown(ms){for(let remaining=ms;remaining>0;remaining-=250){guard();await delay(Math.min(250,remaining));}}
  async function ensureTop(){while(true){try{await returnToTop();return;}catch(e){guard();status('一覧の読み込みを待っています…');await cooldown(10000);}}}
  async function clearTransientUi(){
    while(menus().length||hasConfirm()){
      guard();const confirm=document.querySelector('[data-testid="confirmationSheetConfirm"]');const sheet=confirm?.closest('[role="alertdialog"], [role="dialog"], [data-testid="sheetDialog"]');
      if(sheet&&/(ポストを削除|ツイートを削除|Delete (post|Tweet)|Delete this post)/i.test(sheet.textContent)){
        const cancel=sheet.querySelector('[data-testid="confirmationSheetCancel"]');if(visible(cancel))cancel.click();
      }
      if(menus().length)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
      if(menus().length||hasConfirm())status('メニュー・確認画面を閉じると自動で続行します。');await cooldown(1000);
    }
  }
  function save(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function serial(p){const {node,...rest}=p;return rest;}
  function trusted(id,handler){$(id).addEventListener('click',e=>{if(e.isTrusted)handler(e);});}
  trusted('close',()=>{host.hidden=true;});
  trusted('backup',()=>{if(busy||!archive.size)return;save('tweet-sweep-posts-'+Date.now()+'.json',[...archive.values()].map(({date,text})=>({date,text})));});
  for(const id of ['all','limit','posts','reposts'])$(id).addEventListener('change',()=>{if(busy)return;$('ack').checked=false;render();});
  $('ack').addEventListener('change',render);
  trusted('stop',()=>{aborted=true;chrome.runtime.sendMessage({type:'delete-cancel'}).catch(()=>{});$('stop').disabled=true;status('停止要求を受け付けました。確定済みの削除は取り消せません。');});
  async function locate(id){return waitFor(()=>records().find(p=>p.id===id),5000,'投稿の再表示');}
  function menus(){return [...document.querySelectorAll('[role="menu"]')].filter(visible);}
  function hasConfirm(){return visible(document.querySelector('[data-testid="confirmationSheetConfirm"]'));}
  async function deleteOne(candidate,manual){
    guard();if(menus().length||hasConfirm())throw Error('既存のメニューや確認画面を閉じてから再開してください。');
    const current=await locate(candidate.id);guard();
    if(current.kind!==candidate.kind||current.author!==candidate.author)throw Error('投稿の種類が変化したため停止しました。');
    // Only align the current live row; never return to the profile top per deletion.
    const rect=current.node.getBoundingClientRect();
    if(rect.height>0&&(rect.top<90||rect.bottom>innerHeight-40)){window.scrollBy(0,rect.top-110);await settleCurrent();}
    await delay(300);guard();if(!current.node.isConnected||record(current.node)?.id!==candidate.id)throw retryable('投稿表示が変わったため保留しました。');
    if(candidate.kind==='repost'){
      const undo=current.node.querySelector('[data-testid="unretweet"]');if(!visible(undo))throw Error('リポスト解除ボタンを確認できません。');undo.click();
      const item=await waitFor(()=>{const a=[...document.querySelectorAll('[data-testid="unretweetConfirm"]')].filter(visible);return a.length===1?a[0]:null;},30000,'リポスト解除メニュー');
      if(manual){status('Xの「リポストを取り消す」を自分で押してください。\n'+candidate.id);await waitFor(()=>!visible(item)&&!records().find(p=>p.id===candidate.id&&p.kind==='repost'),120000);}
      else{guard();item.click();await waitFor(()=>!visible(item)&&!records().find(p=>p.id===candidate.id&&p.kind==='repost'),30000,'リポスト解除後の表示');}
    }else{
      if(current.author!==jobSelf)throw Error('自分の投稿ではないため停止しました。');
      const caret=current.node.querySelector('[data-testid="caret"]');if(!visible(caret))throw Error('投稿メニューを確認できません。');caret.click();
      const item=await waitFor(()=>{const all=menus().flatMap(m=>[...m.querySelectorAll('[role="menuitem"]')]).filter(e=>/^(削除|Delete)$/.test(e.textContent.trim()));return all.length===1?all[0]:null;},30000,'投稿の削除メニュー');
      guard();if(!current.node.isConnected||record(current.node)?.id!==candidate.id)throw retryable('投稿表示が変わったため保留しました。');item.click();
      const confirm=await waitFor(()=>document.querySelector('[data-testid="confirmationSheetConfirm"]'),30000,'削除確認ボタン');
      const sheet=confirm.closest('[role="alertdialog"], [role="dialog"], [data-testid="sheetDialog"]');
      if(!visible(confirm)||!sheet||!/(ポストを削除|ツイートを削除|Delete (post|Tweet)|Delete this post)/i.test(sheet.textContent))throw Error('投稿削除の確認画面を識別できず停止しました。');
      if(manual){status('Xの確認画面で「削除」を自分で押してください。\n'+candidate.id);await waitFor(()=>!visible(confirm)&&!records().find(p=>p.id===candidate.id),120000);}
      else{guard();confirm.click();await waitFor(()=>!visible(confirm)&&!records().find(p=>p.id===candidate.id),30000,'削除後の投稿の消失');}
    }
    guard();return {id:candidate.id,url:candidate.url,kind:candidate.kind,ok:true,evidence:'画面で対象の消失またはリポスト解除を確認',at:new Date().toISOString()};
  }
  async function runDeletion(resume=null){
    if(busy||restoring||!validPage()||follow?.running||(!resume&&($('start').disabled||!$('ack').checked)))return;
    const scope=resume?{...resume.scope,limit:resume.scope.limit===null?Infinity:resume.scope.limit}:{self:validPage(),page:location.href,limit:$('all').checked?Infinity:Number($('limit').value),posts:$('posts').checked,reposts:$('reposts').checked};
    if(scope.self!==validPage()||scope.page!==location.href)return;
    if((scope.limit!==Infinity&&(!Number.isSafeInteger(scope.limit)||scope.limit<1))||(!scope.posts&&!scope.reposts))return;
    const manual=false;jobSelf=scope.self;jobLocation=scope.page;aborted=false;setBusy(true);$('progress').value=0;if(scope.limit===Infinity)$('progress').removeAttribute('value');else $('progress').max=scope.limit;let done=0,skipped=0,consecutive=0,last='',stalls=0,retries=0,exhausted=false;const attempted=new Set(resume?.attempted||[]),completed=new Set(results.filter(r=>r.ok&&r.account===scope.self).map(r=>r.id));
    status('順次削除中: '+totals(scope.self).done+' 件・未確認 '+totals(scope.self).skipped+' 件');
    try{
      if(resume||!results.some(r=>r.account===scope.self))await ensureTop();else await settleCurrent();
      while(done+skipped<scope.limit){
        guard();
        const p=records().find(p=>(p.kind==='repost'?scope.reposts:scope.posts)&&!completed.has(p.id)&&!attempted.has(p.id));
        if(p){
          attempted.add(p.id);const data=serial(p);archive.set(p.id,data);
          const entry={...data,account:scope.self,ok:false,state:'pending',startedAt:new Date().toISOString()};results.push(entry);render();
          status('順次削除中: '+totals(scope.self).done+' 件・未確認 '+totals(scope.self).skipped+' 件');
          try{
            Object.assign(entry,await deleteOne(p,manual),{state:'deleted'});done++;completed.add(p.id);consecutive=0;
            status('順次削除中: '+totals(scope.self).done+' 件・未確認 '+totals(scope.self).skipped+' 件');
            await settleCurrent();guard();if(scope.limit!==Infinity)$('progress').value=done+skipped;
            stalls=0;last='';retries=0;render();
          }catch(e){
            Object.assign(entry,{state:'unconfirmed',error:e.message,at:new Date().toISOString()});guard();if(!e.recoverable)throw e;
            skipped++;consecutive++;status('未確認の投稿を保留して続行します。未確認 '+totals(scope.self).skipped+' 件');
            await cooldown(Math.min(120000,5000*2**Math.min(5,consecutive-1)));await clearTransientUi();await settleCurrent();stalls=0;last='';retries=0;
          }
          await delay(2000);continue;
        }
        const fingerprint=scanFingerprint();stalls=fingerprint===last?stalls+1:0;last=fingerprint;
        if(stalls>=12){
          if(retries>=3){exhausted=true;break;}
          retries++;stalls=0;status('追加の読み込みを待っています…');
          // Recover at the current frontier instead of traversing the timeline again.
          window.scrollBy(0,-Math.max(300,innerHeight*.5));await cooldown(3000);
          const bottom=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);if(bottom>innerHeight)window.scrollTo(0,bottom);else window.scrollBy(0,innerHeight);await cooldown(5000*retries);
          continue;
        }
        window.scrollBy(0,Math.max(400,innerHeight*.75));await delay(1100);
      }
      if(exhausted){
        const refreshes=done>0?0:(resume?.refreshes||0);
        if(refreshes<2){
          await clearTransientUi();guard();status('記録を保存して一覧を読み直します…');
          reloading=true;
          const response=await chrome.runtime.sendMessage({type:'delete-checkpoint',checkpoint:snapshot(refreshes+1)});
          if(response?.error)throw Error(response.error);
          if(response?.reloading)return;
          reloading=false;
        }
      }
      const summary='削除確認 '+totals(scope.self).done+' 件・未確認 '+totals(scope.self).skipped+' 件。未確認の投稿は次回再確認してください。';
      status(exhausted?'一覧の読み込みが止まりました。未表示の投稿が残る場合があります。\n'+summary:summary);
    }
    catch(e){reloading=false;status(e.message+'\n累計の削除確認: '+totals(scope.self).done+' 件。未確認の投稿は削除済みと扱いません。');}
    finally{
      if(!reloading){
        try{const saved=await chrome.runtime.sendMessage({type:'delete-save',checkpoint:snapshot(0)});if(saved?.error)throw Error(saved.error);}catch{if(!disposed)status('記録の自動保存に失敗しました。JSONを保存してください。\n'+$('status').textContent);}
        if(!disposed){$('ack').checked=false;$('progress').max=Math.max(1,done+skipped+(exhausted?1:0));$('progress').value=done+skipped;setBusy(false);}
      }
    }
    function snapshot(refreshes){const owned=results.filter(r=>r.account===scope.self),ids=new Set(owned.map(r=>r.id));return {scope:{...scope,limit:scope.limit===Infinity?null:Math.max(0,scope.limit-done-skipped)},results:owned.map(({id,account,ok,state})=>({id,account,ok,state})),archive:[...archive.entries()].filter(([id])=>ids.has(id)).map(([id,{date,text}])=>[id,{date,text}]),attempted:[...attempted].filter(id=>!completed.has(id)),refreshes};}
  }
  trusted('start',()=>runDeletion());
  window.addEventListener('beforeunload',e=>{if(busy&&!reloading){aborted=true;e.preventDefault();e.returnValue='';}});
  let lastIdlePage=location.href+'|'+identity();
  const timer=setInterval(()=>{if(busy&&(location.href!==jobLocation||identity()!==jobSelf)){aborted=true;status('ページまたはアカウントの変更を検出しました。停止します。');}if(!busy){const next=location.href+'|'+identity();if(next!==lastIdlePage){lastIdlePage=next;$('ack').checked=false;render();}}},1000);
  render();
  follow=globalThis.TweetSweepFollow?.mount(root,{isDeleting:()=>busy,onChange:()=>render()});
  const language=globalThis.PostClearLanguage.mount(root);
  globalThis.__postClear={reloadFailed(){reloading=false;aborted=true;status('一覧の再読み込みに失敗しました。記録は保存されています。');setBusy(false);},toggle(){host.hidden=!host.hidden;},dispose(){disposed=true;aborted=true;clearInterval(timer);language.dispose();follow?.dispose();host.remove();}};
  chrome.runtime.sendMessage({type:'delete-restore'}).then(async response=>{
    if(disposed)return;
    const checkpoint=response?.checkpoint;
    if(!checkpoint){restoring=false;render();return;}
    for(let i=0;i<100&&!identity();i++){await delay(300);if(disposed)return;}
    if(validPage()!==checkpoint.scope.self||location.href!==checkpoint.scope.page){restoring=false;status('保存時とアカウント・ページが違うため再開しません。');render();return;}
    results=checkpoint.results||[];archive=new Map(checkpoint.archive||[]);
    $('all').checked=checkpoint.scope.limit===null;$('limit').value=checkpoint.scope.limit||20;
    $('posts').checked=checkpoint.scope.posts;$('reposts').checked=checkpoint.scope.reposts;
    restoring=false;render();
    status('削除確認 '+totals(checkpoint.scope.self).done+' 件・未確認 '+totals(checkpoint.scope.self).skipped+' 件。未確認の投稿は次回再確認してください。');
    if(response.auto&&(checkpoint.scope.limit===null||checkpoint.scope.limit>0)){
      $('ack').checked=true;render();await runDeletion(checkpoint);
    }
  }).catch(()=>{if(!disposed){restoring=false;render();}});
})();

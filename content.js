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
  <progress id="progress" max="1" value="0"></progress><div id="status" role="status">待機中</div><details class="muted"><summary>注意事項</summary>保存は任意。バックグラウンドでも続行しますが、Chromeにより遅くなる場合があります。Xの非API自動化規則をご確認ください。</details></section>`;
  document.documentElement.append(host);
  const minimize=document.createElement('button');
  minimize.textContent='−';minimize.title='パネルを折りたたむ／開く';
  root.querySelector('header').insertBefore(minimize,root.getElementById('close'));
  minimize.addEventListener('click',e=>{if(!e.isTrusted)return;const section=root.querySelector('section');const collapsed=section.dataset.collapsed!=='true';section.dataset.collapsed=String(collapsed);for(const child of section.children)if(child.tagName!=='HEADER')child.style.display=collapsed?'none':'';minimize.textContent=collapsed?'＋':'−';});
  const $=id=>root.getElementById(id);
  let results=[],archive=new Map(),busy=false,aborted=false,jobLocation='',jobSelf='';
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  const visible=e=>!!e&&e.isConnected&&e.getClientRects().length>0;
  function identity(){return C.account(document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')||'');}
  function validPage(){const self=identity(),route=location.pathname.match(/^\/([A-Za-z0-9_]{1,15})(?:\/(with_replies|media))?\/?$/);return self&&route&&route[1].toLowerCase()===self?self:null;}
  function guard(){if(aborted)throw Error('停止しました。');if(location.href!==jobLocation||identity()!==jobSelf||validPage()!==jobSelf)throw Error('ページまたはアカウントが変わったため停止しました。');}
  function status(s){$('status').textContent=s;}
  function setBusy(value){busy=value;for(const id of ['all','limit','posts','reposts','ack'])$(id).disabled=value;$('limit').disabled=value||$('all').checked;$('stop').disabled=!value;$('close').disabled=value;render();}
  function record(article,self=identity()){
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
  function render(){const ready=validPage();$('identity').textContent=ready?'対象: @'+ready:'自分のプロフィールを開いてください。';$('backup').disabled=busy||!archive.size;$('start').disabled=busy||!$('ack').checked||!ready||(!$('posts').checked&&!$('reposts').checked)||(!$('all').checked&&(!Number.isSafeInteger(Number($('limit').value))||Number($('limit').value)<1));$('limit').disabled=busy||$('all').checked;}
  function timelineFingerprint(){return [...document.querySelectorAll('article[data-testid="tweet"] time')].map(t=>t.closest('a[href]')?.getAttribute('href')||'').join('|')+'@'+Math.round(window.scrollY);}
  async function waitFor(fn,timeout=7000){const end=Date.now()+timeout;while(Date.now()<end){guard();const value=fn();if(value)return value;await delay(150)}throw Error('画面の応答を確認できず停止しました。');}
  function save(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function serial(p){const {node,...rest}=p;return rest;}
  function trusted(id,handler){$(id).addEventListener('click',e=>{if(e.isTrusted)handler(e);});}
  trusted('close',()=>{host.hidden=true;});
  trusted('backup',()=>{if(busy||!archive.size)return;save('tweet-sweep-posts-'+Date.now()+'.json',{account:jobSelf||validPage(),page:jobLocation||location.href,createdAt:new Date().toISOString(),posts:[...archive.values()].map(p=>({...p})),results:results.map(r=>({...r}))});});
  for(const id of ['all','limit','posts','reposts'])$(id).addEventListener('change',()=>{if(busy)return;$('ack').checked=false;render();});
  $('ack').addEventListener('change',render);
  trusted('stop',()=>{aborted=true;$('stop').disabled=true;status('停止要求を受け付けました。確定済みの削除は取り消せません。');});
  async function locate(id){let found=records().find(p=>p.id===id);if(found)return found;window.scrollTo(0,0);await delay(900);let last='',stalls=0;while(stalls<12){guard();found=records().find(p=>p.id===id);if(found)return found;const fingerprint=timelineFingerprint();if(fingerprint===last)stalls++;else stalls=0;last=fingerprint;window.scrollBy(0,Math.max(400,innerHeight*.75));await delay(900);}throw Error('候補 '+id+' を再表示できず停止しました。');}
  function menus(){return [...document.querySelectorAll('[role="menu"]')].filter(visible);}
  function hasConfirm(){return visible(document.querySelector('[data-testid="confirmationSheetConfirm"]'));}
  async function deleteOne(candidate,manual){
    guard();if(menus().length||hasConfirm())throw Error('既存のメニューや確認画面を閉じてから再開してください。');
    const current=await locate(candidate.id);guard();
    if(current.kind!==candidate.kind||current.author!==candidate.author)throw Error('投稿の種類が変化したため停止しました。');
    current.node.scrollIntoView({block:'center'});await delay(300);guard();
    if(candidate.kind==='repost'){
      const undo=current.node.querySelector('[data-testid="unretweet"]');if(!visible(undo))throw Error('リポスト解除ボタンを確認できません。');undo.click();
      const item=await waitFor(()=>{const a=[...document.querySelectorAll('[data-testid="unretweetConfirm"]')].filter(visible);return a.length===1?a[0]:null;});
      if(manual){status('Xの「リポストを取り消す」を自分で押してください。\n'+candidate.id);await waitFor(()=>!visible(item)&&!records().find(p=>p.id===candidate.id&&p.kind==='repost'),120000);}
      else{guard();item.click();await waitFor(()=>!visible(item)&&!records().find(p=>p.id===candidate.id&&p.kind==='repost'));}
    }else{
      if(current.author!==jobSelf)throw Error('自分の投稿ではないため停止しました。');
      const caret=current.node.querySelector('[data-testid="caret"]');if(!visible(caret))throw Error('投稿メニューを確認できません。');caret.click();
      const item=await waitFor(()=>{const all=menus().flatMap(m=>[...m.querySelectorAll('[role="menuitem"]')]).filter(e=>/^(削除|Delete)$/.test(e.textContent.trim()));return all.length===1?all[0]:null;});
      guard();if(!current.node.isConnected||record(current.node)?.id!==candidate.id)throw Error('投稿表示が変わったため停止しました。');item.click();
      const confirm=await waitFor(()=>document.querySelector('[data-testid="confirmationSheetConfirm"]'));
      const sheet=confirm.closest('[role="alertdialog"], [role="dialog"], [data-testid="sheetDialog"]');
      if(!visible(confirm)||!sheet||!/(ポストを削除|ツイートを削除|Delete (post|Tweet)|Delete this post)/i.test(sheet.textContent))throw Error('投稿削除の確認画面を識別できず停止しました。');
      if(manual){status('Xの確認画面で「削除」を自分で押してください。\n'+candidate.id);await waitFor(()=>!visible(confirm)&&!records().find(p=>p.id===candidate.id),120000);}
      else{guard();confirm.click();await waitFor(()=>!visible(confirm)&&!records().find(p=>p.id===candidate.id));}
    }
    guard();return {id:candidate.id,url:candidate.url,kind:candidate.kind,ok:true,evidence:'画面で対象の消失またはリポスト解除を確認',at:new Date().toISOString()};
  }
  trusted('start',async()=>{
    if(busy||$('start').disabled||!$('ack').checked||!validPage())return;
    const scope={self:validPage(),page:location.href,limit:$('all').checked?Infinity:Number($('limit').value),posts:$('posts').checked,reposts:$('reposts').checked};
    if((scope.limit!==Infinity&&(!Number.isSafeInteger(scope.limit)||scope.limit<1))||(!scope.posts&&!scope.reposts))return;
    const manual=false;jobSelf=scope.self;jobLocation=scope.page;aborted=false;setBusy(true);$('progress').value=0;if(scope.limit===Infinity)$('progress').removeAttribute('value');else $('progress').max=scope.limit;let done=0,last='',stalls=0,retries=0;
    window.scrollTo(0,0);
    try{while(done<scope.limit){guard();const p=records().find(p=>(p.kind==='repost'?scope.reposts:scope.posts)&&!results.some(r=>r.id===p.id&&r.ok));if(p){const data=serial(p);archive.set(p.id,data);const entry={...data,ok:false,state:'pending',startedAt:new Date().toISOString()};results.push(entry);render();status('順次削除中: '+done+' 件');try{Object.assign(entry,await deleteOne(p,manual),{state:'deleted'});done++;if(scope.limit!==Infinity)$('progress').value=done;stalls=0;last='';retries=0;render();}catch(e){Object.assign(entry,{state:'unconfirmed',error:e.message,at:new Date().toISOString()});throw e;}await delay(2000);continue;}const fingerprint=timelineFingerprint();stalls=fingerprint===last?stalls+1:0;last=fingerprint;if(stalls>=12){if(retries>=2)break;retries++;stalls=0;status('追加の読み込みを待っています…');window.scrollBy(0,-Math.max(300,innerHeight*.5));await delay(3000);window.scrollBy(0,Math.max(600,innerHeight));await delay(5000);continue;}window.scrollBy(0,Math.max(400,innerHeight*.75));await delay(1100);}status('今回の '+done+' 件を処理しました。結果を保存し、X上でも確認してください。');}
    catch(e){status(e.message+'\n今回の処理済み: '+done+' 件。未確認の投稿は削除済みと扱いません。');}
    finally{$('ack').checked=false;$('progress').max=Math.max(1,done);$('progress').value=done;setBusy(false);}
  });
  window.addEventListener('beforeunload',e=>{if(busy){aborted=true;e.preventDefault();e.returnValue='';}});
  let lastIdlePage=location.href+'|'+identity();
  const timer=setInterval(()=>{if(busy&&(location.href!==jobLocation||identity()!==jobSelf)){aborted=true;status('ページまたはアカウントの変更を検出しました。停止します。');}if(!busy){const next=location.href+'|'+identity();if(next!==lastIdlePage){lastIdlePage=next;$('ack').checked=false;render();}}},1000);
  render();
  const language=globalThis.PostClearLanguage.mount(root);
  globalThis.__postClear={toggle(){host.hidden=!host.hidden;},dispose(){aborted=true;clearInterval(timer);language.dispose();host.remove();}};
})();

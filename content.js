(() => {
  if(globalThis.__postClear){globalThis.__postClear.toggle();return;}
  const C=globalThis.PostClearCore;
  const host=document.createElement('div');
  host.id='post-clear-personal';
  host.style.cssText='position:fixed;right:18px;top:18px;width:min(390px,calc(100vw - 36px));max-height:calc(100vh - 36px);z-index:2147483647;color-scheme:light;';
  const root=host.attachShadow({mode:'closed'});
  root.innerHTML=`<style>
  :host{all:initial;font:13px/1.65 system-ui,sans-serif;color:#27382d}*{box-sizing:border-box}section{background:#f7f8f2;border:1px solid #d5dfcf;border-radius:16px;box-shadow:0 12px 55px #0005;max-height:calc(100vh - 36px);overflow:auto;padding:22px}header{display:flex;align-items:center;justify-content:space-between}h1{font-size:22px;letter-spacing:-.6px;margin:0}h2{font-size:14px;margin:20px 0 8px}.muted{color:#697764;font-size:11px}button,input{font:inherit}button{padding:9px 12px;border:1px solid #ced9c7;background:white;color:#314e37;border-radius:7px;cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}.primary{background:#345e42;color:#fff;border-color:#345e42}.danger{background:#fff0e9;color:#9d4434;border-color:#e8cfc4}.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}input[type=number],input[type=text]{padding:9px;border:1px solid #cdd7c7;border-radius:6px;background:#fff;color:#233324;width:100%}input[type=checkbox]{accent-color:#355d40}label{display:block;margin:9px 0}#list{max-height:210px;overflow:auto;border-top:1px solid #dce3d5;margin:12px 0}.post{padding:10px 0;border-bottom:1px solid #e0e5da;overflow-wrap:anywhere}.post a{color:#436e4a;font-size:11px}.text{white-space:pre-wrap;font-size:12px}.notice{background:#edf0e5;border-radius:8px;padding:10px;margin:12px 0;font-size:11px}#status{white-space:pre-wrap;margin:12px 0;overflow-wrap:anywhere}progress{width:100%;accent-color:#416d46}#confirmbox{padding:12px;background:#fff5ee;border:1px solid #e5cdbf;border-radius:8px;margin-top:12px}[hidden]{display:none!important}a{color:#3f7049}#close{border:0;background:transparent;font-size:19px;padding:0 6px}
  </style><section><header><h1>↗ Tweet Sweep</h1><button id="close" aria-label="閉じる">×</button></header><div class="muted">DELETE TWEETS FOR X · ツイート・ポストの一括削除</div>
  <div class="notice">X画面の削除操作を繰り返します。削除は元に戻せません。Xの非API自動化に関する規則と、アカウント制限のリスクを理解してご利用ください。</div>
  <div id="identity">自分のプロフィールを開いてください。</div><label><input id="all" type="checkbox">∞ 全件を対象にする（件数上限なし）</label><label>今回の最大件数<input id="limit" type="number" min="1" step="1" value="20"></label>
  <div class="row"><label><input id="posts" type="checkbox" checked>投稿・返信・引用</label><label><input id="reposts" type="checkbox" checked>リポスト</label></div>
  <div class="row"><button id="scan" class="primary">候補を読み込む</button><button id="stop" disabled>停止</button></div>
  <p class="muted">先頭からスクロールして収集します。全件モードは、読み込みが進まなくなるまで続けます。返信も含める場合は「返信」タブで実行してください。Xで表示できない履歴の取得は保証できません。</p>
  <h2>削除候補 <span id="count">0</span> 件</h2><div id="list">まだ読み込んでいません。</div><div class="row"><button id="backup" disabled>候補JSONを保存</button><button id="report" disabled>結果を保存</button></div>
  <p class="muted">JSON保存は任意です。保存しなくても削除できます。</p><label><input id="ack" type="checkbox">対象を確認し、削除を取り消せないことを理解しました</label><button id="review" class="danger" disabled>削除の最終確認へ</button>
  <div id="confirmbox" hidden><strong>対象アカウントを確認</strong><p id="phrase"></p><input id="confirm" type="text" autocomplete="off" placeholder="上の文字列を入力"><label><input id="each" type="checkbox">1件ごとにXの確認画面で自分で確定する</label><p class="muted">チェックを外すと、今回の候補すべての削除確定も自動操作します。</p><button id="start" class="danger" disabled>開始</button><button id="cancel">戻る</button></div>
  <progress id="progress" max="1" value="0"></progress><div id="status" role="status">削除はまだ実行していません。</div><p class="muted">タブ切り替え・最小化でも続行します。バックグラウンドではChrome側の制御で遅くなる場合があります。Xタブ内のページ移動・再読み込み・アカウント変更・エラーでは停止します。結果は画面表示による確認です。</p></section>`;
  document.documentElement.append(host);
  const minimize=document.createElement('button');
  minimize.textContent='−';minimize.title='パネルを折りたたむ／開く';
  root.querySelector('header').insertBefore(minimize,root.getElementById('close'));
  minimize.addEventListener('click',e=>{if(!e.isTrusted)return;const section=root.querySelector('section');const collapsed=section.dataset.collapsed!=='true';section.dataset.collapsed=String(collapsed);for(const child of section.children)if(child.tagName!=='HEADER')child.style.display=collapsed?'none':'';minimize.textContent=collapsed?'＋':'−';});
  const $=id=>root.getElementById(id);
  let candidates=[],results=[],busy=false,aborted=false,scanLocation='',scanSelf='',jobLocation='',jobSelf='';
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  const visible=e=>!!e&&e.isConnected&&e.getClientRects().length>0;
  function identity(){return C.account(document.querySelector('[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')||'');}
  function validPage(){const self=identity(),route=location.pathname.match(/^\/([A-Za-z0-9_]{1,15})(?:\/(with_replies|media))?\/?$/);return self&&route&&route[1].toLowerCase()===self?self:null;}
  function guard(){if(aborted)throw Error('停止しました。');if(location.href!==jobLocation||identity()!==jobSelf||validPage()!==jobSelf)throw Error('ページまたはアカウントが変わったため停止しました。');}
  function status(s){$('status').textContent=s;}
  function setBusy(value){busy=value;for(const id of ['scan','all','limit','posts','reposts','backup','ack','review'])$(id).disabled=value;$('limit').disabled=value||$('all').checked;$('stop').disabled=!value;$('close').disabled=value;if(!value)render();}
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
  function render(){const ready=validPage();$('identity').textContent=ready?'対象: @'+ready:'自分のプロフィール（投稿・返信・メディア）を開いてください。';$('count').textContent=candidates.length;$('list').replaceChildren();for(const p of candidates.slice(0,100)){const row=document.createElement('div');row.className='post';const a=document.createElement('a');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=(p.kind==='repost'?'リポスト':'投稿・返信')+' · '+p.id;const t=document.createElement('div');t.className='text';t.textContent=p.text.slice(0,180);row.append(a,t);$('list').append(row)}if(candidates.length>100){const note=document.createElement('p');note.textContent='先頭100件を表示。処理対象は '+candidates.length+' 件です。';$('list').append(note);}if(!candidates.length)$('list').textContent='削除候補はありません。';$('scan').disabled=busy||!ready;$('backup').disabled=busy||!candidates.length;$('report').disabled=!results.length;$('review').disabled=busy||!$('ack').checked||!candidates.length||!ready||scanLocation!==location.href||scanSelf!==ready;$('limit').disabled=busy||$('all').checked;}
  function timelineFingerprint(){return [...document.querySelectorAll('article[data-testid="tweet"] time')].map(t=>t.closest('a[href]')?.getAttribute('href')||'').join('|')+'@'+Math.round(window.scrollY);}
  async function waitFor(fn,timeout=7000){const end=Date.now()+timeout;while(Date.now()<end){guard();const value=fn();if(value)return value;await delay(150)}throw Error('画面の応答を確認できず停止しました。');}
  function save(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function serial(p){const {node,...rest}=p;return rest;}
  function trusted(id,handler){$(id).addEventListener('click',e=>{if(e.isTrusted)handler(e);});}
  trusted('close',()=>{host.hidden=true;});
  trusted('scan',async()=>{
    const limit=$('all').checked?Infinity:Number($('limit').value);if(limit!==Infinity&&(!Number.isSafeInteger(limit)||limit<1)){status('件数は1以上の整数、または∞全件を選んでください。');return;}
    if(!$('posts').checked&&!$('reposts').checked){status('対象の種類を選んでください。');return;}
    jobSelf=validPage();if(!jobSelf)return;jobLocation=location.href;scanLocation=jobLocation;scanSelf=jobSelf;aborted=false;candidates=[];$('ack').checked=false;$('confirmbox').hidden=true;setBusy(true);
    const map=new Map();let stalls=0,last='';window.scrollTo(0,0);
    try{await delay(700);for(let i=0;map.size<limit;i++){guard();const before=map.size;for(const p of records()){if((p.kind==='repost'?!$('reposts').checked:!$('posts').checked)||results.some(r=>r.id===p.id&&r.ok))continue;map.set(p.id,serial(p));if(map.size>=limit)break;}status('候補を収集中: '+map.size+' 件'+(limit===Infinity?' / ∞':' / 上限 '+limit)+' · スクロール '+(i+1));const fingerprint=timelineFingerprint();if(map.size===before&&fingerprint===last)stalls++;else stalls=0;last=fingerprint;if(stalls>=12)break;window.scrollBy(0,Math.max(400,innerHeight*.75));await delay(1100);}
    candidates=[...map.values()];status(candidates.length+' 件を読み込みました。'+(map.size<limit?'読み込みが進まなくなったため収集を終了しました。':'')+'\n候補を確認してください。JSON保存は任意です。');
    }catch(e){candidates=[...map.values()];status(e.message+'\n収集済み '+candidates.length+' 件。');}finally{setBusy(false);}
  });
  trusted('backup',()=>{save('post-sweep-candidates-'+Date.now()+'.json',{account:scanSelf,page:scanLocation,createdAt:new Date().toISOString(),posts:candidates.map(serial)});});
  trusted('report',()=>save('tweet-sweep-results-'+Date.now()+'.json',results));
  for(const id of ['all','limit','posts','reposts'])$(id).addEventListener('change',()=>{if(busy)return;candidates=[];$('confirmbox').hidden=true;render();});
  $('ack').addEventListener('change',()=>{if(!$('ack').checked)$('confirmbox').hidden=true;render();});
  trusted('review',()=>{if($('review').disabled)return;$('phrase').textContent='DELETE @'+scanSelf;$('confirm').value='';$('start').disabled=true;$('start').textContent=$('all').checked?'読み込んだ全'+candidates.length+'件を削除':'今回の'+candidates.length+'件を削除';$('confirmbox').hidden=false;});
  $('confirm').addEventListener('input',()=>{$('start').disabled=$('confirm').value!=='DELETE @'+scanSelf;});
  trusted('cancel',()=>{$('confirmbox').hidden=true;});
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
    if(busy||$('start').disabled||!$('ack').checked||scanLocation!==location.href||validPage()!==scanSelf)return;
    const queue=[...candidates],manual=$('each').checked;jobSelf=scanSelf;jobLocation=scanLocation;aborted=false;setBusy(true);$('confirmbox').hidden=true;$('progress').value=0;$('progress').max=queue.length;let done=0;
    try{for(const p of queue){guard();status((done+1)+' / '+queue.length+' 件目を処理中…');try{results.push(await deleteOne(p,manual));done++;$('progress').value=done;}catch(e){results.push({id:p.id,url:p.url,ok:false,error:e.message,at:new Date().toISOString()});throw e;}await delay(2000);}status('今回の '+done+' 件を処理しました。結果を保存し、X上でも確認してください。');}
    catch(e){status(e.message+'\n今回の処理済み: '+done+' 件。未確認の投稿は削除済みと扱いません。');}
    finally{candidates=candidates.filter(p=>!results.some(r=>r.id===p.id&&r.ok));$('ack').checked=false;setBusy(false);}
  });
  window.addEventListener('beforeunload',e=>{if(busy){aborted=true;e.preventDefault();e.returnValue='';}});
  let lastIdlePage=location.href+'|'+identity();
  const timer=setInterval(()=>{if(busy&&(location.href!==jobLocation||identity()!==jobSelf)){aborted=true;status('ページまたはアカウントの変更を検出しました。停止します。');}if(!busy){const next=location.href+'|'+identity();if(next!==lastIdlePage){lastIdlePage=next;$('confirmbox').hidden=true;render();}}},1000);
  render();
  const language=globalThis.PostClearLanguage.mount(root);
  globalThis.__postClear={toggle(){host.hidden=!host.hidden;},dispose(){aborted=true;clearInterval(timer);language.dispose();host.remove();}};
})();

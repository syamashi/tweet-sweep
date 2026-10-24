const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const core=fs.readFileSync('core.js','utf8'),content=fs.readFileSync('content.js','utf8'),language=fs.readFileSync('language.js','utf8');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<2000;i++){if(fn())return;await pause(5)}throw Error('Fixture timeout');}
function fixture({path='/tester',owner='tester',wrongDialog=false,uiLanguage='ja',preferences={}}={}){
 const dom=new JSDOM('<a data-testid="AppTabBar_Profile_Link" href="/'+owner+'"></a><main></main>',{url:'https://x.com'+path,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let panel,deleted=0;
 w.chrome={i18n:{getUILanguage:()=>uiLanguage},storage:{local:{get:async()=>({...preferences}),set:async values=>Object.assign(preferences,values)}}};
 const attach=w.Element.prototype.attachShadow;w.Element.prototype.attachShadow=function(init){const r=attach.call(this,init);panel=r;return r;};
 w.HTMLElement.prototype.getClientRects=function(){return this.isConnected?[{width:1,height:1}]:[]};
 w.HTMLElement.prototype.scrollIntoView=()=>{};w.scrollTo=()=>{};w.scrollBy=()=>{};
 const nativeTimeout=w.setTimeout.bind(w);w.setTimeout=(fn,ms)=>nativeTimeout(fn,Math.min(ms,2));
 w.fetch=()=>{throw Error('Network must not be used')};
 w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){};
 function article(author,id,{repost=false,html='hello'}={}){
   const a=w.document.createElement('article');a.dataset.testid='tweet';a.innerHTML=(repost?'<div data-testid="socialContext"><a href="/tester">tester reposted</a></div>':'')+'<a href="/'+author+'/status/'+id+'"><time datetime="2026-10-24T00:00:00Z"></time></a><div data-testid="tweetText">'+html+'</div><button data-testid="caret">menu</button>'+(repost?'<button data-testid="unretweet">undo</button>':'');
   a.querySelector('[data-testid="caret"]').onclick=()=>{const menu=w.document.createElement('div');menu.setAttribute('role','menu');menu.innerHTML='<button role="menuitem">削除</button>';menu.querySelector('button').onclick=()=>{menu.remove();const dialog=w.document.createElement('div');dialog.setAttribute('role','alertdialog');dialog.innerHTML='<h2>'+(wrongDialog?'フォローを解除':'ポストを削除しますか？')+'</h2><button data-testid="confirmationSheetConfirm">削除</button>';dialog.querySelector('button').onclick=()=>{deleted++;dialog.remove();a.remove()};w.document.body.append(dialog)};w.document.body.append(menu)};
   if(repost)a.querySelector('[data-testid="unretweet"]').onclick=()=>{const menu=w.document.createElement('div');menu.innerHTML='<button data-testid="unretweetConfirm">リポストを取り消す</button>';menu.querySelector('button').onclick=()=>{deleted++;menu.remove();a.remove()};w.document.body.append(menu)};
   w.document.querySelector('main').append(a);return a;
 }
 // Only the fixture grants synthetic events user trust; shipped code always requires isTrusted.
 w.eval(core);w.eval(language);w.eval(content.replace('if(e.isTrusted)handler(e);','handler(e);'));
 const $=id=>panel.getElementById(id);
 return {dom,w,$,article,get deleted(){return deleted},close(){w.__postClear.dispose();w.close();}};
}
async function scan(f,all=false,limit='10'){f.$('all').checked=all;f.$('limit').value=limit;f.$('scan').click();await until(()=>!f.$('stop').disabled);await until(()=>f.$('stop').disabled);}
function prepare(f,manual=false){f.$('ack').checked=true;f.$('ack').dispatchEvent(new f.w.Event('change'));f.$('review').click();f.$('confirm').value='DELETE @tester';f.$('confirm').dispatchEvent(new f.w.Event('input'));f.$('each').checked=manual;}
(async()=>{
 let f=fixture();const C=f.w.PostClearCore;
 assert.equal(C.account('/home'),null);assert.equal(C.account('/Tester'),'tester');assert.equal(C.permalink('https://evil.example/tester/status/1'),null);assert.equal(C.permalink('/tester/status/123').id,'123');assert.equal(C.classify({author:'other',self:'tester',reposted:false}),null);
 f.article('tester','100',{html:'&lt;img src=x onerror=alert(1)&gt;'});f.article('other','101');f.article('other','102',{repost:true});await scan(f);assert.equal(f.$('count').textContent,'2');assert.equal(f.$('list').querySelector('img'),null);assert.equal(f.$('review').disabled,true);assert.equal(f.deleted,0);
 prepare(f);assert.equal(f.$('start').disabled,false);f.$('start').click();await until(()=>f.$('stop').disabled);assert.equal(f.deleted,2);assert.equal(f.$('count').textContent,'0');f.close();console.log('PASS: own posts only, repost eligibility, text escaping, scan is non-destructive, confirmation without saving, post/repost operations');
 f=fixture({wrongDialog:true});f.article('tester','103');await scan(f);prepare(f);f.$('start').click();await until(()=>f.$('stop').disabled);assert.equal(f.deleted,0);assert.match(f.$('status').textContent,/確認画面を識別/);f.close();console.log('PASS: unrelated confirmation dialog is never confirmed');
 f=fixture();f.article('tester','104');await scan(f);prepare(f,true);f.$('start').click();await until(()=>f.w.document.querySelector('[data-testid="confirmationSheetConfirm"]'));assert.equal(f.deleted,0);f.$('stop').click();await until(()=>f.$('stop').disabled&&f.$('scan').disabled===false);assert.equal(f.deleted,0);f.close();console.log('PASS: manual mode waits for user and stop prevents automatic confirmation');
 f=fixture({path:'/other'});assert.equal(f.$('scan').disabled,true);f.close();console.log('PASS: other profiles cannot be scanned');
 f=fixture();for(let i=0;i<501;i++)f.article('tester',String(1000+i));await scan(f,true);assert.equal(f.$('count').textContent,'501');assert.equal(f.$('list').querySelectorAll('.post').length,100);assert.equal(f.$('limit').disabled,true);assert.equal(f.deleted,0);f.close();console.log('PASS: infinity scan exceeds 500, preview capped without capping queue, no deletion while scanning');
 f=fixture();let pages=0;f.article('tester','2000');f.w.scrollBy=()=>{if(pages<70)f.article('tester',String(2001+pages++));};await scan(f,true);assert.equal(f.$('count').textContent,'71');f.close();console.log('PASS: infinity scan continues beyond 60 scrolls');
 f=fixture();f.article('tester','3000');f.article('tester','3001');await scan(f,true);prepare(f);assert.match(f.$('start').textContent,/全2件/);f.$('start').click();await until(()=>f.$('stop').disabled);assert.equal(f.deleted,2);f.close();console.log('PASS: delete all collected candidates without saving');
 const preferences={};f=fixture({uiLanguage:'en-US',preferences});assert.equal(f.$('scan').textContent,'Load candidates');assert.equal(f.$('language').value,'en');f.article('tester','4000',{html:'日本語の投稿は翻訳しません'});await scan(f);assert.match(f.$('status').textContent,/Loaded 1 candidates/);assert.equal(f.$('list').querySelector('.text').textContent,'日本語の投稿は翻訳しません');f.$('language').value='ja';f.$('language').dispatchEvent(new f.w.Event('change'));await pause(5);assert.equal(f.$('scan').textContent,'候補を読み込む');assert.equal(preferences.language,'ja');f.close();f=fixture({uiLanguage:'en-US',preferences});await pause(5);assert.equal(f.$('scan').textContent,'候補を読み込む');f.close();console.log('PASS: English default, dynamic messages, JP/EN switching, persistence, original post text unchanged');
 const m=JSON.parse(fs.readFileSync('manifest.json'));assert.deepEqual(m.permissions,['activeTab','scripting','storage']);assert.equal(m.host_permissions,undefined);for(const s of [content,core,language])assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/.test(s));console.log('PASS: minimal manifest and no independent network calls');
})().catch(e=>{console.error(e);process.exitCode=1});

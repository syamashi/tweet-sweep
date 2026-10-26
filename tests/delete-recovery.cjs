const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const pause=()=>new Promise(r=>setTimeout(r,2));
async function until(fn){for(let i=0;i<3000;i++){if(fn())return;await pause();}throw Error('Recovery test timed out');}
const clone=x=>JSON.parse(JSON.stringify(x));
const checkpoint=()=>({scope:{self:'tester',page:'https://x.com/tester/all',limit:1,posts:true,reposts:false},results:[{id:'0',account:'tester',ok:true,state:'deleted'}],archive:[['0',{id:'0',date:'2020-01-01',text:'prior'}]],attempted:['0'],refreshes:1});
function background(){
 const local={},session={},events=[],reloads=[],injections=[];let listener,updated,removed,fail=false,failReload=false;
 const store=data=>({get:async name=>({[name]:clone(data[name]??null)}),set:async value=>{if(fail)throw Error('storage full');Object.assign(data,clone(value));events.push('saved');},remove:async name=>{delete data[name];}});
 const chrome={storage:{local:store(local),session:store(session)},runtime:{onMessage:{addListener(fn){listener=fn;}}},tabs:{reload:async id=>{if(failReload)throw Error('reload failed');events.push('reload');reloads.push(id);},onUpdated:{addListener(fn){updated=fn;}},onRemoved:{addListener(fn){removed=fn;}}},scripting:{executeScript:async options=>{injections.push(options);}}};
 vm.runInNewContext(fs.readFileSync('delete-recovery.js','utf8'),{chrome,Date,URL,crypto:{randomUUID:()=>Math.random().toString()}});
 return {local,session,events,reloads,injections,set fail(value){fail=value;},set failReload(value){failReload=value;},send:(message,url='https://x.com/tester/all')=>new Promise(resolve=>listener(message,{tab:{id:9,url}},resolve)),updated:(url='https://x.com/tester/all')=>updated(9,{status:'complete'},{id:9,url}),removed:()=>removed(9)};
}
function page(saved,{auto=true,owner='tester',post=false,error=null}={}){
 const dom=new JSDOM('<a data-testid="AppTabBar_Profile_Link" href="/'+owner+'"></a><main></main>',{url:'https://x.com/tester/all',runScripts:'outside-only'}),w=dom.window;
 let root,deleted=0;const messages=[],exports=[];
 const attach=w.Element.prototype.attachShadow;w.Element.prototype.attachShadow=function(init){root=attach.call(this,init);return root;};
 w.HTMLElement.prototype.getClientRects=function(){return this.isConnected?[{}]:[];};w.scrollTo=()=>{};w.scrollBy=()=>{};
 w.setTimeout=fn=>setTimeout(fn,0);w.PostClearLanguage={mount:()=>({dispose(){}})};
 w.chrome={runtime:{sendMessage:async message=>{messages.push(clone(message));if(message.type==='delete-restore')return {checkpoint:clone(saved),auto};if(message.type==='delete-checkpoint')return error?{error}:{reloading:true};return {ok:true};}}};
 w.Blob=class{constructor(parts){this.parts=parts;}};w.URL.createObjectURL=b=>{exports.push(JSON.parse(b.parts.join('')));return 'blob:test';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
 if(post){const article=w.document.createElement('article');article.dataset.testid='tweet';article.innerHTML='<a href="/tester/status/1"><time datetime="2021-01-01"></time></a><div data-testid="tweetText">new</div><button data-testid="caret">menu</button>';article.querySelector('button').onclick=()=>{const menu=w.document.createElement('div');menu.role='menu';menu.setAttribute('role','menu');menu.innerHTML='<button role="menuitem">削除</button>';menu.querySelector('button').onclick=()=>{menu.remove();const sheet=w.document.createElement('div');sheet.setAttribute('role','alertdialog');sheet.innerHTML='<h2>ポストを削除しますか？</h2><button data-testid="confirmationSheetConfirm">削除</button>';sheet.querySelector('button').onclick=()=>{deleted++;article.remove();sheet.remove();};w.document.body.append(sheet);};w.document.body.append(menu);};w.document.querySelector('main').append(article);}
 w.eval(fs.readFileSync('core.js','utf8'));w.eval(fs.readFileSync('content.js','utf8').replace('if(e.isTrusted)handler(e);','handler(e);'));
 return {w,messages,exports,$:id=>root.getElementById(id),get deleted(){return deleted;},close(){w.__postClear.dispose();w.close();}};
}
(async()=>{
 let b=background();await b.send({type:'delete-checkpoint',checkpoint:checkpoint()});await until(()=>b.reloads.length);assert.equal(b.events.at(-1),'reload');assert.ok(b.local['deleteCheckpoint:9'].archive.length);b.updated();await until(()=>b.injections.length);let response=await b.send({type:'delete-restore'});assert.equal(response.auto,true);assert.equal(response.checkpoint.scope.limit,1);response=await b.send({type:'delete-restore'});assert.equal(response.auto,false);
 b=background();await b.send({type:'delete-checkpoint',checkpoint:checkpoint()});await b.send({type:'delete-cancel'});b.updated();await pause();assert.equal(b.injections.length,0);
 b=background();await b.send({type:'delete-checkpoint',checkpoint:checkpoint()});b.updated('https://x.com/other/all');await until(()=>b.local['deleteCheckpoint:9'].resume===false);assert.equal(b.injections.length,0);
 b=background();await b.send({type:'delete-checkpoint',checkpoint:checkpoint()});delete b.session['deleteResume:9'];b.updated();await until(()=>b.local['deleteCheckpoint:9'].resume===false);assert.equal(b.injections.length,0);
 b=background();await b.send({type:'delete-checkpoint',checkpoint:checkpoint()});b.local['deleteCheckpoint:9'].savedAt=Date.now()-300001;b.updated();await until(()=>b.local['deleteCheckpoint:9'].resume===false);assert.equal(b.injections.length,0);
 b=background();b.failReload=true;await b.send({type:'delete-checkpoint',checkpoint:checkpoint()});await until(()=>b.injections.length);assert.equal(b.local['deleteCheckpoint:9'].resume,false);assert.equal(typeof b.injections[0].func,'function');
 b=background();b.fail=true;response=await b.send({type:'delete-checkpoint',checkpoint:checkpoint()});assert.match(response.error,/storage full/);assert.equal(b.reloads.length,0);
 let p=page(checkpoint(),{post:true});await until(()=>p.messages.some(m=>m.type==='delete-save'));await until(()=>p.$('stop').disabled);assert.equal(p.deleted,1);assert.match(p.$('status').textContent,/削除確認 2 件/);assert.equal(p.messages.find(m=>m.type==='delete-save').checkpoint.scope.limit,0);p.$('backup').click();assert.equal(p.exports[0].length,2);p.close();
 const reappeared=checkpoint();reappeared.results[0].id='1';reappeared.archive[0][0]='1';reappeared.attempted=[];
 p=page(reappeared,{post:true});await until(()=>p.messages.some(m=>m.type==='delete-save'));await until(()=>p.$('stop').disabled);assert.equal(p.deleted,1);assert.match(p.$('status').textContent,/削除確認 1 件/);p.$('backup').click();assert.equal(p.exports[0].length,1);assert.equal(p.exports[0][0].text,'new');p.close();
 const repeated=clone(reappeared);repeated.scope.limit=null;repeated.refreshes=2;p=page(repeated,{post:true});await until(()=>p.messages.some(m=>m.type==='delete-save'));assert.equal(p.deleted,1);assert.equal(p.messages.some(m=>m.type==='delete-checkpoint'),false);assert.equal(p.messages.find(m=>m.type==='delete-save').checkpoint.results.some(r=>r.wasConfirmed),true);p.close();
 p=page(checkpoint(),{owner:'other',post:true});await until(()=>p.$('status').textContent.includes('再開しません'));assert.equal(p.deleted,0);p.close();
 p=page(checkpoint(),{auto:false,post:true});await until(()=>!p.$('backup').disabled);assert.equal(p.deleted,0);assert.equal(p.$('ack').checked,false);p.close();
 p=page(checkpoint());await until(()=>p.messages.some(m=>m.type==='delete-checkpoint'));assert.equal(p.messages.find(m=>m.type==='delete-checkpoint').checkpoint.refreshes,2);assert.equal(p.messages.find(m=>m.type==='delete-checkpoint').checkpoint.scope.limit,1);const unload=new p.w.Event('beforeunload',{cancelable:true});p.w.dispatchEvent(unload);assert.equal(unload.defaultPrevented,false);p.close();
 p=page(checkpoint());await until(()=>!p.$('stop').disabled);p.$('stop').click();await until(()=>p.messages.some(m=>m.type==='delete-save'));assert.equal(p.messages.some(m=>m.type==='delete-cancel'),true);assert.equal(p.messages.some(m=>m.type==='delete-checkpoint'),false);p.close();
 const progressed=checkpoint();progressed.scope.limit=null;progressed.refreshes=2;p=page(progressed,{post:true});await until(()=>p.messages.some(m=>m.type==='delete-checkpoint'));assert.equal(p.deleted,1);assert.equal(p.messages.find(m=>m.type==='delete-checkpoint').checkpoint.refreshes,1);assert.equal(p.messages.find(m=>m.type==='delete-checkpoint').checkpoint.archive.length,2);p.close();
 const exhausted=checkpoint();exhausted.refreshes=2;p=page(exhausted);await until(()=>p.messages.some(m=>m.type==='delete-save'));assert.equal(p.messages.some(m=>m.type==='delete-checkpoint'),false);p.close();
 p=page(checkpoint(),{error:'storage full'});await until(()=>p.messages.some(m=>m.type==='delete-save'));await until(()=>p.$('stop').disabled);assert.match(p.$('status').textContent,/storage full/);assert.equal(p.$('backup').disabled,false);p.close();
 console.log('PASS: checkpoint before reload, one-use same-session resume, cancellation, URL/account guards, storage failure, cumulative JSON, remaining limit and bounded refresh');
})().catch(error=>{console.error(error);process.exitCode=1});

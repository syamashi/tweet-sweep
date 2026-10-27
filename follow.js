(() => {
  globalThis.TweetSweepFollow={mount(root,{isDeleting,onChange}){
    const section=root.querySelector('section'),header=root.querySelector('header');
    const tabs=document.createElement('div');tabs.className='row';tabs.style.margin='12px 0';tabs.innerHTML='<button id="delete-tab" role="tab" aria-selected="true">削除</button><button id="follow-tab" role="tab" aria-selected="false">フォロー</button>';tabs.setAttribute('role','tablist');header.after(tabs);
    const deletion=document.createElement('div');deletion.id='delete-panel';for(const child of [...section.children])if(child!==header&&child!==tabs)deletion.append(child);section.append(deletion);
    const panel=document.createElement('div');panel.id='follow-panel';panel.hidden=true;panel.innerHTML='<p class="muted">収集だけではフォローしません。リストは自動保存。</p><div class="row"><button id="follow-collect">収集する</button><button id="follow-stop" disabled>停止</button></div><label>間隔（秒）<input id="follow-interval" type="number" min="30" max="86400" step="1" value="60"></label><label><input id="follow-ack" type="checkbox">保存リストの人を自動フォローします</label><button id="follow-start" disabled>リストからフォロー</button><p id="follow-status" style="white-space:pre-wrap">待機中</p><details class="muted"><summary>リスト管理</summary><div class="row"><button id="follow-export" disabled>リストを書き出す</button><button id="follow-import">リストを読み込む</button><button id="follow-reset">新しいリスト</button></div><input id="follow-file" type="file" accept=".json,application/json" hidden></details><p class="muted">同じ拡張を上書き更新すればリストは残ります。別フォルダへ移す前に書き出してください。</p>';section.append(panel);
    const $=id=>root.getElementById(id);let job=null,disposed=false,notice='';
    function select(follow){if(isDeleting())return;deletion.hidden=follow;panel.hidden=!follow;$('delete-tab').setAttribute('aria-selected',String(!follow));$('follow-tab').setAttribute('aria-selected',String(follow));}
    tabs.addEventListener('click',e=>{if(e.isTrusted)select(e.target.id==='follow-tab');});
    function render(){if(disposed)return;const running=!!job?.running,queue=job?.queue||[];$('follow-collect').disabled=running||isDeleting();$('follow-start').disabled=running||!$('follow-ack').checked||isDeleting()||!queue.some(p=>p.state==='pending');$('follow-stop').disabled=!running;for(const id of ['follow-reset','follow-import','follow-interval','follow-ack'])$(id).disabled=running;$('follow-export').disabled=running||!queue.length;if(job){$('follow-status').textContent=(notice||job.message||'待機中')+(!job.inFlight&&job.nextAt>Date.now()&&running?'\n次の処理まで '+Math.ceil((job.nextAt-Date.now())/1000)+' 秒':'')+'\n収集 '+queue.length+' 人・フォロー確認 '+queue.filter(x=>x.state==='followed').length+' 人・待ち '+queue.filter(x=>x.state==='pending').length+' 人';}else $('follow-status').textContent=notice||'待機中';}
    async function send(type,extra={}){notice='';try{const response=await chrome.runtime.sendMessage({type,interval:Number($('follow-interval').value),...extra});if(response?.error)throw Error(response.error);if(type==='follow-export'){const url=URL.createObjectURL(new Blob([JSON.stringify(response.data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='tweet-sweep-follow-list-'+response.data.account+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);return;}job=response?.job||null;render();}catch(e){notice=e.message;render();}}
    $('follow-ack').addEventListener('change',render);
    $('follow-start').addEventListener('click',e=>{if(e.isTrusted&&!isDeleting()&&$('follow-ack').checked)send('follow-start');});
    $('follow-collect').addEventListener('click',e=>{if(e.isTrusted&&!isDeleting())send('follow-collect');});
    $('follow-stop').addEventListener('click',e=>{if(e.isTrusted)send('follow-stop');});
    $('follow-reset').addEventListener('click',e=>{if(e.isTrusted&&!job?.running)send('follow-reset');});
    $('follow-export').addEventListener('click',e=>{if(e.isTrusted&&!job?.running)send('follow-export');});
    $('follow-import').addEventListener('click',e=>{if(e.isTrusted&&!job?.running)$('follow-file').click();});
    $('follow-file').addEventListener('change',async()=>{const file=$('follow-file').files?.[0];if(!file||job?.running)return;try{await send('follow-import',{data:JSON.parse(await file.text())});}catch{notice='JSONファイルを読み込めませんでした。';render();}finally{$('follow-file').value='';}});
    const changed=(changes,area)=>{if(disposed)return;if(area==='local'&&changes.followJob){job=changes.followJob.newValue||null;render();onChange();}};chrome.storage.onChanged.addListener(changed);
    chrome.storage.local.get('followJob').then(saved=>{if(disposed)return;job=saved.followJob||null;if(job?.interval)$('follow-interval').value=job.interval;render();onChange();});render();
    const progressTimer=setInterval(render,1000);
    return {dispose(){clearInterval(progressTimer);disposed=true;chrome.storage.onChanged.removeListener(changed);},get running(){return !!job?.running;}};
  }};
})();

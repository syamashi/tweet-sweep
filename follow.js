(() => {
  globalThis.TweetSweepFollow={mount(root,{isDeleting,onChange}){
    const section=root.querySelector('section'),header=root.querySelector('header');
    const tabs=document.createElement('div');tabs.className='row';tabs.style.margin='12px 0';tabs.innerHTML='<button id="delete-tab" role="tab" aria-selected="true">削除</button><button id="follow-tab" role="tab" aria-selected="false">フォロー</button>';tabs.setAttribute('role','tablist');header.after(tabs);
    const deletion=document.createElement('div');deletion.id='delete-panel';for(const child of [...section.children])if(child!==header&&child!==tabs)deletion.append(child);section.append(deletion);
    const panel=document.createElement('div');panel.id='follow-panel';panel.hidden=true;panel.innerHTML='<p class="muted">いいねした人を順にフォロー。待ち時間に次の投稿を調べます。</p><label>間隔（秒）<input id="follow-interval" type="number" min="30" max="86400" step="1" value="60"></label><label><input id="follow-ack" type="checkbox">いいねした人を自動フォローします</label><div class="row"><button id="follow-start">開始・再開</button><button id="follow-stop" disabled>停止</button><button id="follow-reset">新しいリスト</button></div><p id="follow-status" style="white-space:pre-wrap">待機中</p><p class="muted">専用のXタブで動作します。Xの制限・認証時は停止。PCのスリープ中は動きません。</p>';section.append(panel);
    const $=id=>root.getElementById(id);let job=null,disposed=false;
    function select(follow){if(isDeleting())return;deletion.hidden=follow;panel.hidden=!follow;$('delete-tab').setAttribute('aria-selected',String(!follow));$('follow-tab').setAttribute('aria-selected',String(follow));}
    tabs.addEventListener('click',e=>{if(e.isTrusted)select(e.target.id==='follow-tab');});
    function render(){if(disposed)return;const running=!!job?.running;$('follow-start').disabled=running||!$('follow-ack').checked||isDeleting();$('follow-stop').disabled=!running;$('follow-reset').disabled=running;$('follow-interval').disabled=running;$('follow-ack').disabled=running;if(job){const queue=job.queue||[];$('follow-status').textContent=(job.message||'待機中')+'\nフォロー確認 '+queue.filter(x=>x.state==='followed').length+' 人・待ち '+queue.filter(x=>x.state==='pending').length+' 人';}}
    async function send(type){try{const response=await chrome.runtime.sendMessage({type,interval:Number($('follow-interval').value)});if(response?.error)throw Error(response.error);job=response?.job||null;render();}catch(e){$('follow-status').textContent=e.message;}}
    $('follow-ack').addEventListener('change',render);
    $('follow-start').addEventListener('click',e=>{if(e.isTrusted&&!isDeleting()&&$('follow-ack').checked)send('follow-start');});
    $('follow-stop').addEventListener('click',e=>{if(e.isTrusted)send('follow-stop');});
    $('follow-reset').addEventListener('click',e=>{if(e.isTrusted&&!job?.running)send('follow-reset');});
    const changed=(changes,area)=>{if(disposed)return;if(area==='local'&&changes.followJob){job=changes.followJob.newValue||null;render();onChange();}};chrome.storage.onChanged.addListener(changed);
    chrome.storage.local.get('followJob').then(saved=>{if(disposed)return;job=saved.followJob||null;if(job?.interval)$('follow-interval').value=job.interval;render();onChange();});render();
    return {dispose(){disposed=true;chrome.storage.onChanged.removeListener(changed);},get running(){return !!job?.running;}};
  }};
})();

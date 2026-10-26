(() => {
  const messages={
    '投稿を調査中…':'Scanning posts…',
    'フォローを確認中…':'Checking follow status…',
    '追加候補を待っています。元のページを再確認します。':'Waiting for more people. The original source will be checked again.',
    'JSON保存は任意。読み込み停止時は記録を保存して一覧を読み直します。Xの非API自動化規則をご確認ください。':'JSON export is optional. If loading stalls, records are saved before refreshing the timeline. Review X’s non-API automation rules.',
    '記録を保存して一覧を読み直します…':'Saving records and refreshing the timeline…',
    '保存時とアカウント・ページが違うため再開しません。':'Not resumed: the account or page differs from the saved run.',
    '一覧の再読み込みに失敗しました。記録は保存されています。':'Timeline refresh failed. Your records have been saved.',
    '記録の自動保存に失敗しました。JSONを保存してください。':'Automatic record saving failed. Please save JSON.',
    '一覧の読み込みが止まりました。未表示の投稿が残る場合があります。':'Timeline loading stopped. More posts may remain unloaded.',
    '投稿表示が変わったため保留しました。':'Held this post because its display changed.',
    '削除':'Delete','フォロー':'Follow','間隔（秒）':'Interval (seconds)',
    'いいねした人を順にフォロー。待ち時間に次の投稿を調べます。':'Follow people who liked your posts; scan more posts between follows.',
    '自分の投稿にいいねした人を順にフォロー。リストは保存されます。':'Follow people who liked your posts. The queue is saved.',
    'いいねした人を自動フォローします':'Automatically follow people who liked my posts',
    '開始・再開':'Start / resume','新しいリスト':'New queue',
    '専用のXタブで動作します。Xの制限・認証時は停止。PCのスリープ中は動きません。':'Runs in a dedicated X tab. Stops on X restrictions or verification. Pauses while the PC sleeps.',
    '開始します…':'Starting…','処理中…':'Processing…','完了しました。':'Complete.',
    '次のフォローを待っています…':'Waiting for the next follow…',
    'Chromeが再起動されました。再開してください。':'Chrome restarted. Resume to continue.',
    '一覧の読み込みを待っています…':'Waiting for the timeline to load…',
    'メニュー・確認画面を閉じると自動で続行します。':'Close the open menu or dialog to continue automatically.',
    '先頭の一覧が安定しないため停止しました。':'Stopped: the top of the timeline did not settle.',
    '投稿の削除メニュー':'the post deletion menu','削除確認ボタン':'the deletion confirmation button',
    '削除後の投稿の消失':'the post disappearing after deletion','リポスト解除メニュー':'the Undo repost menu','リポスト解除後の表示':'the display after undoing the repost',
    '画面の応答を確認できず停止しました。開いているメニュー・確認画面を確認してください。':'Stopped: could not verify the page response. Check any open menu or confirmation dialog.',
    'Xの応答を待っています…':'Waiting for X to respond…',
    'JSONを保存':'Save JSON',
    'このアカウントの投稿を削除します（取り消し不可）':'Delete posts from this account (permanent)',
    'プレビュー':'Preview','投稿JSONを保存':'Save posts JSON',
    '候補を見る':'Preview candidates','読み込み不要。そのまま削除を開始できます。':'No preload needed. Start deleting directly.',
    '全件を順次削除':'Delete all progressively','追加の読み込みを待っています…':'Waiting for more items…',
    '処理中はXのタブを表示してください。':'Keep this X tab visible.',
    'タブ切替・最小化で停止することがあります。':'Switching tabs or minimizing may interrupt processing.',
    '∞ 全件':'∞ All','件数':'Item limit',
    '返信も含めるなら「返信」タブへ。対象はXで読み込めた範囲です。':'Use the Replies tab to include replies. Only loaded items are included.',
    '対象を確認しました（削除は取り消せません）':'I reviewed the items (deletion is permanent)',
    '削除する':'Delete','下の文字列を入力':'Type the phrase below','1件ずつ手動確認':'Confirm each item manually','待機中':'Ready','注意事項':'Notes',
    '保存は任意。バックグラウンドでも続行しますが、Chromeにより遅くなる場合があります。Xの非API自動化規則をご確認ください。':'Saving is optional. Background processing may be slower. Review X’s non-API automation rules.',
    'タブ切り替え・最小化でも続行します。バックグラウンドではChrome側の制御で遅くなる場合があります。Xタブ内のページ移動・再読み込み・アカウント変更・エラーでは停止します。結果は画面表示による確認です。':'Continues when you switch tabs or minimize. Chrome may slow background processing. Navigation within the X tab, reloading, account changes or errors stop processing. Results are verified through the page display.',
    '⚠ タブ切り替え・最小化で処理が停止します':'⚠ Switching tabs or minimizing stops processing',
    '収集・削除中はXのタブを処理中はXのタブを表示してください。停止後は自動再開しません。':'Keep the X tab visible while scanning or deleting. Processing does not resume automatically.',
    '⚠ 実行中はこのXタブを開いたままにしてください':'⚠ Keep this X tab visible while running',
    '別タブへの切り替え・ウィンドウの最小化で停止します。再開には、戻って再操作が必要です。':'Switching tabs or minimizing the window stops processing. Return to this tab and restart manually.',
    '閉じる':'Close','パネルを折りたたむ／開く':'Collapse / expand panel',
    'DELETE TWEETS FOR X · ツイート・ポストの一括削除':'DELETE TWEETS FOR X · Bulk post cleanup',
    'X画面の削除操作を繰り返します。削除は元に戻せません。Xの非API自動化に関する規則と、アカウント制限のリスクを理解してご利用ください。':'Repeats deletion actions on the X website. Deletion is permanent. Review X’s rules on non-API automation and understand the risk of account restrictions.',
    '自分のプロフィールを開いてください。':'Open your own X profile.',
    '自分のプロフィール（投稿・返信・メディア）を開いてください。':'Open your own profile (Posts, Replies or Media).',
    '∞ 全件を対象にする（件数上限なし）':'∞ All loaded posts (no item limit)',
    '今回の最大件数':'Maximum items this run','投稿・返信・引用':'Posts, replies & quotes','リポスト':'Reposts',
    '候補を読み込む':'Load candidates','停止':'Stop',
    '先頭からスクロールして収集します。全件モードは、読み込みが進まなくなるまで続けます。返信も含める場合は「返信」タブで実行してください。Xで表示できない履歴の取得は保証できません。':'Scans from the top until loading stops or the item limit is reached. Use your Replies tab to include replies. History that X does not display cannot be guaranteed.',
    '削除候補':'Candidates','件':'items','まだ読み込んでいません。':'No candidates loaded yet.',
    '候補JSONを保存':'Save candidates JSON','結果を保存':'Save results',
    'JSON保存は任意です。保存しなくても削除できます。':'Saving JSON is optional. You can proceed without saving.',
    '対象を確認し、削除を取り消せないことを理解しました':'I reviewed the candidates and understand deletion is permanent.',
    '削除の最終確認へ':'Review deletion','対象アカウントを確認':'Confirm the target account',
    '上の文字列を入力':'Type the phrase above',
    '1件ごとにXの確認画面で自分で確定する':'Confirm each item myself on X',
    'チェックを外すと、今回の候補すべての削除確定も自動操作します。':'Uncheck to automatically confirm deletion for all candidates in this run.',
    '開始':'Start','戻る':'Back','削除はまだ実行していません。':'No deletions have been performed.',
    '停止・エラー・ページ移動時は自動再開しません。処理中はこのタブを処理中はXのタブを表示してください。結果の「画面で消失を確認」はAPIによる確認ではありません。':'No automatic restart after stopping, errors or navigation. Keep this tab visible. Disappearance from the page is not API verification.',
    '(本文なし・メディア投稿)':'(No text / media post)','投稿・返信':'Posts / replies','削除候補はありません。':'No candidates.',
    '停止しました。':'Stopped.','タブが非表示になったため停止しました。':'Stopped because the tab is hidden.',
    'ページまたはアカウントが変わったため停止しました。':'Stopped because the page or account changed.',
    '画面の応答を確認できず停止しました。':'Stopped: could not verify the page response.',
    '件数は1以上の整数、または∞全件を選んでください。':'Enter a positive whole number or choose ∞ All.',
    '対象の種類を選んでください。':'Choose at least one item type.',
    '読み込みが進まなくなったため収集を終了しました。':'Collection stopped because loading made no further progress.',
    '候補を確認してください。JSON保存は任意です。':'Review the candidates. Saving JSON is optional.',
    '停止要求を受け付けました。確定済みの削除は取り消せません。':'Stop requested. Deletions already confirmed cannot be undone.',
    '既存のメニューや確認画面を閉じてから再開してください。':'Close any open menu or confirmation dialog before restarting.',
    '投稿の種類が変化したため停止しました。':'Stopped because the item type changed.',
    'リポスト解除ボタンを確認できません。':'Could not identify the Undo repost button.',
    'Xの「リポストを取り消す」を自分で押してください。':'Click Undo repost on X to confirm this item.',
    '自分の投稿ではないため停止しました。':'Stopped: this is not your own post.',
    '投稿メニューを確認できません。':'Could not identify the post menu.',
    '投稿表示が変わったため停止しました。':'Stopped because the displayed post changed.',
    '投稿削除の確認画面を識別できず停止しました。':'Stopped: could not identify the post deletion confirmation.',
    'Xの確認画面で「削除」を自分で押してください。':'Click Delete in the X confirmation dialog.',
    '画面で対象の消失またはリポスト解除を確認':'Observed disappearance or repost removal on the page',
    '未確認の投稿は削除済みと扱いません。':'Unverified items are not marked as deleted.',
    'ページまたはアカウントの変更を検出しました。停止します。':'Page or account change detected. Stopping.'
  };
  const patterns=[
    [/^次の処理まで (\d+) 秒$/,(_,n)=>'Next step in '+n+' seconds'],
    [/^収集 (\d+) 人・フォロー確認 (\d+) 人・待ち (\d+) 人$/,(_,total,done,pending)=>total+' collected · '+done+' follows confirmed · '+pending+' queued'],
    [/^フォロー確認 (\d+) 人・待ち (\d+) 人$/,(_,done,pending)=>done+' follows confirmed · '+pending+' queued'],
    [/^投稿 (\d+) 件を取得しました。$/,(_,n)=>'Collected '+n+' posts.'],
    [/^いいねした人を取得中: (\d+) \/ (\d+) 投稿$/,(_,n,total)=>'Collecting people: '+n+' / '+total+' posts'],
    [/^@([\w]+) をフォローしました$/,(_,name)=>'Followed @'+name],
    [/^@([\w]+) はフォロー・申請済み$/,(_,name)=>'Already following or requested @'+name],
    [/^順次削除中: (\d+) 件・未確認 (\d+) 件$/,(_,done,skipped)=>'Deleting: '+done+' confirmed · '+skipped+' unconfirmed'],
    [/^未確認の投稿を保留して続行します。未確認 (\d+) 件$/,(_,n)=>'Holding this item and continuing. '+n+' unconfirmed.'],
    [/^削除確認 (\d+) 件・未確認 (\d+) 件。未確認の投稿は次回再確認してください。$/,(_,done,skipped)=>done+' confirmed · '+skipped+' unconfirmed. Recheck unconfirmed items next run.'],
    [/^(.+)を確認できず停止しました。開いているメニュー・確認画面を確認してください。$/,(_,phase)=>'Stopped: could not verify '+translate(phase)+'. Check any open menu or confirmation dialog.'],
    [/^最大(\d+)件を削除$/,(_,n)=>'Delete up to '+n+' items'],
    [/^順次削除中: (\d+) 件$/,(_,n)=>'Deleting progressively: '+n+' items'],
    [/^対象: @(.+)$/,(_,a)=>'Account: @'+a],
    [/^先頭100件を表示。処理対象は (\d+) 件です。$/,(_,n)=>'Showing the first 100. All '+n+' candidates are included.'],
    [/^候補を収集中: (\d+) 件 \/ (∞|上限 \d+) · スクロール (\d+)$/,(_,n,l,s)=>'Collecting: '+n+' / '+l.replace('上限 ','limit ')+' · scroll '+s],
    [/^(\d+) 件を読み込みました。(.*)$/,(_,n,rest)=>'Loaded '+n+' candidates. '+translate(rest)],
    [/^収集済み (\d+) 件。$/,(_,n)=>'Collected '+n+' candidates.'],
    [/^読み込んだ全(\d+)件を削除$/,(_,n)=>'Delete all '+n+' loaded items'],
    [/^今回の(\d+)件を削除$/,(_,n)=>'Delete '+n+' items'],
    [/^候補 (\d+) を再表示できず停止しました。$/,(_,id)=>'Stopped: could not redisplay candidate '+id+'.'],
    [/^(\d+) \/ (\d+) 件目を処理中…$/,(_,n,total)=>'Processing '+n+' / '+total+'…'],
    [/^今回の (\d+) 件を処理しました。結果を保存し、X上でも確認してください。$/,(_,n)=>'Processed '+n+' items. Optionally save results and verify on X.'],
    [/^累計の削除確認: (\d+) 件。(.*)$/,(_,n,rest)=>'Total confirmed: '+n+'. '+translate(rest)],
    [/^今回の処理済み: (\d+) 件。(.*)$/,(_,n,rest)=>'Processed this run: '+n+'. '+translate(rest)],
    [/^(リポスト|投稿・返信) · (\d+)$/,(_,kind,id)=>(kind==='リポスト'?'Repost':'Post / reply')+' · '+id]
  ];
  function translate(value){if(value.includes('\n'))return value.split('\n').map(translate).join('\n');const key=value.trim();if(messages[key])return value.replace(key,messages[key]);for(const [pattern,replace] of patterns)if(pattern.test(key))return key.replace(pattern,replace);return value;}
  function mount(root){
    const select=document.createElement('select');select.id='language';select.setAttribute('aria-label','Language / 言語');select.style.cssText='font:12px system-ui;border:1px solid #ced9c7;border-radius:6px;padding:5px;background:white;color:#314e37;max-width:100px';select.innerHTML='<option value="ja">日本語</option><option value="en">English</option>';
    root.querySelector('header').insertBefore(select,root.getElementById('close'));
    let lang=(globalThis.chrome?.i18n?.getUILanguage?.()||navigator.language||'en').toLowerCase().startsWith('ja')?'ja':'en';
    const originals=new WeakMap(),attrs=new WeakMap();
    function apply(){
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
      while((node=walker.nextNode())){if(node.parentElement?.closest('style,script,select,.text'))continue;const prev=originals.get(node);const original=prev&&node.data===prev.output?prev.original:node.data;const output=lang==='en'?translate(original):original;originals.set(node,{original,output});if(node.data!==output)node.data=output;}
      for(const el of root.querySelectorAll('[placeholder],[title],[aria-label]')){if(el===select)continue;const cache=attrs.get(el)||{};for(const attr of ['placeholder','title','aria-label']){if(!el.hasAttribute(attr))continue;const value=el.getAttribute(attr),old=cache[attr],original=old&&old.output===value?old.original:value,output=lang==='en'?translate(original):original;cache[attr]={original,output};if(value!==output)el.setAttribute(attr,output);}attrs.set(el,cache);}
      root.querySelector('section').lang=lang;select.value=lang;
    }
    const observer=new MutationObserver(()=>apply());observer.observe(root,{subtree:true,childList:true,characterData:true});
    select.addEventListener('change',()=>{lang=select.value==='ja'?'ja':'en';apply();globalThis.chrome?.storage?.local?.set({language:lang}).catch(()=>{});});
    apply();globalThis.chrome?.storage?.local?.get('language').then(saved=>{if(saved.language==='ja'||saved.language==='en'){lang=saved.language;apply();}}).catch(()=>{});
    return {dispose(){observer.disconnect();},get language(){return lang;}};
  }
  globalThis.PostClearLanguage={mount,translate};
})();

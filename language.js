(() => {
  const messages={
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
    '停止・エラー・ページ移動時は自動再開しません。処理中はこのタブを表示したままにしてください。結果の「画面で消失を確認」はAPIによる確認ではありません。':'No automatic restart after stopping, errors or navigation. Keep this tab visible. Disappearance from the page is not API verification.',
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

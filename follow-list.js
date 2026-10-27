(() => {
  const reserved=new Set(['home','explore','notifications','messages','i','settings','search','compose','login','logout']);
  function handle(value){const text=String(value||'').replace(/^@/,'').toLowerCase();if(!/^[a-z0-9_]{1,15}$/.test(text)||reserved.has(text))throw Error('リストのアカウント名が不正です。');return text;}
  function people(entries,account){
    if(!Array.isArray(entries))throw Error('フォローリストの形式が違います。');
    const result=new Map(),rank={pending:0,existing:1,followed:2};
    for(const entry of entries){
      const name=handle(entry?.handle);if(name===account)continue;
      if(!Object.hasOwn(rank,entry.state))throw Error('フォロー状態の形式が違います。');
      const item={handle:name,state:entry.state};
      try{const source=new URL(entry.sourceUrl),match=source.pathname.match(new RegExp('^/'+account+'/status/([0-9]+)/likes/?$','i'));if(source.origin==='https://x.com'&&match)item.sourceUrl='https://x.com/'+account+'/status/'+match[1]+'/likes';}catch{}
      const prior=result.get(name);if(!prior)result.set(name,item);else{if(rank[item.state]>rank[prior.state])prior.state=item.state;if(!prior.sourceUrl&&item.sourceUrl)prior.sourceUrl=item.sourceUrl;}
    }
    return [...result.values()];
  }
  function decode(value){if(value?.format!=='tweet-sweep-follow-list'||value.version!==1)throw Error('Tweet SweepのフォローリストJSONを選んでください。');const account=handle(value.account);return {account,people:people(value.people,account)};}
  function encode(job){const account=handle(job.account);return {format:'tweet-sweep-follow-list',version:1,account,people:people(job.queue||[],account)};}
  function merge(existing,incoming){const rank={pending:0,existing:1,followed:2},result=new Map(existing.map(p=>[p.handle,{...p}]));for(const person of incoming){const prior=result.get(person.handle);if(!prior)result.set(person.handle,{...person});else{if(rank[person.state]>rank[prior.state])prior.state=person.state;if(!prior.sourceUrl&&person.sourceUrl)prior.sourceUrl=person.sourceUrl;}}return [...result.values()];}
  globalThis.TweetSweepFollowList={encode,decode,merge};
})();

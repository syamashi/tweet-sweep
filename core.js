(() => {
  const reserved = new Set(['home','explore','notifications','messages','i','settings','search','compose','login','logout']);
  function account(path) {
    const match=String(path).match(/^\/([A-Za-z0-9_]{1,15})\/?$/);
    return match&&!reserved.has(match[1].toLowerCase())?match[1].toLowerCase():null;
  }
  function permalink(href) {
    try {const u=new URL(href,'https://x.com');if(u.origin!=='https://x.com')return null;
      const m=u.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/status\/(\d+)(?:\/.*)?$/);
      return m?{author:m[1].toLowerCase(),id:m[2],url:'https://x.com/'+m[1]+'/status/'+m[2]}:null;
    }catch{return null;}
  }
  function classify({author,self,reposted,reply}) {
    if(reposted)return 'repost';
    if(author!==self)return null;
    return reply?'reply':'post';
  }
  globalThis.PostClearCore=Object.freeze({account,permalink,classify});
})();

chrome.action.onClicked.addListener(async tab => {
  if (!tab.id || !/^https:\/\/x\.com\//.test(tab.url || '')) {
    await chrome.action.setBadgeText({tabId:tab.id,text:'X'});
    await chrome.action.setTitle({tabId:tab.id,title:'x.comで自分のプロフィールを開いてから押してください'});
    return;
  }
  try {
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['core.js','language.js','content.js']});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
  } catch {
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setTitle({tabId:tab.id,title:'Xを再読み込みしてから、もう一度押してください'});
  }
});

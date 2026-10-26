const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
async function open(url,{panelOpen=false,profile='/tester',leave=false}={}){
 let action,current={id:1,url,status:'complete'};const navigations=[],injections=[],badges=[];
 const chrome={action:{onClicked:{addListener(fn){action=fn;}},setBadgeText:async x=>badges.push(x.text),setTitle:async()=>{}},tabs:{update:async(id,data)=>{navigations.push(data.url);current={id,url:leave?'https://x.com/home':data.url,status:'complete'};},get:async()=>current},scripting:{executeScript:async options=>{if(options.files){injections.push(options.files);return [];}return [{result:{profile,panelOpen}}];}},alarms:{onAlarm:{addListener(){}}},runtime:{onStartup:{addListener(){}},onMessage:{addListener(){}}}};
 vm.runInNewContext(fs.readFileSync('background.js','utf8'),{chrome,URL,Date,setTimeout});await action({id:1,url});return {navigations,injections,badges};
}
(async()=>{
 let result=await open('https://x.com/TeStEr/?sort=latest');assert.deepEqual(result.navigations,['https://x.com/tester/all']);assert.equal(result.injections.length,1);
 for(const url of ['https://x.com/tester/all','https://x.com/tester/with_replies','https://x.com/tester/media','https://x.com/other']){result=await open(url);assert.equal(result.navigations.length,0);assert.equal(result.injections.length,1);}
 result=await open('https://x.com/tester',{panelOpen:true});assert.equal(result.navigations.length,0);assert.equal(result.injections.length,1);
 result=await open('https://x.com/tester',{profile:null});assert.equal(result.navigations.length,0);
 result=await open('https://x.com/tester',{leave:true});assert.equal(result.injections.length,0);assert.deepEqual(result.badges,['!']);
 console.log('PASS: defaults own profile to All; preserves explicit tabs, other accounts and existing panel records; aborts if navigation changes');
})().catch(e=>{console.error(e);process.exitCode=1});

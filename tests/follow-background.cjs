const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function fixture(){
 const state={followJob:{running:true,token:'test',account:'tester',phase:'likes',source:'https://x.com/tester',posts:[{url:'https://x.com/tester/status/1/likes'}],postIndex:0,queue:[],interval:60,tabId:5,nextAt:0}},alarms=[],tabs=new Map([[5,{id:5,url:'https://x.com/tester/status/1/likes',status:'complete'}]]);
 let message,workerResult={items:[{handle:'friend',state:'pending'},{handle:'friend',state:'pending'}]};
 const clone=x=>JSON.parse(JSON.stringify(x));
 const chrome={action:{onClicked:{addListener(){}}},storage:{local:{get:async()=>clone(state),set:async value=>Object.assign(state,clone(value)),remove:async key=>delete state[key]}},alarms:{create:async(name,options)=>alarms.push(options),clear:async()=>{},onAlarm:{addListener(){}}},runtime:{onStartup:{addListener(){}},onMessage:{addListener(fn){message=fn;}}},tabs:{get:async id=>clone(tabs.get(id)),update:async(id,value)=>{Object.assign(tabs.get(id),value);},create:async data=>{const tab={id:6,...data,status:'complete'};tabs.set(6,tab);return tab;}},scripting:{executeScript:async options=>options.files?[{}]:[{result:options.args?clone(workerResult):'/tester'}]}};
 const context=vm.createContext({chrome,crypto:{randomUUID:()=>Math.random().toString()},Date,URL,setTimeout,console});vm.runInContext(fs.readFileSync('background.js','utf8'),context);
 return {state,alarms,tabs,set result(value){workerResult=value;},tick:()=>vm.runInContext('followTick()',context),send:data=>new Promise(resolve=>message(data,{tab:{id:5,url:'https://x.com/tester'}},resolve))};
}
(async()=>{
 let f=fixture();await f.tick();assert.equal(f.state.followJob.queue.length,1);assert.equal(f.state.followJob.postIndex,1);assert.equal(f.state.followJob.inFlight,false);assert.ok(f.state.followJob.nextAt>Date.now()+59000);
 f.state.followJob.nextAt=0;f.result={handle:'friend',state:'followed'};await f.tick();assert.equal(f.state.followJob.queue[0].state,'followed');assert.equal(f.tabs.get(5).url,'https://x.com/friend');
 f.state.followJob.nextAt=0;await f.tick();assert.equal(f.state.followJob.running,false);assert.equal(f.state.followJob.message,'完了しました。');
 f=fixture();f.state.followJob.inFlight=true;await f.tick();assert.equal(f.state.followJob.running,false);assert.match(f.state.followJob.message,/中断/);
 f=fixture();const token=f.state.followJob.token;await f.send({type:'follow-stop'});assert.equal(f.state.followJob.running,false);assert.notEqual(f.state.followJob.token,token);await f.send({type:'follow-reset'});assert.equal(f.state.followJob,undefined);
 f=fixture();f.state.followJob.running=false;let response=await f.send({type:'follow-start',interval:1});assert.match(response.error,/30/);response=await f.send({type:'follow-start',interval:60});assert.equal(response.job.running,true);assert.equal(response.job.account,'tester');
 console.log('PASS: durable deduplicated queue, scheduled interval, completion, interrupted-step stop, explicit stop/reset and resume');
})().catch(e=>{console.error(e);process.exitCode=1});

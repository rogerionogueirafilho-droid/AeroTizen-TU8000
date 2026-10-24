const fs = require('fs');
const vm = require('vm');
const {EventEmitter} = require('events');
const assert = require('node:assert/strict');
let clock = 1000, launches = [], timeouts = [], interval, requests = [];
const http = {
  createServer:()=>({on:()=>{},listen:()=>{},close:()=>{}}),
  get:(options, callback)=>{
    const req = new EventEmitter();
    req.setTimeout = ()=>{}; req.destroy = ()=>{};
    requests.push(callback);
    return req;
  }
};
const context = {
  module:{exports:{}}, Date:{now:()=>clock},
  setTimeout:(fn, delay)=>{const timer={fn,delay};timeouts.push(timer);return timer;},
  setInterval:fn=>{interval=fn;}, clearTimeout:timer=>{if(timer)timer.cancelled=true;},
  require:name=>{assert.equal(name,'http');return http;},
  tizen:{application:{launch:(id,ok)=>{launches.push(id);ok();}}}
};
function respond(power){
  const response = new EventEmitter();
  assert(requests.length, 'Expected a power-state request');
  requests.shift()(response);
  response.emit('data',JSON.stringify({device:{PowerState:power}}));
  response.emit('end');
}
function runTimer(delay){
  const at = timeouts.findIndex(t=>!t.cancelled && t.delay===delay);
  assert(at>=0,'Expected scheduled launch after '+delay);
  timeouts.splice(at,1)[0].fn();
}
function tick(power,elapsed=2000){clock+=elapsed;interval();respond(power);}
vm.runInNewContext(fs.readFileSync('launcher/service/bootstrap.js','utf8'),context);
context.module.exports.onStart();
respond('on');
assert.equal(launches.length,0);
runTimer(1000);
assert.deepEqual(launches,['DclHome001.Home']);
for(let i=0;i<60;i++)tick('on');
assert.equal(launches.length,1,'Ordinary usage must not relaunch the UI');
// TU8000 keeps the process alive: standby is not a timer pause or a service restart.
for(let i=0;i<10;i++)tick('standby');
assert.equal(launches.length,1);
tick('on');runTimer(5000);
assert.equal(launches.length,2,'Power-on must launch even without process suspension');
for(let i=0;i<10;i++)tick('on');
assert.equal(launches.length,2,'Power-on should launch only once');
tick('standby');tick('on');tick('standby');
assert(!timeouts.some(t=>!t.cancelled && t.delay===5000),'Power-off must cancel a pending launch');
tick('on',20000);runTimer(5000);
assert.equal(launches.length,3,'Resume and power transition must coalesce');
context.module.exports.onStop();
console.log('Startup passed: boot, continuous standby/on, no loop, cancellation and resume.');

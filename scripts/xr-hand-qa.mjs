import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const results=[];
function cli(domain,action,input){const args=['@iwsdk/cli',domain,action];if(input)args.push('--input-json',JSON.stringify(input));const raw=execFileSync('npx',args,{encoding:'utf8',timeout:25000});const r=JSON.parse(raw);results.push({domain,action,input,result:r});if(!r.ok)throw Error(raw);return r;}
try{
 cli('xr','enter');cli('xr','status');cli('xr','set-input-mode',{mode:'hand'});
 const device='hand-right';
 cli('xr','set-transform',{device,position:{x:-.75,y:1.265,z:-1.25},orientation:{pitch:0,yaw:0,roll:0}});
 cli('xr','set-select-value',{device,value:1,duration:.2});
 for(const [x,y] of [[.36,1.265],[.36,1.365],[-.75,1.365],[-.75,1.265]])cli('xr','animate-to',{device,position:{x,y,z:-1.25},duration:.7});
 cli('xr','set-select-value',{device,value:0,duration:.2});
 cli('xr','get-hand-state',{device});
 writeFileSync('docs/evidence/xr-hand-qa.json',JSON.stringify(results,null,2));console.log('XR hand drawing input sequence executed; assert game result separately.');
}catch(error){writeFileSync('docs/evidence/xr-hand-qa.json',JSON.stringify({results,error:String(error)},null,2));throw error;}

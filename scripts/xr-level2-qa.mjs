import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const evidence=[];
function cli(domain,action,input){const args=['@iwsdk/cli',domain,action];if(input)args.push('--input-json',JSON.stringify(input));const raw=execFileSync('npx',args,{encoding:'utf8',timeout:25000});const r=JSON.parse(raw);evidence.push({domain,action,input,result:r});if(!r.ok)throw Error(raw);return r;}
const device='hand-right';
function draw(end){cli('xr','set-transform',{device,position:{x:-.81,y:1.265,z:-1.25},orientation:{pitch:0,yaw:0,roll:0}});cli('xr','set-select-value',{device,value:1,duration:.2});for(const [x,y] of [[end,1.265],[end,1.365],[-.81,1.365],[-.81,1.265]])cli('xr','animate-to',{device,position:{x,y,z:-1.25},duration:.5});cli('xr','set-select-value',{device,value:0,duration:.2});}
try{
 cli('xr','enter');cli('xr','set-input-mode',{mode:'hand'});
 cli('xr','look-at',{device,target:{x:-.34,y:.49,z:-1.45}});cli('xr','select',{device,duration:.2});
 draw(-.085);
}catch(error){
 writeFileSync('docs/evidence/xr-level2-qa.json',JSON.stringify({pass:false,error:String(error),evidence},null,2));throw error;
}
const inspect=()=>{const r=JSON.parse(execFileSync('npx',['@iwsdk/cli','browser','run','scripts/inspect.mjs'],{encoding:'utf8',timeout:25000}));evidence.push({state:r});return r.data?.result;};
try{const failed=inspect();if(failed?.decision?.failures?.includes('DISCONNECTED_SPAN')!==true)throw Error('Level 2 hand failure not observed: '+JSON.stringify(failed));draw(.40);let final=inspect();if(final?.phase==='construction-success')final=inspect();if(final?.phase!=='level-complete')throw Error('Hand replan crossing not complete: '+JSON.stringify(final));writeFileSync('docs/evidence/xr-level2-qa.json',JSON.stringify({pass:true,evidence},null,2));console.log('PASS hand spatial Level 2 control, missing-X diagnosis, human extension and crossing.');}
catch(error){writeFileSync('docs/evidence/xr-level2-qa.json',JSON.stringify({pass:false,error:String(error),evidence},null,2));throw error;}

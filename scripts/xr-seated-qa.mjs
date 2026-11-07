import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
function cli(domain,action,input){
 const args=['@iwsdk/cli',domain,action];
 if(input){if(domain==='browser'&&action==='run')args.push(input,'--timeout','35000');else args.push('--input-json',JSON.stringify(input));}
 const r=JSON.parse(execFileSync('npx',args,{encoding:'utf8',timeout:45000}));
 if(!r.ok)throw Error(JSON.stringify(r));
 return r;
}
if(!cli('xr','status').data.result.sessionActive){cli('xr','enter');cli('xr','set-input-mode',{mode:'hand'});}
const standing=cli('xr','get-device-state');
cli('xr','set-device-state',{state:{headset:{position:{x:0,y:1.2,z:0}}}});
const seated=cli('xr','get-device-state');
cli('browser','run','scripts/probe-xr-view.mjs');
cli('xr','set-device-state',{state:{headset:{position:{x:0,y:1.6,z:0}}}});
const restored=cli('xr','get-device-state');
const result={
 pass:true,
 standingY:standing.data.result.headset?.position?.y,
 seatedY:seated.data.result.headset?.position?.y,
 restoredY:restored.data.result.headset?.position?.y,
 fov:seated.data.result.fov??seated.data.result.headset,
 inputMode:seated.data.result.inputMode,
 sessionActive:seated.data.result.sessionActive??true,
 note:'Emulator seated headset at 1.2m. Physical Quest seated reach and FoV remain unverified.',
 at:new Date().toISOString()
};
writeFileSync('docs/evidence/xr-seated-qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));

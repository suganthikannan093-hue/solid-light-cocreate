import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const scenes=JSON.parse(readFileSync('docs/submission/xr-voice-timing.json','utf8'));
const device='hand-right',origin={x:.2,y:1.35,z:-.3},timeline=[],started=Date.now();
function cli(domain,action,input,extra=[]){
 const args=['@iwsdk/cli',domain,action];
 if(typeof input==='string'&&domain==='browser'&&action==='run')args.push(input,'--timeout','35000');
 else if(input)args.push('--input-json',JSON.stringify(input));
 args.push(...extra);
 const r=JSON.parse(execFileSync('npx',args,{encoding:'utf8',timeout:90000,maxBuffer:64*1024*1024}));
 if(!r.ok)throw Error(JSON.stringify(r));
 return r;
}
function wait(ms){if(ms>0)Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,Math.ceil(ms));}
function q(x,y,z){let dx=x-origin.x,dy=y-origin.y,dz=z-origin.z;const l=Math.hypot(dx,dy,dz);dx/=l;dy/=l;dz/=l;const a=[dy,-dx,0,1-dz],n=Math.hypot(...a);return {x:a[0]/n,y:a[1]/n,z:0,w:a[3]/n};}
function draw(x0,x1,y1=.39,y0=.18){
 const position=(u,v)=>({x:-.72+(u-.5)*1.28,y:1.45+(v-.5)*.64,z:-.3});
 cli('xr','set-transform',{device,position:position(x0,y0),orientation:{x:0,y:0,z:0,w:1}});
 cli('xr','set-select-value',{device,value:1,duration:.2});
 for(const [u,v] of [[x1,y0],[x1,y1],[x0,y1],[x0,y0]])cli('xr','animate-to',{device,position:position(u,v),duration:.7});
 cli('xr','set-select-value',{device,value:0,duration:.2});
}
function snapshot(){return cli('browser','run','scripts/snapshot-state.mjs').data.result;}
function segment(id,action){
 const scene=scenes.find(s=>s.id===id);
 const begin=Date.now();
 const state=action();
 wait(begin+scene.seconds*1000-Date.now());
 timeline.push({id:scene.id,text:scene.text,audio:scene.audio,audioSeconds:scene.audioSeconds,playbackRate:scene.playbackRate,leadIn:scene.leadIn,minimum:scene.minimum,start:(begin-started)/1000,seconds:(Date.now()-begin)/1000,state});
 return state;
}
if(cli('xr','status').data.result.sessionActive)cli('xr','exit');
cli('browser','run','scripts/prepare-level2.mjs');
cli('xr','enter');
cli('xr','set-input-mode',{mode:'hand'});
cli('xr','set-transform',{device,position:origin,orientation:q(-.72,1.45,-1.65)});
const capture=cli('browser','run','scripts/xr-capture-start.mjs');
try{
 segment('intro',()=>{cli('xr','look-at',{device,target:{x:-.72,y:1.45,z:-1.65}});return snapshot();});
 let short;
 segment('draw',()=>{draw(.02,.59);short=cli('browser','run','scripts/wait-needs-user.mjs').data.result;if(!short.report?.failures?.includes('DISCONNECTED_SPAN'))throw Error('Level 2 diagnosis missing');return short;});
 segment('failure',()=>short);
 let complete;
 segment('repair',()=>{draw(.02,.97);complete=cli('browser','run','scripts/wait-complete.mjs').data.result;if(complete.phase!=='level-complete')throw Error('Crossing missing');return complete;});
 segment('cross',()=>complete);
 segment('outro',()=>snapshot());
 let stop={};
 try{stop=cli('browser','run','scripts/xr-capture-stop.mjs').data.result;}catch(error){stop={error:String(error)};}
 writeFileSync('.tmp/xr-screencast-stop','1');
 cli('browser','screenshot',{},['--output-file','docs/submission/screenshots/17-xr-demo-crossing.png']);
 const duration=(Date.now()-started)/1000;
 if(duration>=175)throw Error('XR capture exceeded three-minute budget: '+duration);
 writeFileSync('docs/submission/xr-demo-timeline.json',JSON.stringify({pass:true,duration,voice:'OpenAI marin XR narration',capture:capture.data.result,stop,timeline,at:new Date().toISOString()},null,2));
 console.log(JSON.stringify({pass:true,duration,states:timeline.map(s=>({id:s.id,level:s.state?.level,phase:s.state?.phase,failures:s.state?.report?.failures||s.state?.failures})),raw:stop.raw||null}));
}catch(error){
 writeFileSync('docs/submission/xr-demo-timeline.json',JSON.stringify({pass:false,error:String(error),timeline,at:new Date().toISOString()},null,2));
 throw error;
}

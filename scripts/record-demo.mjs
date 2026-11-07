import {clickControl} from './ui-controls.mjs';
import {chromium} from '@playwright/test';
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const url=process.argv[2]??'https://localhost:4173/?level3=1';
const scenes=JSON.parse(await readFile('docs/submission/voiceover-timing.json','utf8'));
await mkdir('.tmp/demo-capture',{recursive:true});
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-gl=angle','--use-angle=metal']});
const context=await browser.newContext({viewport:{width:1280,height:720},ignoreHTTPSErrors:url.includes('localhost'),recordVideo:{dir:'.tmp/demo-capture',size:{width:1280,height:720}}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url);await page.waitForFunction(()=>!!window.solidLight);await page.waitForLoadState('networkidle');
const started=Date.now(),timeline=[];let audioOffset=0;
const click=label=>clickControl(page,label);
const wait=milliseconds=>new Promise(r=>setTimeout(r,Math.max(0,milliseconds)));
const phase=desired=>page.waitForFunction(value=>window.solidLight.state().phase===value,desired,{timeout:20000});
async function pointsFor(outline){return page.evaluate(points=>{const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();return points.map(([u,v])=>{const a=p.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);p.localToWorld(a);a.project(w.camera);return {x:r.x+(a.x+1)*r.width/2,y:r.y+(1-a.y)*r.height/2};});},outline);}
async function draw(x0,x1,y0=.18,y1=.39,seconds=4){const points=await pointsFor([[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]]);await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();const count=80,begin=Date.now();for(let i=1;i<=count;i++){const f=i/count*4,segment=Math.min(3,Math.floor(f)),t=f-segment;const a=points[segment],b=points[segment+1];await page.mouse.move(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);await wait(begin+seconds*1000*i/count-Date.now());}await page.mouse.up();}
async function segment(id,action){const scene=scenes.find(x=>x.id===id),start=Date.now();await action(scene.seconds);await wait(start+scene.seconds*1000-Date.now());const state=await page.evaluate(()=>{const s=window.solidLight.state();return {level:s.level,phase:s.phase,revision:s.revision,validation:s.decision?.report.pass,failures:s.decision?.report.failures};});timeline.push({...scene,start:(start-started)/1000,seconds:(Date.now()-start)/1000,state});}
try{
 await segment('intro',async()=>{await click('Show example');audioOffset=(Date.now()-started)/1000;await page.evaluate(()=>window.solidLight.startAudioCapture());});
 await segment('draw',async seconds=>{await wait(1800);await draw(.07,.94,.18,.39,Math.max(6,seconds-2));});
 await segment('agent',async()=>{await phase('level-complete');await page.screenshot({path:'docs/submission/screenshots/10-reviewed-level1-complete.png'});});
 await segment('failure',async()=>{await click('Next level');await draw(.02,.59,.18,.39,4);await phase('needs-user');const reasons=await page.evaluate(()=>window.solidLight.state().decision?.report.failures);if(!reasons?.includes('DISCONNECTED_SPAN'))throw Error('Real Level 2 diagnosis missing');await page.screenshot({path:'docs/submission/screenshots/11-reviewed-level2-correction.png'});});
 await segment('replan',async()=>{await draw(.02,.97,.18,.39,5);await phase('level-complete');});
 await segment('controls',async()=>{await click('Pause / Resume');await wait(800);await click('Pause / Resume');await click('High contrast');await wait(1200);await click('Reduced motion');await wait(900);await click('Reduced motion');await click('Clear');await phase('needs-user');const points=await pointsFor([[.2,.47],[.55,.47]]);await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.mouse.move(points[1].x,points[1].y,{steps:12});await page.mouse.up();await wait(1700);await click('Undo');await phase('needs-user');await click('Undo');await phase('level-complete');await click('High contrast');});
 await segment('garden',async()=>{await click('Next level');await draw(.02,.97,.20875,.3225,3);await phase('needs-user');await wait(1200);await draw(.02,.97,.49,.5725,4);await phase('level-complete');await click('Sturdy / Efficient');await phase('level-complete');});
 await segment('budget',async()=>{await click('Next level');await draw(.02,.97,.18,.60,3);await phase('needs-user');const reasons=await page.evaluate(()=>window.solidLight.state().decision?.report.failures);if(!reasons?.includes('RESOURCE_BUDGET'))throw Error('Real resource diagnosis missing');await draw(.065,.935,.18,.60,3);await phase('level-complete');});
 await segment('finale',async()=>{});
 const duration=(Date.now()-started)/1000;if(errors.length)throw Error(errors.join('\n'));if(duration>=175)throw Error('Capture exceeded competition time budget');
 const audio=await page.evaluate(()=>window.solidLight.stopAudioCapture());if(!audio)throw Error('Missing gameplay audio');await writeFile('.tmp/demo-game-audio.webm',Buffer.from(audio.split(',')[1],'base64'));
 const video=page.video();await context.close();const raw=await video.path();await copyFile(raw,'docs/submission/recordings/solid-light-full-demo-raw.webm');await writeFile('docs/submission/demo-timeline.json',JSON.stringify({url,duration,audioOffset,voice:scenes[0].voice??'AI-generated narration',timeline,errors,recordedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({pass:true,duration,sceneStates:timeline.map(s=>({id:s.id,state:s.state})),raw:'docs/submission/recordings/solid-light-full-demo-raw.webm'}));
}finally{await context.close().catch(()=>{});await browser.close();}

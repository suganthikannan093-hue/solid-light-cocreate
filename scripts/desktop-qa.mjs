import {writeFile} from 'node:fs/promises';
export default async function({page,frame,workspaceRoot}) {
 const results=[];const errors=[];page.on('pageerror',error=>errors.push(String(error)));
 await frame.waitForFunction(()=>!!window.solidLight);
 const state=()=>frame.evaluate(()=>{const s=window.solidLight.state();return {level:s.level,phase:s.phase,revision:s.revision,paused:s.paused,instances:s.instances,decision:s.decision?{phase:s.decision.phase,report:s.decision.report,attempts:s.decision.attempts,elapsed:s.decision.elapsed}:null,events:s.events};});
 const click=async name=>{await frame.getByRole('button',{name,exact:true}).click();};
 async function draw(x0,x1,y0=.21,y1=.365) {
  const points=await frame.evaluate(({x0,x1,y0,y1})=>{
   const world=window.solidLight.world,plane=world.requireSceneObject('front-plane'),rect=world.renderer.domElement.getBoundingClientRect();
   return [[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]].map(([u,v])=>{const p=plane.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);plane.localToWorld(p);p.project(world.camera);return {x:rect.x+(p.x+1)*rect.width/2,y:rect.y+(1-p.y)*rect.height/2};});
  },{x0,x1,y0,y1});
  const element=frame.parentFrame()?await frame.frameElement():null,box=element?await element.boundingBox():null;const ox=box?.x??0,oy=box?.y??0;
  await page.mouse.move(ox+points[0].x,oy+points[0].y);await page.mouse.down();
  for(let i=1;i<points.length;i++)await page.mouse.move(ox+points[i].x,oy+points[i].y,{steps:16});
  await page.mouse.up();
 }
 await click('Level 1');await draw(.07,.94);
 await frame.waitForFunction(()=>window.solidLight.state().phase==='level-complete',{},{timeout:15000});
 results.push({test:'desktop Level 1 real pointer closed outline and verified crossing',pass:true,state:await state()});
 await page.screenshot({path:workspaceRoot+'/docs/submission/screenshots/02-level1-success.png'});
 await click('Level 2');await draw(.025,.59);
 await frame.waitForFunction(()=>window.solidLight.state().phase==='needs-user');
 let s=await state();if(!s.decision.report.failures.includes('DISCONNECTED_SPAN'))throw Error('Missing real span diagnosis');results.push({test:'Level 2 authentic failure',pass:true,state:s});
 await page.screenshot({path:workspaceRoot+'/docs/submission/screenshots/03-level2-needs-user.png'});
 await draw(.02,.97);await frame.waitForFunction(()=>window.solidLight.state().phase==='level-complete',{},{timeout:15000});
 results.push({test:'Level 2 human extension and worker replan crossing',pass:true,state:await state()});
 await page.screenshot({path:workspaceRoot+'/docs/submission/screenshots/04-level2-success.png'});
 await click('Clear');await frame.waitForFunction(()=>window.solidLight.state().phase==='needs-user');s=await state();if(!s.decision.report.failures.includes('EMPTY_USER_MASK'))throw Error('Empty guidance missing');results.push({test:'clear gives empty-mask recovery',pass:true});
 await click('Undo');await frame.waitForFunction(()=>window.solidLight.state().phase==='construction-success'||window.solidLight.state().phase==='level-complete');results.push({test:'undo restores a valid drawing',pass:true});
 await click('Pause / Resume');if(!(await state()).paused)throw Error('pause failed');await click('Pause / Resume');
 await click('Reset');await draw(.3,.31,.3,.31);await frame.waitForFunction(()=>window.solidLight.state().phase==='needs-user');results.push({test:'tiny invalid stroke remains recoverable',pass:true});
 await click('Level 1');if((await state()).instances!==0)throw Error('reset geometry failed');
 await writeFile(workspaceRoot+'/docs/evidence/desktop-qa.json',JSON.stringify({results,errors,at:new Date().toISOString()},null,2));
 if(errors.length)throw Error(errors.join('\n'));return {passed:results.map(x=>x.test),errors};
}

import {clickControl} from './ui-controls.mjs';
import {writeFile} from 'node:fs/promises';

export default async function({page,frame,workspaceRoot}) {
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await frame.waitForFunction(()=>!!window.solidLight);
  const click=name=>clickControl(frame,name);
  const state=()=>frame.evaluate(()=>{
    const s=window.solidLight.state();
    return {level:s.level,phase:s.phase,message:s.message,completed:s.completed,roofStep:s.roofStep,failures:s.decision?.report.failures??[],pass:s.decision?.report.pass??null};
  });
  const wait=phase=>frame.waitForFunction(phase=>window.solidLight.state().phase===phase,phase,{timeout:35000});
  async function draw(outline){
    const points=await frame.evaluate(outline=>{
      const world=window.solidLight.world,plane=world.requireSceneObject('front-plane'),rect=world.renderer.domElement.getBoundingClientRect();
      return outline.map(([u,v])=>{const p=plane.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);plane.localToWorld(p);p.project(world.camera);return {x:rect.x+(p.x+1)*rect.width/2,y:rect.y+(1-p.y)*rect.height/2};});
    },outline);
    const element=frame.parentFrame()?await frame.frameElement():null,box=element?await element.boundingBox():null,ox=box?.x??0,oy=box?.y??0;
    await page.mouse.move(ox+points[0].x,oy+points[0].y);await page.mouse.down();
    for(const p of points.slice(1))await page.mouse.move(ox+p.x,oy+p.y,{steps:16});
    await page.mouse.up();
  }
  const loop=(x0,x1,y0,y1,margin=.012)=>[[x0-margin,y0-margin],[x1+margin,y0-margin],[x1+margin,y1+margin],[x0-margin,y1+margin],[x0-margin,y0-margin]];
  const results=[];

  await click('Level 1');
  await draw([[.07,.20],[.94,.20],[.94,.37],[.07,.37],[.07,.20]]);
  await wait('level-complete');
  results.push({chapter:1,state:await state()});

  await click('Next level');
  if((await state()).level!==2)throw Error('did not reach chapter 2');
  await draw([[.02,.20],[.59,.20],[.59,.37],[.02,.37],[.02,.20]]);
  await wait('needs-user');
  if(!(await state()).failures.includes('DISCONNECTED_SPAN'))throw Error('chapter 2 missing-length missing');
  await draw([[.02,.20],[.97,.20],[.97,.37],[.02,.37],[.02,.20]]);
  await wait('level-complete');
  results.push({chapter:2,state:await state()});

  await click('Next level');
  if((await state()).level!==3)throw Error('did not reach chapter 3');
  await draw(loop(.0156,.9844,.1953,.3359));
  await wait('needs-user');
  const garden=await state();
  if(!garden.failures.includes('INSUFFICIENT_SHELTER'))throw Error('chapter 3 path did not ask for roof: '+JSON.stringify(garden.failures));
  if(!garden.roofStep)throw Error('chapter 3 roof step not armed');
  await draw(loop(.0156,.9844,.5,.5625));
  await wait('level-complete');
  results.push({chapter:3,state:await state()});

  await click('Next level');
  if((await state()).level!==4)throw Error('did not reach chapter 4');
  await draw([[.02,.18],[.97,.18],[.97,.60],[.02,.60],[.02,.18]]);
  await wait('needs-user');
  if(!(await state()).failures.includes('RESOURCE_BUDGET'))throw Error('chapter 4 budget missing');
  await draw([[.065,.18],[.935,.18],[.935,.60],[.065,.60],[.065,.18]]);
  await wait('level-complete');
  const ending=await state();
  results.push({chapter:4,state:ending});
  if(!ending.completed||ending.completed.join()!=='1,2,3,4')throw Error('four chapters not marked complete: '+JSON.stringify(ending.completed));
  if(!/WE BUILT THIS TOGETHER/i.test(ending.message))throw Error('ending copy missing: '+ending.message);

  await page.screenshot({path:workspaceRoot+'/docs/submission/screenshots/22-four-chapter-ending.png'});
  await writeFile(workspaceRoot+'/docs/evidence/four-chapter-qa.json',JSON.stringify({pass:true,results,errors,at:new Date().toISOString()},null,2));
  if(errors.length)throw Error(errors.join('\n'));
  return {passed:results.map(r=>'chapter '+r.chapter+' '+r.state.phase),completed:ending.completed,ending:ending.message};
}

import {clickControl} from './ui-controls.mjs';
import {writeFile} from 'node:fs/promises';

export default async function({page,frame,workspaceRoot}) {
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await frame.waitForFunction(()=>!!window.solidLight);
  const click=name=>clickControl(frame,name);
  const state=()=>frame.evaluate(()=>{
    const s=window.solidLight.state();
    return {
      level:s.level,phase:s.phase,message:s.message,instances:s.instances,
      stroke:s.stroke.length,openGap:s.openGap,front:s.front.reduce((a,b)=>a+b,0),
      side:s.side.reduce((a,b)=>a+b,0),pass:s.decision?.report.pass??null,
      failures:s.decision?.report.failures??[]
    };
  });
  async function draw(outline,hold=true) {
    const points=await frame.evaluate(outline=>{
      const world=window.solidLight.world,plane=world.requireSceneObject('front-plane'),rect=world.renderer.domElement.getBoundingClientRect();
      return outline.map(([u,v])=>{const p=plane.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);plane.localToWorld(p);p.project(world.camera);return {x:rect.x+(p.x+1)*rect.width/2,y:rect.y+(1-p.y)*rect.height/2};});
    },outline);
    const element=frame.parentFrame()?await frame.frameElement():null,box=element?await element.boundingBox():null,ox=box?.x??0,oy=box?.y??0;
    await page.mouse.move(ox+points[0].x,oy+points[0].y);await page.mouse.down();
    for(const p of points.slice(1))await page.mouse.move(ox+p.x,oy+p.y,{steps:12});
    if(hold)await page.mouse.up();
    return points;
  }
  const results=[];

  await click('Show example');
  let s=await state();
  if(s.front)throw Error('example filled the board');
  if(!/ghost/i.test(s.message))throw Error('example copy is not ghost: '+s.message);
  results.push({test:'gold ghost example does not count as drawing',pass:true,message:s.message});

  const waitClosed=(timeout=25000)=>frame.waitForFunction(()=>['level-complete','construction-success'].includes(window.solidLight.state().phase),null,{timeout});
  await click('Reset');
  await draw([[.15,.47],[.5,.47]]);
  s=await state();
  if(s.stroke<2)throw Error('open mouse stroke produced no points');
  if(!/stroke|board|glowing end/i.test(s.message))throw Error('no live stroke feedback: '+s.message);
  const ink=await frame.evaluate(()=>{
    const p=window.solidLight.world.requireSceneObject('front-plane');
    const canvas=p.material.map.image;
    const last=window.solidLight.state().stroke.at(-1);
    const pixel=canvas.getContext('2d').getImageData(Math.floor(last[0]*canvas.width),Math.floor((1-last[1])*canvas.height),1,1).data;
    return [...pixel];
  });
  if(!(ink[0]>180&&ink[1]>200))throw Error('open stroke left no visible ink '+ink);
  results.push({test:'ordinary mouse open stroke is visible and announced',pass:true,stroke:s.stroke,message:s.message,ink});
  await page.screenshot({path:workspaceRoot+'/docs/submission/screenshots/21-live-stroke.png'});

  await click('Reset');
  await draw([[.07,.20],[.94,.20],[.94,.37],[.07,.37],[.07,.20]]);
  await waitClosed();
  const built=await state();
  if(!built.instances)throw Error('level 1 built no voxels');
  results.push({test:'level 1 mouse loop builds voxels',pass:true,instances:built.instances});

  await draw([[.12,.48],[.4,.48]],false);
  const mid=await state();
  await page.mouse.up();
  if(mid.stroke<2)throw Error('stroke after voxels produced no points');
  if(!/stroke|board|Ends are close/i.test(mid.message))throw Error('no feedback while voxels present: '+mid.message);
  results.push({test:'mouse stroke still registers after LUMA voxels exist',pass:true,stroke:mid.stroke,message:mid.message,instances:mid.instances});

  await click('Reset');
  await draw([[.07,.20],[.94,.20],[.94,.37],[.07,.37],[.07,.20]]);
  await waitClosed();
  const undo=await frame.evaluate(()=>{
    const before=window.solidLight.state().instances;
    document.querySelector('[data-action="Undo"]').click();
    const after=window.solidLight.state();
    return {before,instances:after.instances,side:after.side.reduce((a,b)=>a+b,0),phase:after.phase,message:after.message};
  });
  if(undo.instances!==0)throw Error('undo left amber voxels in place '+JSON.stringify(undo));
  if(undo.side!==0)throw Error('undo left LUMA side mask in place');
  results.push({test:'undo drops LUMA amber immediately',pass:true,undo});
  await waitClosed();
  results.push({test:'undo then replans the restored outline',pass:true,state:await state()});

  await writeFile(workspaceRoot+'/docs/evidence/input-reliability-qa.json',JSON.stringify({results,errors,at:new Date().toISOString()},null,2));
  if(errors.length)throw Error(errors.join('\n'));
  return {passed:results.map(x=>x.test),errors};
}

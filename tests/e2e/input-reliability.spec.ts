import {clickControl} from '../../scripts/ui-controls.mjs';
import {test,expect} from '@playwright/test';
import type {World,Mesh,MeshBasicMaterial} from '@iwsdk/core';
import {drawingGuide} from '../../src/game/feedback';
import {goalFor,type GameState,type Point} from '../../src/game/engine';

declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}

async function toScreen(page:{evaluate:Function},u:number,v:number){
 return page.evaluate(({u,v})=>{
  const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();
  const a=p.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);p.localToWorld(a);a.project(w.camera);
  return {x:r.x+(a.x+1)*r.width/2,y:r.y+(1-a.y)*r.height/2};
 },{u,v});
}

async function strokeVisible(page:{evaluate:Function}){
 return page.evaluate(()=>{
  const state=window.solidLight.state();
  const p=window.solidLight.world.requireSceneObject<Mesh>('front-plane');
  const canvas=(p.material as MeshBasicMaterial).map!.image as HTMLCanvasElement;
  const last=state.stroke.at(-1);
  if(!last||!canvas)return false;
  const ctx=canvas.getContext('2d')!;
  const pixel=ctx.getImageData(Math.floor(last[0]*canvas.width),Math.floor((1-last[1])*canvas.height),1,1).data;
  return state.stroke.length>0&&pixel[0]>180&&pixel[1]>200;
 });
}

test('ordinary mouse drags, short drags and taps always show a stroke or clear feedback',async({page})=>{
 await page.goto('./');
 await page.waitForFunction(()=>!!window.solidLight);

 // Mid-draw preview from the first points of a realistic stepped drag.
 const start=await toScreen(page,.16,.46);
 const mid=await toScreen(page,.55,.46);
 await page.mouse.move(start.x,start.y);
 await page.mouse.down();
 await page.mouse.move(mid.x,mid.y,{steps:12});
 await expect.poll(()=>strokeVisible(page)).toBe(true);
 expect(await page.evaluate(()=>window.solidLight.state().stroke.length)).toBeGreaterThan(1);
 await expect(page.getByRole('status')).toContainText(/Keep holding|stroke is on the board|Close the loop|ribbon/i);
 await page.mouse.up();
 await expect(page.getByRole('status')).toContainText(/Too short, drag further|Bring the glowing end back/i);

 await clickControl(page,'Reset');
 await page.waitForFunction(()=>window.solidLight.state().phase==='onboarding');

 // A very short drag must not fail silently.
 const shortFrom=await toScreen(page,.4,.45);
 const shortTo=await toScreen(page,.43,.46);
 await page.mouse.move(shortFrom.x,shortFrom.y);
 await page.mouse.down();
 await page.mouse.move(shortTo.x,shortTo.y,{steps:4});
 await page.mouse.up();
 await expect(page.getByRole('status')).toContainText('Too short, drag further');

 // A tap (pointerdown with no move) gets the same feedback.
 const tap=await toScreen(page,.5,.5);
 await page.mouse.move(tap.x,tap.y);
 await page.mouse.down();
 await page.mouse.up();
 await expect(page.getByRole('status')).toContainText('Too short, drag further');

 // Off-board press is explained instead of ignored.
 const off=await toScreen(page,-0.6,0.5);
 await page.mouse.move(off.x,off.y);
 await page.mouse.down();
 await page.mouse.up();
 await expect(page.getByRole('status')).toContainText('Start inside the glowing area.');
});

test('Undo clears LUMA amber geometry and announces a re-test',async({page})=>{
 await page.goto('./');
 await page.waitForFunction(()=>!!window.solidLight);
 const guide=drawingGuide(2,goalFor(2),false,false);
 const loop:Point[]=[[guide.x0-0.04,guide.y0-0.04],[guide.x1+0.04,guide.y0-0.04],[guide.x1+0.04,guide.y1+0.04],[guide.x0-0.04,guide.y1+0.04],[guide.x0-0.04,guide.y0-0.04]];
 const points=await page.evaluate(outline=>{
  const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();
  return outline.map(([u,v])=>{const a=p.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);p.localToWorld(a);a.project(w.camera);return {x:r.x+(a.x+1)*r.width/2,y:r.y+(1-a.y)*r.height/2};});
 },loop);
 await clickControl(page,'Level 2');
 await page.waitForFunction(()=>window.solidLight.state().level===2);
 await page.mouse.move(points[0].x,points[0].y);
 await page.mouse.down();
 for(const point of points.slice(1))await page.mouse.move(point.x,point.y,{steps:8});
 await page.mouse.up();
 await page.waitForFunction(()=>window.solidLight.state().phase==='needs-user');
 const before=await page.evaluate(()=>({instances:window.solidLight.state().instances,side:window.solidLight.state().side.some(Boolean)}));
 expect(before.instances).toBeGreaterThan(0);
 expect(before.side).toBe(true);

 await clickControl(page,'Undo');
 await expect(page.getByRole('status')).toContainText('LUMA will re-test depth');
 const after=await page.evaluate(()=>({instances:window.solidLight.state().instances,side:window.solidLight.state().side.some(Boolean),front:window.solidLight.state().front.some(Boolean),phase:window.solidLight.state().phase}));
 expect(after.front).toBe(false);
 expect(after.side).toBe(false);
 expect(after.instances).toBe(0);
 expect(after.phase).toBe('needs-user');
});

test('the example cursor stops when the player starts drawing',async({page})=>{
 await page.goto('./');
 await page.waitForFunction(()=>!!window.solidLight);
 expect(await page.evaluate(()=>window.solidLight.state().exampleActive)).toBe(true);
 const start=await toScreen(page,.2,.45);
 await page.mouse.move(start.x,start.y);
 await page.mouse.down();
 expect(await page.evaluate(()=>window.solidLight.state().exampleActive)).toBe(false);
 expect(await page.evaluate(()=>window.solidLight.state().exampleFinished)).toBe(true);
 await page.mouse.up();
});

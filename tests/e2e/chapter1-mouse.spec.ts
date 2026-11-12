import {test,expect} from '@playwright/test';
import {clickControl} from '../../scripts/ui-controls.mjs';
import {drawingGuide} from '../../src/game/feedback';
import {goalFor,type Point,type GameState} from '../../src/game/engine';
import type {World} from '@iwsdk/core';

declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}

function around(guide:ReturnType<typeof drawingGuide>,margin=0.02):Point[]{
 return [[guide.x0-margin,guide.y0-margin],[guide.x1+margin,guide.y0-margin],[guide.x1+margin,guide.y1+margin],[guide.x0-margin,guide.y1+margin],[guide.x0-margin,guide.y0-margin]];
}

test('desktop mouse completes all four chapters, including an edge-started stroke',async({page})=>{
 test.setTimeout(240000);
 await page.goto('./');
 await page.waitForFunction(()=>!!window.solidLight);
 await expect(page.getByRole('button',{name:'Enter XR',exact:true})).toBeVisible();

 async function toScreen(outline:Point[],steps=20){
  return page.evaluate(({outline,steps})=>{
   const w=window.solidLight.world,plane=w.requireSceneObject('front-plane'),rect=w.renderer.domElement.getBoundingClientRect();
   const project=(u:number,v:number)=>{const a=plane.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);plane.localToWorld(a);a.project(w.camera);return {x:rect.x+(a.x+1)*rect.width/2,y:rect.y+(1-a.y)*rect.height/2};};
   const points:{x:number;y:number}[]=[];
   for(let i=0;i<outline.length-1;i++){
    const [x0,y0]=outline[i],[x1,y1]=outline[i+1];
    for(let s=0;s<steps;s++)points.push(project(x0+(x1-x0)*s/steps,y0+(y1-y0)*s/steps));
   }
   points.push(project(outline[0][0],outline[0][1]));
   return points;
  },{outline,steps});
 }

 async function draw(outline:Point[],steps=20){
  const points=await toScreen(outline,steps);
  await page.mouse.move(points[0].x,points[0].y);
  await page.mouse.down();
  for(const point of points.slice(1))await page.mouse.move(point.x,point.y,{steps:6});
  await page.mouse.up();
 }

 const waitPhase=(phase:string,timeout=35000)=>page.waitForFunction(value=>window.solidLight.state().phase===value,phase,{timeout});
 const next=async()=>{
  await expect(page.getByRole('button',{name:'Next level',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Next level',exact:true}).click();
 };

 // A loop that starts just off the left edge must still register and give feedback.
 const edge=await toScreen([[-0.08,0.28],[-0.08,0.34],[-0.02,0.34],[-0.02,0.28],[-0.08,0.28]],8);
 await page.mouse.move(edge[0].x,edge[0].y);
 await page.mouse.down();
 for(const point of edge.slice(1))await page.mouse.move(point.x,point.y);
 await page.mouse.up();
 await expect(page.getByRole('status')).toContainText(/outline|loop|stroke|edge|end back|too small|No stroke|Keep holding|ribbon/i);
 await clickControl(page,'Reset');
 await page.waitForFunction(()=>window.solidLight.state().phase==='onboarding');

 await draw(around(drawingGuide(1,goalFor(1)),0.04),24);
 await waitPhase('level-complete');
 await expect(page.getByRole('status')).toContainText('LEVEL 1 COMPLETE');
 expect(await page.evaluate(()=>window.solidLight.state().level)).toBe(1);
 await next();
 expect(await page.evaluate(()=>window.solidLight.state().level)).toBe(2);

 // Chapter 2: short span first (starts near the left edge of the board), then a longer loop to B.
 await draw(around(drawingGuide(2,goalFor(2),false,false),0.04),24);
 await waitPhase('needs-user');
 expect(await page.evaluate(()=>window.solidLight.state().decision?.report.failures??[])).toContain('DISCONNECTED_SPAN');
 await draw(around(drawingGuide(2,goalFor(2),false,true),0.03),24);
 await waitPhase('level-complete');
 await next();
 expect(await page.evaluate(()=>window.solidLight.state().level)).toBe(3);

 await draw(around(drawingGuide(3,goalFor(3),false),0.02),24);
 await waitPhase('needs-user');
 expect(await page.evaluate(()=>window.solidLight.state().decision?.report.failures??[])).toContain('INSUFFICIENT_SHELTER');
 await draw(around(drawingGuide(3,goalFor(3),true),0.02),24);
 await waitPhase('level-complete');
 await next();
 expect(await page.evaluate(()=>window.solidLight.state().level)).toBe(4);

 await draw(around(drawingGuide(4,goalFor(4),false,false),0.02),24);
 await waitPhase('needs-user');
 expect(await page.evaluate(()=>window.solidLight.state().decision?.report.failures??[])).toContain('RESOURCE_BUDGET');
 await draw(around(drawingGuide(4,goalFor(4),false,true),0.02),24);
 await waitPhase('level-complete');
 expect(await page.evaluate(()=>window.solidLight.state().decision!.report.pass)).toBe(true);
 await expect(page.getByRole('status')).toContainText(/Last Spark|BUILT THIS TOGETHER|created together/i);
 expect(await page.evaluate(()=>window.solidLight.state().phase)).toBe('level-complete');
 expect(await page.evaluate(()=>window.solidLight.state().completed)).toEqual(expect.arrayContaining([1,2,3,4]));
 await expect(page.locator('#chapter-progress')).toContainText('4 COMPLETE');

 // Saved progress must survive a reload and offer Continue into the ending chapter.
 await page.reload();
 await page.waitForFunction(()=>!!window.solidLight);
 await expect(page.getByRole('dialog',{name:'Saved progress'})).toBeVisible();
 expect(await page.evaluate(()=>window.solidLight.state().awaitingContinue)).toBe(true);
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.waitForFunction(()=>window.solidLight.state().level===4&&!window.solidLight.state().awaitingContinue);
 await expect(page.getByRole('status')).toContainText(/Last Spark/i);
});

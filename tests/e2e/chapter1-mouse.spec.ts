import {test,expect} from '@playwright/test';
import type {World} from '@iwsdk/core';
import type {GameState} from '../../src/game/engine';

declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}

/** Dense desktop mouse loop around the Chapter 1 guide, including mid-edge samples. */
test('desktop mouse draws a complete first-bridge loop',async({page})=>{
 await page.goto('./');
 await page.waitForFunction(()=>!!window.solidLight);
 await expect(page.getByRole('button',{name:'Enter XR',exact:true})).toBeVisible();
 const preview=page.getByRole('button',{name:'Preview XR',exact:true});
 const previewVisible=await preview.isVisible();
 if(previewVisible)await expect(preview).toBeVisible();
 const loop=await page.evaluate(()=>{
  const w=window.solidLight.world,plane=w.requireSceneObject('front-plane'),rect=w.renderer.domElement.getBoundingClientRect();
  const toScreen=(u:number,v:number)=>{const a=plane.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);plane.localToWorld(a);a.project(w.camera);return {x:rect.x+(a.x+1)*rect.width/2,y:rect.y+(1-a.y)*rect.height/2};};
  const corners:[[number,number][]]=[[.08,.18],[.92,.18],[.92,.40],[.08,.40],[.08,.18]];
  const points:{x:number;y:number}[]=[];
  for(let i=0;i<corners.length-1;i++){
   const [x0,y0]=corners[i],[x1,y1]=corners[i+1];
   const steps=24;
   for(let s=0;s<steps;s++)points.push(toScreen(x0+(x1-x0)*s/steps,y0+(y1-y0)*s/steps));
  }
  points.push(toScreen(corners[0][0],corners[0][1]));
  return points;
 });
 await page.mouse.move(loop[0].x,loop[0].y);
 await page.mouse.down();
 for(const point of loop.slice(1))await page.mouse.move(point.x,point.y);
 await page.mouse.up();
 await page.waitForFunction(()=>window.solidLight.state().phase==='level-complete',null,{timeout:20000});
 await expect(page.getByRole('status')).toContainText('LEVEL 1 COMPLETE');
 expect(await page.evaluate(()=>window.solidLight.state().decision!.report.pass)).toBe(true);
});

import {clickControl} from '../../scripts/ui-controls.mjs';
import {test,expect} from '@playwright/test';
import type {World} from '@iwsdk/core';
import type {GameState} from '../../src/game/engine';
declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}
test('experimental Garden checks shelter and path; both strategies finish',async({page})=>{
 await page.goto('./?level3=1');await page.waitForFunction(()=>!!window.solidLight);await page.waitForLoadState('networkidle');await page.context().setOffline(true);await clickControl(page,'Level 3');
 async function draw(y1:number){const points=await page.evaluate(y1=>{const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();return [[.02,.21],[.97,.21],[.97,y1],[.02,y1],[.02,.21]].map(([u,v])=>{const a=p.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);p.localToWorld(a);a.project(w.camera);return {x:r.x+(a.x+1)*r.width/2,y:r.y+(1-a.y)*r.height/2};});},y1);await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x,p.y,{steps:16});await page.mouse.up();}
 await draw(.365);await page.waitForFunction(()=>window.solidLight.state().phase==='needs-user');expect(await page.evaluate(()=>window.solidLight.state().decision!.report.failures)).toContain('INSUFFICIENT_SHELTER');
 await draw(.60);await page.waitForFunction(()=>window.solidLight.state().phase==='level-complete');const sturdy=await page.evaluate(()=>window.solidLight.state().decision!.volume.occupancy.reduce((a:number,b:number)=>a+b,0));
 await page.screenshot({path:'docs/submission/screenshots/07-experimental-garden.png'});
 await clickControl(page,'Sturdy / Efficient');await page.waitForFunction(()=>window.solidLight.state().phase==='level-complete');const efficient=await page.evaluate(()=>window.solidLight.state().decision!.volume.occupancy.reduce((a:number,b:number)=>a+b,0));expect(efficient).toBeLessThan(sturdy);
});

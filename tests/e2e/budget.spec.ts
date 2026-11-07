import {test,expect} from '@playwright/test';
import {clickControl} from '../../scripts/ui-controls.mjs';
import type {World} from '@iwsdk/core';
import type {GameState} from '../../src/game/engine';
declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}
test('default journey reaches budget challenge and opens a distinct remix after a human trim',async({page})=>{
 await page.goto('./');await page.waitForFunction(()=>!!window.solidLight);await page.waitForLoadState('networkidle');await page.context().setOffline(true);await clickControl(page,'Level 4');
 async function draw(x0:number,x1:number){const points=await page.evaluate(({x0,x1})=>{const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();return [[x0,.18],[x1,.18],[x1,.60],[x0,.60],[x0,.18]].map(([u,v])=>{const a=p.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);p.localToWorld(a);a.project(w.camera);return {x:r.x+(a.x+1)*r.width/2,y:r.y+(1-a.y)*r.height/2};});},{x0,x1});await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x,p.y,{steps:12});await page.mouse.up();}
 await draw(.02,.97);await page.waitForFunction(()=>window.solidLight.state().phase==='needs-user');expect(await page.evaluate(()=>window.solidLight.state().decision!.report.failures)).toContain('RESOURCE_BUDGET');
 await draw(.065,.935);await page.waitForFunction(()=>window.solidLight.state().phase==='level-complete');const report=await page.evaluate(()=>window.solidLight.state().decision!.report);expect(report.cost!).toBeLessThanOrEqual(report.budget!);const ending=await page.evaluate(()=>{const w=window.solidLight.world,s=window.solidLight.state();return {solid:w.scene.getObjectByName('SolidLightVoxels')?.visible,human:s.front.some(Boolean),luma:s.side.some(Boolean),route:s.decision?.report.pass};});expect(ending).toEqual({solid:true,human:true,luma:true,route:true});await page.screenshot({path:'docs/submission/screenshots/13-last-spark-complete.png'});
 await page.getByRole('button',{name:'Next level',exact:true}).click();await expect(page.getByRole('status')).toContainText('Last Spark');const goal=await page.evaluate(()=>window.solidLight.state().level);expect(goal).toBe(4);
});

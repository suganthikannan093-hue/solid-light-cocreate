import {clickControl} from '../../scripts/ui-controls.mjs';
import {test,expect} from '@playwright/test';
import {drawingGuide} from '../../src/game/feedback';
import {goalFor,type Point,type GameState} from '../../src/game/engine';
import type {World} from '@iwsdk/core';
declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}
test('Next into Garden: thin path is kept, open roof is recoverable, second loop adds shelter, Undo and both strategies work',async({page})=>{
 await page.goto('./');await page.waitForFunction(()=>!!window.solidLight);await page.waitForLoadState('networkidle');await page.context().setOffline(true);
 async function draw(outline:Point[]){const points=await page.evaluate(outline=>{const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();return outline.map(([u,v])=>{const a=p.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);p.localToWorld(a);a.project(w.camera);return {x:r.x+(a.x+1)*r.width/2,y:r.y+(1-a.y)*r.height/2};});},outline);await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x,p.y,{steps:16});await page.mouse.up();}
 const loop=(b:ReturnType<typeof drawingGuide>):Point[]=>[[b.x0-.01,b.y0-.01],[b.x1+.01,b.y0-.01],[b.x1+.01,b.y1+.01],[b.x0-.01,b.y1+.01],[b.x0-.01,b.y0-.01]];
 const phase=(value:string)=>page.waitForFunction(value=>window.solidLight.state().phase===value,value);
 await clickControl(page,'Level 2');await draw([[.02,.20],[.97,.20],[.97,.37],[.02,.37],[.02,.20]]);await phase('level-complete');await page.getByRole('button',{name:'Next level',exact:true}).click();expect(await page.evaluate(()=>window.solidLight.state().level)).toBe(3);
 await expect(page.getByRole('button',{name:'Next level',exact:true})).toBeDisabled();expect(await page.getByRole('button',{name:'Next level',exact:true}).evaluate(b=>getComputedStyle(b).boxShadow)).toBe('none');
 await draw(loop(drawingGuide(3,goalFor(3))));await phase('needs-user');expect(await page.evaluate(()=>window.solidLight.state().decision!.report.failures)).toEqual(['INSUFFICIENT_SHELTER']);await expect(page.getByRole('status')).toContainText('SECOND closed loop');const lower=await page.evaluate(()=>window.solidLight.state().front);
 await draw([[.1,.51],[.8,.51]]);await phase('needs-user');expect(await page.evaluate(()=>window.solidLight.state().front)).toEqual(lower);await expect(page.getByRole('status')).toContainText('earlier loops are kept');
 await draw(loop(drawingGuide(3,goalFor(3),true)));await phase('level-complete');const combined=await page.evaluate(()=>window.solidLight.state().front);for(let i=0;i<lower.length;i++)if(lower[i])expect(combined[i]).toBe(1);for(let y=11;y<=15;y++)expect(combined.slice(y*32,(y+1)*32).some(Boolean)).toBe(false);
 const presentation=await page.evaluate(()=>{const w=window.solidLight.world,g=w.requireSceneObject('light-garden') as any;return {title:document.title,oldPlane:w.requireSceneObject('side-plane').visible,maxSparkY:Math.max(...Array.from({length:g.geometry.attributes.position.count},(_,i)=>g.geometry.attributes.position.getY(i)))};});expect(presentation.title).toBe('SOLID LIGHT: CO-CREATE');expect(presentation.oldPlane).toBe(false);expect(presentation.maxSparkY).toBeLessThanOrEqual(1.081);
 await clickControl(page,'Undo');await phase('needs-user');expect(await page.evaluate(()=>window.solidLight.state().front)).toEqual(lower);
 await draw(loop(drawingGuide(3,goalFor(3),true)));await phase('level-complete');const sturdy=await page.evaluate(()=>window.solidLight.state().decision!.volume.occupancy.reduce((a:number,b:number)=>a+b,0));await page.screenshot({path:'docs/submission/screenshots/07-experimental-garden.png'});
 await clickControl(page,'Sturdy / Efficient');await phase('level-complete');const efficient=await page.evaluate(()=>window.solidLight.state().decision!.volume.occupancy.reduce((a:number,b:number)=>a+b,0));expect(efficient).toBeLessThan(sturdy);
});

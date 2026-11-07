import {clickControl} from '../../scripts/ui-controls.mjs';
import {test,expect} from '@playwright/test';
import type {World,Mesh,MeshBasicMaterial} from '@iwsdk/core';
import type {GameState} from '../../src/game/engine';
declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}
test('novice feedback: instant stroke, open-gap recovery, sparse rectangle and clear next objective',async({page})=>{
 await page.goto('./');await page.waitForFunction(()=>!!window.solidLight);
 const position=async(u:number,v:number)=>page.evaluate(({u,v})=>{const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect(),a=p.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);p.localToWorld(a);a.project(w.camera);return {x:r.x+(a.x+1)*r.width/2,y:r.y+(1-a.y)*r.height/2};},{u,v});
 await expect(page.getByText('Mouse: hold + draw a CLOSED LOOP around the dotted ribbon. XR: pinch + drag. Release to build.')).toBeVisible();
 await clickControl(page,'Show example');expect(await page.evaluate(()=>window.solidLight.state().front.some(Boolean))).toBe(false);
 const start=await position(.15,.47),end=await position(.5,.47);await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y);
 expect(await page.evaluate(()=>{const p=window.solidLight.world.requireSceneObject<Mesh>('front-plane'),canvas=(p.material as MeshBasicMaterial).map!.image as HTMLCanvasElement;const last=window.solidLight.state().stroke.at(-1)!;const pixel=canvas.getContext('2d')!.getImageData(Math.floor(last[0]*canvas.width),Math.floor((1-last[1])*canvas.height),1,1).data;return pixel[0]>180&&pixel[1]>200;})).toBe(true);
 await page.mouse.up();await expect(page.getByRole('status')).toContainText('Bring the glowing end back');expect(await page.evaluate(()=>window.solidLight.state().openGap)).toBe(true);expect(await page.evaluate(()=>window.solidLight.state().stroke.length)).toBeGreaterThan(0);
 await page.screenshot({path:'docs/submission/screenshots/09-open-stroke-feedback.png'});
 const points=[];for(const [u,v] of [[.07,.20],[.94,.20],[.94,.37],[.07,.37],[.07,.20]])points.push(await position(u,v));await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x,p.y);await page.mouse.up();
 await page.waitForFunction(()=>window.solidLight.state().phase==='level-complete');await expect(page.getByRole('status')).toContainText('LEVEL 1 COMPLETE');await expect(page.getByRole('button',{name:'Next level',exact:true})).toHaveClass(/next-objective/);await page.getByRole('button',{name:'Next level',exact:true}).click();expect(await page.evaluate(()=>window.solidLight.state().level)).toBe(2);
});

import {test,expect} from '@playwright/test';
import {clickControl} from '../../scripts/ui-controls.mjs';
import type {World} from '@iwsdk/core';
import type {GameState} from '../../src/game/engine';
declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}
test('focused controls, visible toggle state, XR fallback and narrow viewport framing',async({page})=>{
 await page.goto('./');await page.waitForFunction(()=>!!window.solidLight);
 await expect(page.getByRole('button',{name:'Next level',exact:true})).toBeDisabled();
 await clickControl(page,'Pause / Resume');await expect(page.getByRole('status')).toContainText('Paused');await clickControl(page,'Pause / Resume');
 for(const name of ['Mute','Reduced motion','High contrast']){await clickControl(page,name);await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Settings',exact:true}).click();}
 await clickControl(page,'Enter XR');await expect(page.getByRole('status')).toContainText(/XR unavailable|XR could not start/);
 await page.setViewportSize({width:640,height:800});await page.waitForTimeout(250);
 const bounds=await page.evaluate(()=>{const w=window.solidLight.world;return ['front-plane','depth-preview','creature'].map(id=>{const o=w.requireSceneObject(id),p=o.position.clone();o.getWorldPosition(p);p.project(w.camera);return {id,x:p.x,y:p.y};});});for(const p of bounds){expect(Math.abs(p.x)).toBeLessThan(1);expect(Math.abs(p.y)).toBeLessThan(1);}
 await expect(page.getByRole('img',{name:/Solid Light spatial game/})).toBeVisible();await page.screenshot({path:'docs/submission/screenshots/12-responsive-comfort.png'});
});

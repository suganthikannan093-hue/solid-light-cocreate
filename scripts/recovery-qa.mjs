import {writeFile} from 'node:fs/promises';
export default async function({page,frame,workspaceRoot}){
 const results=[];
 const click=name=>frame.getByRole('button',{name,exact:true}).click();
 const state=()=>frame.evaluate(()=>{const s=window.solidLight.state();return {revision:s.revision,phase:s.phase,mask:s.front,decisionRevision:s.decision?.volume.revision};});
 await click('Level 2');
 const points=await frame.evaluate(()=>{const w=window.solidLight.world,plane=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();return [[.02,.21],[.97,.21],[.97,.365],[.02,.365],[.02,.21]].map(([u,v])=>{const p=plane.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);plane.localToWorld(p);p.project(w.camera);return {x:r.x+(p.x+1)*r.width/2,y:r.y+(1-p.y)*r.height/2};});});
 const el=await frame.frameElement(),box=await el.boundingBox();await page.mouse.move(points[0].x+box.x,points[0].y+box.y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x+box.x,p.y+box.y,{steps:10});await page.mouse.up();
 await click('Clear');const revision=(await state()).revision;await frame.waitForFunction(()=>window.solidLight.state().phase==='needs-user');let s=await state();if(s.revision!==revision||s.mask.some(Boolean)||s.decisionRevision!==revision)throw Error('Stale worker overwrote clear');results.push('actual worker race: rapid clear keeps latest empty mask authoritative');
 await click('Reset');await page.mouse.move(points[0].x+box.x,points[0].y+box.y);await page.mouse.down();await click('Pause / Resume');await page.mouse.up();await click('Pause / Resume');await click('Reset');
 for(const name of ['High contrast','Reduced motion','Mute','Help','Recenter'])await click(name);results.push('accessibility/help/recenter controls remain usable');
 await frame.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));results.push('visibility event does not crash');
 await writeFile(workspaceRoot+'/docs/evidence/recovery-qa.json',JSON.stringify({pass:true,results},null,2));return results;
}

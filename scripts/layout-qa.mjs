import {writeFile} from 'node:fs/promises';
import {clickControl} from './ui-controls.mjs';
export default async function({page,frame,workspaceRoot}){
 const results=[];
 for(const [width,height] of [[1280,800],[640,720],[390,844],[844,390]]){
  await page.setViewportSize({width,height});
  await frame.waitForFunction(()=>!!window.solidLight);
  for(const settings of [false,true]){
   const toggle=frame.getByRole('button',{name:'Settings',exact:true});
   if((await toggle.getAttribute('aria-pressed')==='true')!==settings)await toggle.click();
   await frame.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const measurement=await frame.evaluate(()=>{
    const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();
    return {canvas:rect('#scene-container canvas'),container:rect('#scene-container'),panel:rect('#desktop-controls'),hint:rect('.control-hint'),status:rect('#live-status'),audioHidden:document.querySelector('.audio-hint').hidden,viewport:{width:innerWidth,height:innerHeight}};
   });
   const {canvas,container,panel,hint,status}=measurement;
   if(canvas.bottom>panel.top-4||Math.abs(canvas.height-container.height)>1||canvas.height<100)throw Error('Play area overlaps controls: '+JSON.stringify(measurement));
   if(panel.top<0||panel.bottom>measurement.viewport.height||panel.right>measurement.viewport.width)throw Error('Controls outside viewport');
   if(hint.bottom>status.top+1||measurement.audioHidden===settings)throw Error('Instruction rows overlap or audio guidance visibility incorrect');
   results.push({width,height,settings,measurement});
  }
 }
 await page.setViewportSize({width:1000,height:720});
 await clickControl(frame,'Level 1');
 await page.screenshot({path:workspaceRoot+'/docs/submission/screenshots/23-layout-fixed.png'});
 const result={pass:true,results,at:new Date().toISOString()};
 await writeFile(workspaceRoot+'/docs/evidence/layout-qa.json',JSON.stringify(result,null,2));return {pass:true,viewports:results.length};
}

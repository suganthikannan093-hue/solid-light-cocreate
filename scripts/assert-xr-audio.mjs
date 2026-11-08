import {writeFile} from 'node:fs/promises';
export default async function({frame,workspaceRoot}){
 await frame.waitForFunction(()=>{const s=window.solidLight;return s.world.renderer.xr.isPresenting&&s.audioState().state==='running'&&!s.audioState().muted&&s.audioState().rms>.001;});
 const result=await frame.evaluate(()=>({immersive:window.solidLight.world.renderer.xr.isPresenting,audio:window.solidLight.audioState()}));
 await writeFile(workspaceRoot+'/docs/evidence/xr-audio-qa.json',JSON.stringify({pass:true,result,at:new Date().toISOString()},null,2));return result;
}

import {writeFile} from 'node:fs/promises';
export default async function({frame,workspaceRoot}) {
 const result=await frame.evaluate(async()=>{
  const samples=[];let last=performance.now();for(let i=0;i<120;i++){await new Promise(requestAnimationFrame);const now=performance.now();samples.push(now-last);last=now;}
  samples.sort((a,b)=>a-b);const w=window.solidLight.world,s=window.solidLight.state();return {environment:'Intel macOS SDK-managed Chromium; uncalibrated desktop only',frames:samples.length,medianFrameMs:samples[60],p95FrameMs:samples[114],renderer:{...w.renderer.info.render},memory:{...w.renderer.info.memory},workerMs:s.decision?.elapsed??null,instances:s.instances};
 });await writeFile(workspaceRoot+'/docs/evidence/performance.json',JSON.stringify(result,null,2));return result;
}

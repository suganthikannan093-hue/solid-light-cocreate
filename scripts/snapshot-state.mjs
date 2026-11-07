export default async function({frame}){
 return frame.evaluate(()=>{
  const s=window.solidLight.state();
  return {level:s.level,phase:s.phase,message:s.message,paused:s.paused,pass:s.decision?.report.pass,failures:s.decision?.report.failures??[],instances:s.instances};
 });
}

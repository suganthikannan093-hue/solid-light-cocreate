export default async function({page,frame}) {
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await frame.getByRole('button',{name:'Level 1',exact:true}).click();
 const data=await frame.evaluate(()=>{const w=window.solidLight.world,p=w.requireSceneObject('front-plane'),r=w.renderer.domElement.getBoundingClientRect();const v=p.position.clone().set(-.4,-.16,0);p.localToWorld(v);v.project(w.camera);return {point:{x:r.x+(v.x+1)*r.width/2,y:r.y+(1-v.y)*r.height/2},rect:r.toJSON(),phase:window.solidLight.state().phase};});
 const el=await frame.frameElement(),box=await el.boundingBox();await page.mouse.move(data.point.x+box.x,data.point.y+box.y);await page.mouse.down();await new Promise(r=>setTimeout(r,150));const down=await frame.evaluate(()=>window.solidLight.state().phase);await page.mouse.move(data.point.x+box.x+60,data.point.y+box.y,{steps:8});await page.mouse.up();await new Promise(r=>setTimeout(r,1500));return {data,box,down,after:await frame.evaluate(()=>({phase:window.solidLight.state().phase,message:window.solidLight.state().message})),errors};
}

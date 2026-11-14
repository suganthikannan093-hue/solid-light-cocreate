import {clickControl} from './ui-controls.mjs';
// A reused browser profile may show the saved-progress dialog first; start a new game so Level 2 is reachable.
export default async function({frame}){const resume=frame.locator('#continue-screen');if(await resume.isVisible().catch(()=>false)){await frame.locator('#continue-screen').getByRole('button',{name:'New game',exact:true}).click();await frame.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}await clickControl(frame,'Level 2');return {ready:true};}

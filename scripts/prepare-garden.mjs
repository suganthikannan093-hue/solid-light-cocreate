import {clickControl} from './ui-controls.mjs';
export default async function({frame}){await frame.goto('https://localhost:8081/?level3=1');await frame.waitForFunction(()=>!!window.solidLight);await clickControl(frame,'Level 3');return {ready:true};}

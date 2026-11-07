import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { CoCreateSystem } from './game/game.js';
import './style.css';
let activeWorld:World|undefined;
let disposed=false;
World.create(document.getElementById('scene-container') as HTMLDivElement,projectOptions).then(world=>{if(disposed){world.destroy();return;}activeWorld=world;world.registerSystem(CoCreateSystem);}).catch(error=>{document.body.textContent=`SOLID LIGHT could not start. Reload to retry. ${String(error)}`;console.error(error);});
if(import.meta.hot)import.meta.hot.dispose(()=>{disposed=true;activeWorld?.destroy();});

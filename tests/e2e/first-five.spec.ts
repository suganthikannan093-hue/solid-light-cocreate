import {mkdirSync} from 'fs';
import {test,expect} from '@playwright/test';
import {drawingGuide} from '../../src/game/feedback';
import {goalFor,type Point,type GameState} from '../../src/game/engine';
import type {World} from '@iwsdk/core';

declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}

function around(guide:ReturnType<typeof drawingGuide>,margin=0.04):Point[]{
  return [[guide.x0-margin,guide.y0-margin],[guide.x1+margin,guide.y0-margin],[guide.x1+margin,guide.y1+margin],[guide.x0-margin,guide.y1+margin],[guide.x0-margin,guide.y0-margin]];
}

async function shot(page:import('@playwright/test').Page,name:string){
  mkdirSync('test-results',{recursive:true});
  const paths=[`test-results/${name}`];
  try{mkdirSync('/workspace/review-1110f',{recursive:true});paths.push(`/workspace/review-1110f/${name}`);}catch{/* CI without the review folder */}
  for(const path of paths)await page.screenshot({path,fullPage:true});
}

test('first five minutes: persist Continue, Incomplete Span repair, and How LUMA thinks',async({page})=>{
  test.setTimeout(180000);
  await page.goto('./');
  await page.waitForFunction(()=>!!window.solidLight);
  await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeHidden();

  async function toScreen(outline:Point[],steps=24){
    return page.evaluate(({outline,steps})=>{
      const w=window.solidLight.world,plane=w.requireSceneObject('front-plane'),rect=w.renderer.domElement.getBoundingClientRect();
      const project=(u:number,v:number)=>{const a=plane.position.clone().set((u-.5)*1.28,(v-.5)*.64,0);plane.localToWorld(a);a.project(w.camera);return {x:rect.x+(a.x+1)*rect.width/2,y:rect.y+(1-a.y)*rect.height/2};};
      const points:{x:number;y:number}[]=[];
      for(let i=0;i<outline.length-1;i++){
        const [x0,y0]=outline[i],[x1,y1]=outline[i+1];
        for(let s=0;s<steps;s++)points.push(project(x0+(x1-x0)*s/steps,y0+(y1-y0)*s/steps));
      }
      points.push(project(outline[0][0],outline[0][1]));
      return points;
    },{outline,steps});
  }

  async function draw(outline:Point[],steps=24){
    const points=await toScreen(outline,steps);
    await page.mouse.move(points[0].x,points[0].y);
    await page.mouse.down();
    for(const point of points.slice(1))await page.mouse.move(point.x,point.y);
    await page.mouse.up();
  }

  const waitPhase=(phase:string,timeout=35000)=>page.waitForFunction(value=>window.solidLight.state().phase===value,phase,{timeout});

  await draw(around(drawingGuide(1,goalFor(1))));
  await waitPhase('level-complete');
  await expect(page.getByRole('status')).toContainText('LEVEL 1 COMPLETE');

  await page.reload();
  await page.waitForFunction(()=>!!window.solidLight);
  await page.waitForFunction(()=>window.solidLight.state().awaitingContinue===true);
  await expect(page.getByRole('dialog',{name:'Saved progress'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'New game',exact:true})).toBeVisible();
  await expect(page.locator('#continue-summary')).toContainText(/Chapter 2|Incomplete Span/);
  await shot(page,'sl-continue.png');
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.waitForFunction(()=>window.solidLight.state().awaitingContinue!==true);
  expect(await page.evaluate(()=>window.solidLight.state().level)).toBe(2);
  await expect(page.getByRole('status')).toContainText(/Incomplete Span|SHORT dotted ribbon|extend the loop/i);

  await draw(around(drawingGuide(2,goalFor(2),false,false)));
  await waitPhase('needs-user');
  expect(await page.evaluate(()=>window.solidLight.state().decision?.report.failures??[])).toContain('DISCONNECTED_SPAN');
  await expect(page.getByRole('status')).toContainText(/falls short/i);
  await shot(page,'sl-failure.png');

  const repair=around(drawingGuide(2,goalFor(2),false,true),0.03);
  const repairPoints=await toScreen(repair,24);
  await page.mouse.move(repairPoints[0].x,repairPoints[0].y);
  await page.mouse.down();
  for(const point of repairPoints.slice(0,Math.floor(repairPoints.length/2)))await page.mouse.move(point.x,point.y);
  await shot(page,'sl-repair.png');
  for(const point of repairPoints.slice(Math.floor(repairPoints.length/2)))await page.mouse.move(point.x,point.y);
  await page.mouse.up();
  await waitPhase('level-complete');
  await expect(page.getByRole('status')).toContainText(/EXTENDED THE SPAN|REPAIRED TOGETHER|fell short/i);
  await shot(page,'sl-success.png');

  await page.getByRole('button',{name:'How LUMA thinks',exact:true}).click();
  await expect(page.locator('#luma-panel')).toBeVisible();
  await expect(page.locator('#luma-explanation')).toContainText(/deterministic local search planner/i);
  await expect(page.locator('#luma-explanation')).toContainText(/not an LLM/i);
  await expect(page.locator('#luma-explanation')).toContainText(/Decision:/i);
  await shot(page,'sl-luma-panel.png');
});

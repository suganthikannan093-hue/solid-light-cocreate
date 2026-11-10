import {test,expect} from '@playwright/test';
import type {World} from '@iwsdk/core';
import type {GameState} from '../../src/game/engine';
import {GHOST_BILLBOARD} from '../../src/game/hud-layout';

declare global {interface Window {solidLight:{world:World;state:()=>GameState}}}

type NamedObject = {name:string;visible:boolean;y:number;scaleX:number;scaleY:number};

test('chapter 1 shows exactly one unclipped GHOST EXAMPLE caption and leaves A visible',async({page})=>{
  test.setTimeout(60000);
  await page.goto('./');
  await page.waitForFunction(()=>!!window.solidLight);
  await page.waitForFunction(()=>window.solidLight.state().phase==='onboarding');
  await page.waitForFunction(()=>{
    const found:string[]=[];
    window.solidLight.world.scene.traverse(obj=>{
      if(obj.name==='GhostExampleLabel'&&obj.visible)found.push(obj.name);
    });
    return found.length===1;
  });

  const info=await page.evaluate(()=>{
    const world=window.solidLight.world;
    const named:NamedObject[]=[];
    world.scene.traverse(obj=>{
      if(obj.name&&/ghost/i.test(obj.name)){
        named.push({name:obj.name,visible:obj.visible,y:obj.position.y,scaleX:obj.scale.x,scaleY:obj.scale.y});
      }
    });
    const label=named.find(item=>item.name==='GhostExampleLabel');
    const plane=world.requireSceneObject('front-plane');
    const boardTop=plane.position.y+0.32;
    const front=(plane as {material?:{map?:{image?:HTMLCanvasElement}}}).material?.map?.image;
    let captionFillRatio=0;
    let aAmber=0;
    if(front){
      const ctx=front.getContext('2d');
      if(ctx){
        const band=ctx.getImageData(48,100,400,100);
        let dark=0;
        for(let i=0;i<band.data.length;i+=4){
          const r=band.data[i],g=band.data[i+1],b=band.data[i+2],a=band.data[i+3];
          if(a>200&&r<=10&&g<=22&&b<=30)dark++;
        }
        captionFillRatio=dark/(band.data.length/4);
        const marks=ctx.getImageData(0,200,front.width,100);
        for(let i=0;i<marks.data.length;i+=4){
          const r=marks.data[i],g=marks.data[i+1],b=marks.data[i+2];
          if(r>200&&g>150&&g<220&&b>80&&b<150)aAmber++;
        }
      }
    }
    return {
      named,
      labelY:label?.y??null,
      visible:!!label?.visible,
      boardTop,
      scaleX:label?.scaleX??0,
      scaleY:label?.scaleY??0,
      captionFillRatio,
      aAmber,
      canvas:{w:front?.width??0,h:front?.height??0},
    };
  });

  expect(info.named.filter(item=>item.visible)).toEqual([
    expect.objectContaining({name:'GhostExampleLabel',visible:true}),
  ]);
  expect(info.visible).toBe(true);
  expect(info.labelY).toBeGreaterThanOrEqual(info.boardTop);
  expect(info.scaleX).toBeCloseTo(GHOST_BILLBOARD.width,2);
  expect(info.scaleY).toBeCloseTo(GHOST_BILLBOARD.height,2);
  expect(info.captionFillRatio).toBeLessThan(0.08);
  expect(info.aAmber).toBeGreaterThan(50);
  expect(info.canvas).toEqual({w:768,h:384});

  await page.screenshot({path:'test-results/sl-caption.png',fullPage:true});
});

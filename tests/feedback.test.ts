import {it,expect} from 'vitest';
import {samplePoint,strokeClosure,friendlyFailure,examplePoint,drawingGuide} from '../src/game/feedback';
import {rasterize,addMask,OfflineStrategyProvider,goalFor,type Point} from '../src/game/engine';
it('preserves deliberate corners from sparse mouse input and yields a valid first bridge',()=>{const points:Point[]=[];for(const p of [[.07,.20],[.94,.20],[.94,.37],[.07,.37],[.07,.20]] as Point[])samplePoint(points,p);expect(points[1]).toEqual([.94,.20]);expect(strokeClosure(points).closed).toBe(true);expect(new OfflineStrategyProvider().plan({revision:1,playerMask:rasterize(points,1),goal:goalFor(1),previousAttempts:[]}).report.pass).toBe(true);});
it('distinguishes open outlines from near-closed loops',()=>{expect(strokeClosure([[.1,.2],[.9,.2],[.9,.4]]).closed).toBe(false);expect(strokeClosure([[.1,.2],[.9,.2],[.9,.4],[.11,.21]]).closed).toBe(true);});
it('gives an action instead of a technical failure label and a closed tutorial trace',()=>{expect(friendlyFailure('DISCONNECTED_SPAN')).toContain('Connect A to B');expect(examplePoint(.1,.9,.2,.4,0)).toEqual(examplePoint(.1,.9,.2,.4,1));});

it('the actual thin Garden guide gives a walkable path, then a separate roof loop completes it',()=>{
 const goal=goalFor(3),outline=(b:ReturnType<typeof drawingGuide>,margin=0):Point[]=>[[b.x0-margin,b.y0-margin],[b.x1+margin,b.y0-margin],[b.x1+margin,b.y1+margin],[b.x0-margin,b.y1+margin],[b.x0-margin,b.y0-margin]];
 for(const margin of [0,.01,.025]){
  const path=rasterize(outline(drawingGuide(3,goal),margin),1),before=path.pixels.slice(),decision=new OfflineStrategyProvider().plan({revision:1,playerMask:path,goal,previousAttempts:[]});
  expect(decision.report.constraints?.path).toBe(true);expect(decision.report.failures).toEqual(['INSUFFICIENT_SHELTER']);
  const roof=rasterize(outline(drawingGuide(3,goal,true),margin),2),combined=addMask(path,roof,2);expect(path.pixels).toEqual(before);
  expect(new OfflineStrategyProvider().plan({revision:2,playerMask:combined,goal,previousAttempts:[]}).report.pass).toBe(true);
 }
 expect(friendlyFailure('INSUFFICIENT_CLEARANCE')).toContain('Leave air');
});

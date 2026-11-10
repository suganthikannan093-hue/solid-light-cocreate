import {it,expect} from 'vitest';
import {samplePoint,strokeClosure,friendlyFailure,examplePoint,drawingGuide,chapterIntro,disconnectedSpanHint,budgetHint} from '../src/game/feedback';
import {rasterize,addMask,OfflineStrategyProvider,goalFor,type Point} from '../src/game/engine';
it('preserves deliberate corners from sparse input and yields a valid first bridge',()=>{const points:Point[]=[];for(const p of [[.07,.20],[.94,.20],[.94,.37],[.07,.37],[.07,.20]] as Point[])samplePoint(points,p);expect(points[1]).toEqual([.94,.20]);expect(strokeClosure(points).closed).toBe(true);expect(new OfflineStrategyProvider().plan({revision:1,playerMask:rasterize(points,1),goal:goalFor(1),previousAttempts:[]}).report.pass).toBe(true);});
it('distinguishes open outlines from near-closed loops',()=>{expect(strokeClosure([[.1,.2],[.9,.2],[.9,.4]]).closed).toBe(false);expect(strokeClosure([[.1,.2],[.9,.2],[.9,.4],[.11,.21]]).closed).toBe(true);});
it('gives an action instead of a technical failure label and a closed tutorial trace',()=>{expect(friendlyFailure('DISCONNECTED_SPAN')).toContain('Connect A to B');expect(examplePoint(.1,.9,.2,.4,0)).toEqual(examplePoint(.1,.9,.2,.4,1));});

it('the actual thin Garden guide gives a walkable path, then a separate roof loop completes it',()=>{
 const goal=goalFor(3),outline=(b:ReturnType<typeof drawingGuide>,margin=0):Point[]=>[[b.x0-margin,b.y0-margin],[b.x1+margin,b.y0-margin],[b.x1+margin,b.y1+margin],[b.x0-margin,b.y1+margin],[b.x0-margin,b.y0-margin]];
 for(const margin of [-.012,0,.01,.025]){
  const path=rasterize(outline(drawingGuide(3,goal),margin),1),before=path.pixels.slice(),decision=new OfflineStrategyProvider().plan({revision:1,playerMask:path,goal,previousAttempts:[]});
  expect(decision.report.constraints?.path).toBe(true);expect(decision.report.failures).toEqual(['INSUFFICIENT_SHELTER']);
  const roof=rasterize(outline(drawingGuide(3,goal,true),margin),2),combined=addMask(path,roof,2);expect(path.pixels).toEqual(before);
  expect(new OfflineStrategyProvider().plan({revision:2,playerMask:combined,goal,previousAttempts:[]}).report.pass).toBe(true);
 }
 expect(friendlyFailure('INSUFFICIENT_CLEARANCE')).toContain('Leave air');
});

it('walks a new player through Incomplete Span: short guide fails, extended guide solves',()=>{
 const goal=goalFor(2),outline=(b:ReturnType<typeof drawingGuide>,margin=0.02):Point[]=>[[b.x0-margin,b.y0-margin],[b.x1+margin,b.y0-margin],[b.x1+margin,b.y1+margin],[b.x0-margin,b.y1+margin],[b.x0-margin,b.y0-margin]];
 const short=new OfflineStrategyProvider().plan({revision:1,playerMask:rasterize(outline(drawingGuide(2,goal,false,false)),1),goal,previousAttempts:[]});
 expect(short.report.failures).toContain('DISCONNECTED_SPAN');
 expect(short.phase).toBe('needs-user');
 const extended=new OfflineStrategyProvider().plan({revision:2,playerMask:rasterize(outline(drawingGuide(2,goal,false,true)),2),goal,previousAttempts:[]});
 expect(extended.report.pass).toBe(true);
});

it('lets a new player finish chapters 3 and 4 by following the visible guides',()=>{
 const outline=(b:ReturnType<typeof drawingGuide>,margin=0.02):Point[]=>[[b.x0-margin,b.y0-margin],[b.x1+margin,b.y0-margin],[b.x1+margin,b.y1+margin],[b.x0-margin,b.y1+margin],[b.x0-margin,b.y0-margin]];
 const planner=new OfflineStrategyProvider();
 const gardenGoal=goalFor(3);
 const path=rasterize(outline(drawingGuide(3,gardenGoal,false)),1);
 const pathResult=planner.plan({revision:1,playerMask:path,goal:gardenGoal,previousAttempts:[]});
 expect(pathResult.report.constraints?.path).toBe(true);
 expect(pathResult.report.failures).toContain('INSUFFICIENT_SHELTER');
 const garden=planner.plan({revision:2,playerMask:addMask(path,rasterize(outline(drawingGuide(3,gardenGoal,true)),2),2),goal:gardenGoal,previousAttempts:[]});
 expect(garden.report.pass).toBe(true);
 const lastGoal=goalFor(4);
 const wide=planner.plan({revision:1,playerMask:rasterize(outline(drawingGuide(4,lastGoal,false,false)),1),goal:lastGoal,previousAttempts:[]});
 expect(wide.report.failures).toContain('RESOURCE_BUDGET');
 for(const margin of [0.01,0.02,0.025]){
  const trimmed=planner.plan({revision:2,playerMask:rasterize(outline(drawingGuide(4,lastGoal,false,true),margin),2),goal:lastGoal,previousAttempts:[]});
  expect(trimmed.report.pass,`level 4 margin ${margin}`).toBe(true);
 }
});

it('names the missing stretch and the tighter Last Spark budget in player-facing copy',()=>{
 expect(disconnectedSpanHint()).toMatch(/longer closed loop that reaches B/);
 expect(disconnectedSpanHint()).toMatch(/only you can extend the cyan outline/);
 expect(chapterIntro(2)).toMatch(/extend the loop/);
 expect(budgetHint(2000,1700)).toMatch(/2000 \/ 1700/);
 expect(friendlyFailure('DISCONNECTED_SPAN')).toMatch(/Connect A to B/);
 expect(friendlyFailure('RESOURCE_BUDGET')).toMatch(/tighter guide/);
});

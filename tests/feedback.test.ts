import {it,expect} from 'vitest';
import {samplePoint,strokeClosure,friendlyFailure,examplePoint} from '../src/game/feedback';
import {rasterize,OfflineStrategyProvider,goalFor,type Point} from '../src/game/engine';
it('preserves deliberate corners from sparse mouse input and yields a valid first bridge',()=>{const points:Point[]=[];for(const p of [[.07,.20],[.94,.20],[.94,.37],[.07,.37],[.07,.20]] as Point[])samplePoint(points,p);expect(points[1]).toEqual([.94,.20]);expect(strokeClosure(points).closed).toBe(true);expect(new OfflineStrategyProvider().plan({revision:1,playerMask:rasterize(points,1),goal:goalFor(1),previousAttempts:[]}).report.pass).toBe(true);});
it('distinguishes open outlines from near-closed loops',()=>{expect(strokeClosure([[.1,.2],[.9,.2],[.9,.4]]).closed).toBe(false);expect(strokeClosure([[.1,.2],[.9,.2],[.9,.4],[.11,.21]]).closed).toBe(true);});
it('gives an action instead of a technical failure label and a closed tutorial trace',()=>{expect(friendlyFailure('DISCONNECTED_SPAN')).toContain('Connect A to B');expect(examplePoint(.1,.9,.2,.4,0)).toEqual(examplePoint(.1,.9,.2,.4,1));});

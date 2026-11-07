import {describe,it,expect} from 'vitest';
import {N,index,emptyMask,rectangle,rasterize,buildIntersection,validate,OfflineStrategyProvider,goalFor,isCurrentRevision} from '../src/game/engine';
const planner=new OfflineStrategyProvider();
const plan=(front:ReturnType<typeof emptyMask>,level=1)=>planner.plan({revision:front.revision,playerMask:front,goal:goalFor(level),previousAttempts:[]});
describe('contours',()=>{
 it('fills a normal closed or automatically closed contour',()=>{expect(rasterize([[.1,.2],[.9,.2],[.9,.4],[.1,.4]],1).pixels.reduce((a,b)=>a+b,0)).toBeGreaterThan(100);});
 it('rejects empty and tiny input',()=>{for(const points of [[],[[.1,.1]],[[.1,.1],[.11,.1],[.11,.11]]] as [number,number][][])expect(rasterize(points,1).pixels.some(Boolean)).toBe(false);});
 it('clips edges, handles crossings and noisy points deterministically',()=>{for(const points of [[[-1,-1],[2,0],[2,2],[0,2]],[[0,0],[1,1],[0,1],[1,0]],[[.1,.2],[.10001,.200001],[.9,.2],[.9,.4],[.1,.4]]] as [number,number][][]){expect(rasterize(points,1)).toEqual(rasterize(points,1));}});
});
describe('volume invariants',()=>{
 it('is the exact orthogonal intersection',()=>{const f=rectangle(2,4,9,8),s=rectangle(12,5,18,9),v=buildIntersection(f,s);for(let z=0;z<N;z++)for(let y=0;y<N;y++)for(let x=0;x<N;x++)expect(v.occupancy[index(x,y,z)]).toBe(f.pixels[x+N*y]&s.pixels[z+N*y]);});
 it('is deterministic and removing pixels creates no voxels',()=>{const f=rectangle(2,4,9,8),s=rectangle(12,5,18,9),v=buildIntersection(f,s);expect(v).toEqual(buildIntersection(f,s));f.pixels.fill(0);const empty=buildIntersection(f,s);expect(empty.occupancy.some(Boolean)).toBe(false);});
});
describe('walkable surfaces and planner',()=>{
 it('solves level 1 using actual occupancy without changing player authorship',()=>{const f=rectangle(2,7,29,11,4),copy=f.pixels.slice(),r=plan(f);expect(r.report.pass).toBe(true);expect(r.report.path[0][0]).toBe(4);expect(r.report.path.at(-1)?.[0]).toBe(27);expect(f.pixels).toEqual(copy);for(const [x,y,z] of r.report.path)expect(r.volume.occupancy[index(x,y-1,z)]).toBe(1);});
 it('really fails level 2 missing X, then replans after three extensions',()=>{const f=rectangle(1,7,18,11),r=plan(f,2);expect(r.phase).toBe('needs-user');expect(r.report.failures).toContain('DISCONNECTED_SPAN');expect(r.report.diagnostics[0].columns).toEqual(Array.from({length:11},(_,i)=>19+i));for(const y of [6,7,8])expect(plan(rectangle(1,y,30,11),2).report.pass).toBe(true);});
 it('succeeds directly when level 2 drawing already spans the gap',()=>expect(plan(rectangle(1,7,30,11),2).phase).toBe('success'));
 it('adapts side projection to different valid player heights',()=>{const a=plan(rectangle(2,8,29,9)),b=plan(rectangle(2,4,29,11));expect(a.report.pass).toBe(true);expect(b.report.pass).toBe(true);expect(a.side.pixels).not.toEqual(b.side.pixels);});
 it('rejects thin floors and overhead obstruction',()=>{const goal=goalFor(1);expect(validate(buildIntersection(rectangle(2,9,29,9),rectangle(12,9,19,9)),goal).pass).toBe(false);const v=buildIntersection(rectangle(2,8,29,9),rectangle(12,8,19,9));for(let x=4;x<=27;x++)for(let z=0;z<N;z++)v.occupancy[index(x,11,z)]=1;expect(validate(v,goal).pass).toBe(false);});
 it('rejects disconnected or floating decks at wrong bank elevation',()=>{expect(plan(rectangle(1,20,30,24)).report.pass).toBe(false);const f=rectangle(2,7,29,11);for(let y=0;y<N;y++)f.pixels[15+N*y]=0;expect(plan(f).report.pass).toBe(false);});
 it('bounds candidate search and gives empty input guidance',()=>{const r=planner.plan({revision:1,playerMask:emptyMask(1),goal:goalFor(1),previousAttempts:[]},{maxCandidates:2,milliseconds:100});expect(r.attempts.length).toBeLessThanOrEqual(2);expect(r.report.failures).toContain('EMPTY_USER_MASK');expect(r.elapsed).toBeLessThan(300);});
 it('rejects stale worker responses',()=>{expect(isCurrentRevision(3,2)).toBe(false);expect(isCurrentRevision(3,3)).toBe(true);});
});

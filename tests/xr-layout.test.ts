import {describe,it,expect} from 'vitest';
import {BOARD,STATUS_PANEL,GHOST_BILLBOARD,hudWorldLayout,box3Center,XR_DEPTH_PANEL,XR_INSPECT_CUE,XR_REPLAY_BUTTON,XR_HOW_LUMA_BUTTON,XR_TOOLBAR} from '../src/game/hud-layout';

// Angular footprint (degrees) of world-space panels seen from the default standing head pose.
const EYE={x:0,y:1.6,z:0};
type Ang={id:string;az0:number;az1:number;el0:number;el1:number};
const deg=(r:number)=>r*180/Math.PI;
function footprint(id:string,c:readonly number[],w:number,h:number,yaw?:number):Ang{
  const facing=yaw??Math.atan2(-(c[0]-EYE.x),-(c[2]-EYE.z)); // billboard faces the eye
  const tx=Math.cos(facing),tz=-Math.sin(facing);
  const pts=[-1,1].flatMap(sx=>[-1,1].map(sy=>[c[0]+sx*w/2*tx,c[1]+sy*h/2,c[2]+sx*w/2*tz]));
  const az=pts.map(([x,,z])=>deg(Math.atan2(x-EYE.x,-(z-EYE.z))));
  const el=pts.map(([x,y,z])=>deg(Math.atan2(y-EYE.y,Math.hypot(x-EYE.x,z-EYE.z))));
  return {id,az0:Math.min(...az),az1:Math.max(...az),el0:Math.min(...el),el1:Math.max(...el)};
}
const gap=(a:Ang,b:Ang)=>Math.max(a.az0-b.az1,b.az0-a.az1,a.el0-b.el1,b.el0-a.el1);

describe('immersive layout from the default head pose',()=>{
  const hud=hudWorldLayout({x:-0.72,y:1.45,z:-1.65});
  const s=box3Center(hud.status),g=box3Center(hud.ghost);
  const toolbar=['Next level','Undo','Clear','Help','Enter XR','Settings'].map((id,i)=>footprint(id,[XR_TOOLBAR.x0+i*XR_TOOLBAR.dx,XR_TOOLBAR.y0,XR_TOOLBAR.z],XR_TOOLBAR.button.width,XR_TOOLBAR.button.height,0));
  const items=[
    footprint('Your outline',[-0.72,1.45,-1.65],BOARD.width,BOARD.height,0),
    footprint('status',[s.x,s.y,s.z],STATUS_PANEL.width,STATUS_PANEL.height,0),
    footprint('ghost',[g.x,g.y,g.z],GHOST_BILLBOARD.width,GHOST_BILLBOARD.height),
    footprint('LUMA depth',XR_DEPTH_PANEL.position,BOARD.width,BOARD.height,XR_DEPTH_PANEL.yaw),
    footprint('INSPECT DEPTH',XR_INSPECT_CUE.position,0.9,0.2),
    footprint('Replay example',XR_REPLAY_BUTTON.position,XR_TOOLBAR.button.width,XR_TOOLBAR.button.height,0),
    footprint('How LUMA thinks',XR_HOW_LUMA_BUTTON.position,XR_TOOLBAR.button.width,XR_TOOLBAR.button.height,0),
    ...toolbar,
  ];
  it('keeps the depth panel, its cue, Replay and How LUMA thinks clear of every other panel and the toolbar',()=>{
    const focus=['LUMA depth','INSPECT DEPTH','Replay example','How LUMA thinks'];
    for(const a of items)for(const b of items){
      if(a.id>=b.id||!(focus.includes(a.id)||focus.includes(b.id)))continue;
      const strip=toolbar.some(t=>t.id===a.id||t.id===b.id)&&(a.id==='How LUMA thinks'||b.id==='How LUMA thinks');
      expect(gap(a,b),`${a.id} vs ${b.id}`).toBeGreaterThan(strip?0.3:1);
    }
  });
  it('keeps the depth panel to the right of the centre yet inside a comfortable field of view',()=>{
    const depth=items.find(i=>i.id==='LUMA depth')!;
    const board=items[0];
    expect(depth.az0).toBeGreaterThan(board.az1+15);
    expect(depth.az1).toBeLessThan(50);
    for(const i of items)expect(Math.abs(i.az0)<55&&Math.abs(i.az1)<55,i.id).toBe(true);
    expect(XR_DEPTH_PANEL.yaw).toBeLessThan(0); // still angled inward as a side view
    expect(XR_DEPTH_PANEL.yaw).toBeGreaterThan(-Math.PI/2);
  });
});

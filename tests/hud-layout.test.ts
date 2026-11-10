import {describe,it,expect} from 'vitest';
import {
  outlinePanelRegions,
  statusPanelRegions,
  hudWorldLayout,
  endpointMarkerRegions,
  separated2,
  separated3,
  boxesOverlap2,
  boxesOverlap3,
  clampBoardUV,
  isNearBoard,
  localToUV,
  STATUS_CANVAS,
} from '../src/game/hud-layout';
import {estimateBoldWidth,wrapAndFit} from '../src/game/labels';
import {goalFor} from '../src/game/engine';

describe('HUD regions stay apart',()=>{
  it('keeps outline title, subtitle and footer from overlapping, with no in-panel ghost caption region',()=>{
    const regions=outlinePanelRegions();
    expect('ghost' in regions).toBe(false);
    expect(Object.keys(regions).sort()).toEqual(['footer','subtitle','title']);
    const result=separated2([regions.title,regions.subtitle,regions.footer]);
    expect(result,result.ok?'ok':`${result.a} overlaps ${result.b}`).toEqual({ok:true});
    expect(regions.title.y+regions.title.h).toBeLessThanOrEqual(regions.subtitle.y);
  });

  it('places exactly one GHOST EXAMPLE billboard above the board, clear of A/B markers and the status title',()=>{
    const hud=hudWorldLayout({x:-0.72,y:1.45,z:-1.65});
    const ghostBoxes=Object.values(hud).filter(box=>box.id.includes('GHOST EXAMPLE'));
    expect(ghostBoxes).toHaveLength(1);
    expect(ghostBoxes[0].id).toBe('GHOST EXAMPLE billboard');
    const result=separated3([hud.board,hud.ghost,hud.status]);
    expect(result,result.ok?'ok':`${result.a} overlaps ${result.b}`).toEqual({ok:true});
    expect(hud.ghost.minY).toBeGreaterThanOrEqual(hud.board.maxY);
    expect(hud.status.minY).toBeGreaterThanOrEqual(hud.ghost.maxY);
    expect(boxesOverlap3(hud.ghost,hud.status)).toBe(false);
    expect(boxesOverlap3(hud.ghost,hud.board)).toBe(false);
  });

  it('keeps in-panel chrome off the A and B marker badges',()=>{
    const goal=goalFor(1);
    const regions=outlinePanelRegions();
    const markers=endpointMarkerRegions(goal.source,goal.target);
    for(const chrome of Object.values(regions)){
      for(const marker of Object.values(markers)){
        expect(boxesOverlap2(chrome,marker),`${chrome.id} overlaps ${marker.id}`).toBe(false);
      }
    }
  });

  it('fits the full SOLID LIGHT: CO-CREATE title in its status region',()=>{
    const title=statusPanelRegions().title;
    const other=statusPanelRegions();
    expect(separated2([other.title,other.chapter,other.message])).toEqual({ok:true});
    for(const text of ['SOLID LIGHT: CO-CREATE','WE BUILT THIS TOGETHER']){
      const fitted=wrapAndFit(text,title.w,52,24,estimateBoldWidth);
      expect(fitted.lines.join(' ')).toContain(text.includes('CO-CREATE')?'CO-CREATE':'TOGETHER');
      expect(Math.max(...fitted.widths)).toBeLessThanOrEqual(title.w);
      expect(fitted.lines.length*(fitted.font+8)+16).toBeLessThanOrEqual(title.h);
      expect(fitted.lines.some(line=>line.includes('SOLID')||line.includes('WE BUILT'))).toBe(true);
    }
    expect(title.w).toBeLessThanOrEqual(STATUS_CANVAS.width);
  });
});

describe('board UV clamping',()=>{
  it('clamps a stroke that starts past the left edge onto the board and still counts as a nearby start',()=>{
    expect(localToUV(-BOARD_OFFSET(),0)).toEqual([0,0.5]);
    expect(clampBoardUV(-0.12,0.4)).toEqual([0,0.4]);
    expect(clampBoardUV(1.2,1.4)).toEqual([1,1]);
    expect(isNearBoard(-0.12,0.3)).toBe(true);
    expect(isNearBoard(-0.8,0.3)).toBe(false);
  });
});

function BOARD_OFFSET(){
  return 0.64; // half of 1.28 width → local x of left edge
}

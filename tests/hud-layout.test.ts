import {describe,it,expect} from 'vitest';
import {
  outlinePanelRegions,
  statusPanelRegions,
  hudWorldLayout,
  separated2,
  separated3,
  boxesOverlap3,
  clampBoardUV,
  isNearBoard,
  localToUV,
  STATUS_CANVAS,
} from '../src/game/hud-layout';
import {estimateBoldWidth,wrapAndFit} from '../src/game/labels';

describe('HUD regions stay apart',()=>{
  it('keeps outline title, subtitle, ghost caption and footer from overlapping',()=>{
    const regions=outlinePanelRegions();
    const result=separated2([regions.title,regions.subtitle,regions.ghost,regions.footer]);
    expect(result,result.ok?'ok':`${result.a} overlaps ${result.b}`).toEqual({ok:true});
    expect(regions.ghost.y).toBeGreaterThanOrEqual(regions.subtitle.y+regions.subtitle.h);
    expect(regions.title.y+regions.title.h).toBeLessThanOrEqual(regions.subtitle.y);
  });

  it('keeps the world-space ghost billboard out of the status title and the outline board',()=>{
    const hud=hudWorldLayout({x:-0.72,y:1.45,z:-1.65});
    const result=separated3([hud.board,hud.ghost,hud.status]);
    expect(result,result.ok?'ok':`${result.a} overlaps ${result.b}`).toEqual({ok:true});
    expect(hud.ghost.minY).toBeGreaterThanOrEqual(hud.board.maxY);
    expect(hud.status.minY).toBeGreaterThanOrEqual(hud.ghost.maxY);
    expect(boxesOverlap3(hud.ghost,hud.status)).toBe(false);
    expect(boxesOverlap3(hud.ghost,hud.board)).toBe(false);
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

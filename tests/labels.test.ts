import {it,expect,describe} from 'vitest';
import {
  OUTLINE_LABELS,
  estimateBoldWidth,
  wrapAndFit,
  fitsWidth,
  ghostCaption,
  panelTitle,
  panelTextWidth,
} from '../src/game/labels';

describe('seated-distance outline labels',()=>{
  it('keeps ghost and A/B labels large enough to read at a seated viewing distance',()=>{
    expect(OUTLINE_LABELS.ghostFont).toBeGreaterThanOrEqual(36);
    expect(OUTLINE_LABELS.endpointFont).toBeGreaterThanOrEqual(44);
    expect(OUTLINE_LABELS.endpointRadius).toBeGreaterThanOrEqual(22);
    expect(OUTLINE_LABELS.panelMargin).toBeGreaterThanOrEqual(40);
  });

  it('fits every ghost caption and panel title inside the inset panel width',()=>{
    const maxWidth=panelTextWidth();
    const captions=[
      ghostCaption(1),
      ghostCaption(2,false,true),
      ghostCaption(3,false),
      ghostCaption(3,true),
      panelTitle(false),
      panelTitle(true),
      'YOU CREATE LENGTH + HEIGHT · LUMA never edits your pixels',
      'LOCAL PLANNER · tests width, clearance and a walking path',
      'PINCH + HOLD → LOOP AROUND THE RIBBON → RELEASE',
    ];
    for(const text of captions){
      const fitted=wrapAndFit(text,maxWidth,OUTLINE_LABELS.ghostFont,18,estimateBoldWidth);
      expect(fitted.lines.length).toBeGreaterThan(0);
      expect(fitted.lines.length).toBeLessThanOrEqual(3);
      for(const [line,width] of fitted.lines.map((line,i)=>[line,fitted.widths[i]] as const)){
        expect(width,`${text} → "${line}" at ${fitted.font}px`).toBeLessThanOrEqual(maxWidth);
        expect(fitsWidth(line,fitted.font,maxWidth,estimateBoldWidth)).toBe(true);
      }
    }
  });

  it('keeps Your outline fully inside the left margin instead of hanging off the edge',()=>{
    const title=panelTitle(false);
    expect(title.startsWith('Your')).toBe(true);
    const width=estimateBoldWidth(title,OUTLINE_LABELS.panelTitleFont);
    expect(OUTLINE_LABELS.panelMargin+width).toBeLessThan(OUTLINE_LABELS.canvasWidth-OUTLINE_LABELS.panelMargin);
  });
});

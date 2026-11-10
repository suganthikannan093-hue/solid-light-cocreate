import {CanvasTexture, Sprite, SpriteMaterial} from '@iwsdk/core';

/** Type sizes on the 768×384 outline canvas, readable at a seated ~1.8 m view. */
export const OUTLINE_LABELS = {
  ghostFont: 42,
  ghostLine: 48,
  endpointFont: 48,
  endpointRadius: 24,
  captionPad: 10,
  panelMargin: 48,
  panelTitleFont: 30,
  panelSubtitleFont: 16,
  panelFooterFont: 18,
  canvasWidth: 768,
  canvasHeight: 384,
} as const;

export const BILLBOARD_CANVAS = {width: 1024, height: 320} as const;

export interface BillboardLabel {
  sprite: Sprite;
  texture: CanvasTexture;
  canvas: HTMLCanvasElement;
  text: string;
}

export function estimateBoldWidth(text: string, fontSize: number): number {
  // Conservative width for bold system-ui; tests can rely on this as a ceiling.
  return text.length * fontSize * 0.7;
}

export function wrapWords(
  text: string,
  maxWidth: number,
  measure: (line: string) => number,
): string[] {
  const explicit = text.split('\n');
  const lines: string[] = [];
  for (const paragraph of explicit) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    let line = words[0];
    for (const word of words.slice(1)) {
      const next = `${line} ${word}`;
      if (measure(next) <= maxWidth) line = next;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines.length ? lines : [text];
}

export function wrapAndFit(
  text: string,
  maxWidth: number,
  maxFont: number,
  minFont = 18,
  measure: (text: string, font: number) => number = estimateBoldWidth,
): {font: number; lines: string[]; widths: number[]} {
  let font = maxFont;
  let lines: string[] = [];
  let widths: number[] = [];
  while (font >= minFont) {
    lines = wrapWords(text, maxWidth, (line) => measure(line, font));
    widths = lines.map((line) => measure(line, font));
    if (widths.every((width) => width <= maxWidth) && lines.length <= 3) {
      return {font, lines, widths};
    }
    font -= 2;
  }
  lines = wrapWords(text, maxWidth, (line) => measure(line, minFont));
  return {font: minFont, lines, widths: lines.map((line) => measure(line, minFont))};
}

export function fitsWidth(text: string, font: number, maxWidth: number, measure = estimateBoldWidth): boolean {
  return measure(text, font) <= maxWidth;
}

export function ghostCaption(
  level: number,
  roofStep = false,
  needsExtension = false,
): string {
  if (level === 3) return roofStep ? 'GHOST EXAMPLE\nLoop the UPPER roof' : 'GHOST EXAMPLE\nLoop the LOWER path';
  if (level === 2 && needsExtension) return 'GHOST EXAMPLE\nLonger loop to B';
  return 'GHOST EXAMPLE\nPinch, go around, close';
}

export function panelTitle(agent: boolean): string {
  return agent ? 'LUMA’s depth' : 'Your outline';
}

/** Usable width for in-panel captions, inset so the left/right edges stay visible. */
export function panelTextWidth(canvasWidth: number = OUTLINE_LABELS.canvasWidth): number {
  return canvasWidth - OUTLINE_LABELS.panelMargin * 2;
}

export function createBillboardLabel(
  name: string,
  text: string,
  scale = {x: 0.9, y: 0.28},
): BillboardLabel {
  const canvas = document.createElement('canvas');
  canvas.width = BILLBOARD_CANVAS.width;
  canvas.height = BILLBOARD_CANVAS.height;
  const texture = new CanvasTexture(canvas);
  const sprite = new Sprite(
    new SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    }),
  );
  sprite.name = name;
  sprite.scale.set(scale.x, scale.y, 1);
  sprite.renderOrder = 50;
  sprite.raycast = () => {};
  const label: BillboardLabel = {sprite, texture, canvas, text: ''};
  paintBillboardLabel(label, text);
  return label;
}

export function paintBillboardLabel(
  label: BillboardLabel,
  text: string,
  options: {bg?: string; fill?: string} = {},
): void {
  if (label.text === text) return;
  label.text = text;
  const {canvas, texture} = label;
  const ctx = canvas.getContext('2d')!;
  const {width: w, height: h} = canvas;
  ctx.clearRect(0, 0, w, h);
  const measure = (line: string, font: number) => {
    ctx.font = `bold ${font}px system-ui, sans-serif`;
    return ctx.measureText(line).width;
  };
  const padX = 48;
  const padY = 36;
  const fitted = wrapAndFit(text, w - padX * 2, 72, 28, measure);
  const lineHeight = fitted.font + 16;
  const boxW = Math.min(w - 16, Math.max(...fitted.widths) + padX * 2);
  const boxH = Math.min(h - 16, fitted.lines.length * lineHeight + padY);
  const x = (w - boxW) / 2;
  const y = (h - boxH) / 2;
  const radius = 28;
  ctx.fillStyle = options.bg ?? 'rgba(4, 12, 24, 0.92)';
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + boxW, y, x + boxW, y + boxH, radius);
  ctx.arcTo(x + boxW, y + boxH, x, y + boxH, radius);
  ctx.arcTo(x, y + boxH, x, y, radius);
  ctx.arcTo(x, y, x + boxW, y, radius);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9ef7ee';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = options.fill ?? '#fff8e8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fitted.font}px system-ui, sans-serif`;
  fitted.lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, y + padY * 0.55 + lineHeight * (i + 0.5));
  });
  texture.needsUpdate = true;
}

export function paintOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  font: string,
  align: CanvasTextAlign = 'left',
  maxWidth?: number,
): void {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = '#06101c';
  ctx.lineWidth = 8;
  if (maxWidth !== undefined) {
    ctx.strokeText(text, x, y, maxWidth);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y, maxWidth);
    return;
  }
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export function paintFittedCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxFont: number,
  fill: string,
): {font: number; lines: string[]; width: number; height: number} {
  const measure = (line: string, font: number) => {
    ctx.font = `bold ${font}px system-ui, sans-serif`;
    return ctx.measureText(line).width;
  };
  const fitted = wrapAndFit(text, maxWidth, maxFont, 18, measure);
  const lineHeight = fitted.font + 10;
  const width = Math.max(...fitted.widths);
  const height = fitted.lines.length * lineHeight + 16;
  ctx.fillStyle = '#041018e6';
  ctx.fillRect(x - 8, y - fitted.font, width + 16, height);
  fitted.lines.forEach((line, i) => {
    paintOutlinedText(
      ctx,
      line,
      x,
      y + i * lineHeight,
      fill,
      `bold ${fitted.font}px system-ui`,
      'left',
      maxWidth,
    );
  });
  return {font: fitted.font, lines: fitted.lines, width, height};
}

export function paintCaptionInBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: {x: number; y: number; w: number; h: number},
  maxFont: number,
  fill: string,
): {font: number; lines: string[]; width: number; height: number} {
  const measure = (line: string, font: number) => {
    ctx.font = `bold ${font}px system-ui, sans-serif`;
    return ctx.measureText(line).width;
  };
  const fitted = wrapAndFit(text, box.w - 16, maxFont, 16, measure);
  const lineHeight = fitted.font + 8;
  const width = Math.min(box.w, Math.max(...fitted.widths) + 16);
  const height = Math.min(box.h, fitted.lines.length * lineHeight + 16);
  ctx.fillStyle = '#041018e6';
  ctx.fillRect(box.x, box.y, width, height);
  fitted.lines.forEach((line, i) => {
    const baseline = box.y + 8 + fitted.font * 0.85 + i * lineHeight;
    if (baseline <= box.y + box.h - 4) {
      paintOutlinedText(ctx, line, box.x + 8, baseline, fill, `bold ${fitted.font}px system-ui`, 'left', box.w - 16);
    }
  });
  return {font: fitted.font, lines: fitted.lines, width, height};
}

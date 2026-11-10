import {CanvasTexture, Sprite, SpriteMaterial} from '@iwsdk/core';

/** Type sizes on the 768×384 outline canvas, readable at a seated ~1.8 m view. */
export const OUTLINE_LABELS = {
  ghostFont: 42,
  ghostLine: 48,
  endpointFont: 36,
  endpointRadius: 18,
  captionPad: 10,
} as const;

export interface BillboardLabel {
  sprite: Sprite;
  texture: CanvasTexture;
  canvas: HTMLCanvasElement;
  text: string;
}

export function createBillboardLabel(
  name: string,
  text: string,
  scale = {x: 0.48, y: 0.14},
): BillboardLabel {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 224;
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
  const lines = text.split('\n');
  ctx.font = 'bold 72px system-ui, sans-serif';
  const padding = 28;
  const lineHeight = 84;
  const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const boxW = Math.min(w - 8, textWidth + padding * 2);
  const boxH = lines.length * lineHeight + padding;
  const x = (w - boxW) / 2;
  const y = (h - boxH) / 2;
  const radius = 28;
  ctx.fillStyle = options.bg ?? 'rgba(4, 12, 24, 0.88)';
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
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, y + padding + lineHeight * (i + 0.4));
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
): void {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = '#06101c';
  ctx.lineWidth = 8;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

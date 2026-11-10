import {N} from './engine.js';
import {OUTLINE_LABELS, panelTextWidth} from './labels.js';

export interface Box2 {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Box3 {
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export const BOARD = {width: 1.28, height: 0.64} as const;
export const HUD_GAP = 0.08;
export const GHOST_BILLBOARD = {width: 0.9, height: 0.16} as const;
export const STATUS_PANEL = {width: 1.65, height: 0.36, z: -1.95} as const;
export const STATUS_CANVAS = {width: 1536, height: 320} as const;
export const BOARD_START_MARGIN = 0.25;

export function outlinePanelRegions(
  w: number = OUTLINE_LABELS.canvasWidth,
  h: number = OUTLINE_LABELS.canvasHeight,
): {title: Box2; subtitle: Box2; footer: Box2} {
  const x = OUTLINE_LABELS.panelMargin;
  const width = panelTextWidth(w);
  return {
    title: {id: 'Your outline title', x, y: 8, w: width, h: 36},
    subtitle: {id: 'Your outline subtitle', x, y: 46, w: width, h: 30},
    footer: {id: 'panel footer', x, y: h - 32, w: width, h: 24},
  };
}

/** On-canvas A/B badge bounds. The GHOST EXAMPLE caption is a world-space billboard, not an in-panel label, so it must not occupy this space. */
export function endpointMarkerRegions(
  source: number,
  target: number,
  w: number = OUTLINE_LABELS.canvasWidth,
  h: number = OUTLINE_LABELS.canvasHeight,
): {a: Box2; b: Box2} {
  const radius = OUTLINE_LABELS.endpointRadius + 10;
  const boxFor = (cell: number, id: string): Box2 => {
    const cx = ((cell + 0.5) * w) / N;
    const cy = (1 - 9 / N) * h;
    const letterY = cy - 28;
    const minY = letterY - radius;
    const maxY = Math.max(letterY + radius, cy + OUTLINE_LABELS.endpointRadius);
    return {id, x: cx - radius, y: minY, w: radius * 2, h: maxY - minY};
  };
  return {a: boxFor(source, 'endpoint A'), b: boxFor(target, 'endpoint B')};
}

export function statusPanelRegions(
  w: number = STATUS_CANVAS.width,
  h: number = STATUS_CANVAS.height,
): {title: Box2; chapter: Box2; message: Box2} {
  const x = 48;
  const width = w - 96;
  return {
    title: {id: 'SOLID LIGHT: CO-CREATE title', x, y: 16, w: width, h: 88},
    chapter: {id: 'chapter line', x, y: 108, w: width, h: 40},
    message: {id: 'status message', x, y: 156, w: width, h: h - 172},
  };
}

export function hudWorldLayout(plane: {x: number; y: number; z: number}): {
  board: Box3;
  ghost: Box3;
  status: Box3;
} {
  const board: Box3 = {
    id: 'Your outline board',
    minX: plane.x - BOARD.width / 2,
    maxX: plane.x + BOARD.width / 2,
    minY: plane.y - BOARD.height / 2,
    maxY: plane.y + BOARD.height / 2,
    minZ: plane.z - 0.04,
    maxZ: plane.z + 0.1,
  };
  const ghost: Box3 = {
    id: 'GHOST EXAMPLE billboard',
    minX: plane.x - GHOST_BILLBOARD.width / 2,
    maxX: plane.x + GHOST_BILLBOARD.width / 2,
    minY: board.maxY + HUD_GAP,
    maxY: board.maxY + HUD_GAP + GHOST_BILLBOARD.height,
    minZ: plane.z - 0.06,
    maxZ: plane.z + 0.12,
  };
  const status: Box3 = {
    id: 'SOLID LIGHT: CO-CREATE panel',
    minX: -STATUS_PANEL.width / 2,
    maxX: STATUS_PANEL.width / 2,
    minY: ghost.maxY + HUD_GAP,
    maxY: ghost.maxY + HUD_GAP + STATUS_PANEL.height,
    minZ: STATUS_PANEL.z - 0.04,
    maxZ: STATUS_PANEL.z + 0.04,
  };
  return {board, ghost, status};
}

export function box2Center(box: Box2): {x: number; y: number} {
  return {x: box.x + box.w / 2, y: box.y + box.h / 2};
}

export function box3Center(box: Box3): {x: number; y: number; z: number} {
  return {x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2, z: (box.minZ + box.maxZ) / 2};
}

export function boxesOverlap2(a: Box2, b: Box2): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function boxesOverlap3(a: Box3, b: Box3): boolean {
  return (
    a.minX < b.maxX &&
    a.maxX > b.minX &&
    a.minY < b.maxY &&
    a.maxY > b.minY &&
    a.minZ < b.maxZ &&
    a.maxZ > b.minZ
  );
}

export function separated2(boxes: Box2[]): {ok: true} | {ok: false; a: string; b: string} {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (boxesOverlap2(boxes[i], boxes[j])) return {ok: false, a: boxes[i].id, b: boxes[j].id};
    }
  }
  return {ok: true};
}

export function separated3(boxes: Box3[]): {ok: true} | {ok: false; a: string; b: string} {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (boxesOverlap3(boxes[i], boxes[j])) return {ok: false, a: boxes[i].id, b: boxes[j].id};
    }
  }
  return {ok: true};
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function localToUV(localX: number, localY: number): [number, number] {
  return [localX / BOARD.width + 0.5, localY / BOARD.height + 0.5];
}

export function clampBoardUV(u: number, v: number): [number, number] {
  return [clamp01(u), clamp01(v)];
}

export function isNearBoard(u: number, v: number, margin = BOARD_START_MARGIN): boolean {
  return u >= -margin && u <= 1 + margin && v >= -margin && v <= 1 + margin;
}

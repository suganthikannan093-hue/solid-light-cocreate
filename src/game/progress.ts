/** Versioned localStorage progress. Missing or private-mode storage is a no-op, never a throw. */

export const SAVE_KEY = 'solid-light-cocreate/progress/v1';
export const SAVE_VERSION = 1;

export type StrategyPref = 'sturdy' | 'efficient';

export interface SettingsSave {
  muted: boolean;
  volume: number;
  reduced: boolean;
  contrast: boolean;
  preferPassthrough: boolean;
  strategy: StrategyPref;
}

export interface ChapterRecord {
  bestStrokes: number;
  stars: number;
  completions: number;
}

export interface ProgressSave {
  version: number;
  completed: number[];
  currentChapter: number;
  workshopUnlocked: boolean;
  workshopVariant: number;
  records: Record<string, ChapterRecord>;
  settings: SettingsSave;
  savedAt: number;
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const defaultSettings = (): SettingsSave => ({
  muted: false,
  volume: 0.8,
  reduced: false,
  contrast: false,
  preferPassthrough: false,
  strategy: 'sturdy',
});

export const emptyProgress = (): ProgressSave => ({
  version: SAVE_VERSION,
  completed: [],
  currentChapter: 1,
  workshopUnlocked: false,
  workshopVariant: 0,
  records: {},
  settings: defaultSettings(),
  savedAt: 0,
});

/** Par strokes for a 3-star finish. Chapter 2 is short loop + repair. */
export function chapterPar(level: number): number {
  if (level === 1) return 1;
  if (level === 2 || level === 3 || level === 4) return 2;
  return 2;
}

export function starRating(level: number, strokes: number): number {
  if (!Number.isFinite(strokes) || strokes <= 0) return 1;
  const par = chapterPar(level);
  if (strokes <= par) return 3;
  if (strokes <= par + 1) return 2;
  return 1;
}

export function recordKey(level: number, variant = 0): string {
  return level === 4 && variant > 0 ? `4-${((variant - 1) % 4) + 1}` : String(level);
}

export function hasResume(save: ProgressSave | null | undefined): boolean {
  if (!save) return false;
  return save.completed.length > 0 || save.currentChapter > 1 || save.workshopUnlocked;
}

export function defaultStorage(): StorageLike | undefined {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return undefined;
    // Probe private-mode / blocked storage without leaving a remnant.
    const probe = `${SAVE_KEY}::__probe`;
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return undefined;
  }
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0.8;
  return Math.max(0, Math.min(1, value));
}

function asChapterList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 4))];
}

function asRecordMap(value: unknown): Record<string, ChapterRecord> {
  if (!value || typeof value !== 'object') return {};
  const records: Record<string, ChapterRecord> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!/^[1-4](-[1-4])?$/.test(key) || !raw || typeof raw !== 'object') continue;
    const entry = raw as Record<string, unknown>;
    const bestStrokes = Number(entry.bestStrokes);
    const stars = Number(entry.stars);
    const completions = Number(entry.completions);
    if (!Number.isFinite(bestStrokes) || bestStrokes < 1) continue;
    records[key] = {
      bestStrokes: Math.floor(bestStrokes),
      stars: Math.max(1, Math.min(3, Number.isFinite(stars) ? Math.floor(stars) : 1)),
      completions: Math.max(1, Number.isFinite(completions) ? Math.floor(completions) : 1),
    };
  }
  return records;
}

function asSettings(value: unknown): SettingsSave {
  const base = defaultSettings();
  if (!value || typeof value !== 'object') return base;
  const raw = value as Record<string, unknown>;
  return {
    muted: raw.muted === true,
    volume: clampVolume(Number(raw.volume)),
    reduced: raw.reduced === true,
    contrast: raw.contrast === true,
    preferPassthrough: raw.preferPassthrough === true,
    strategy: raw.strategy === 'efficient' ? 'efficient' : 'sturdy',
  };
}

/** Accept current and older unversioned shapes; reject junk. */
export function migrateProgress(raw: unknown): ProgressSave | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;
  const version = Number(input.version ?? 1);
  if (!Number.isFinite(version) || version < 1) return null;
  // Future versions are read best-effort if the shape is still recognizable.
  const completed = asChapterList(input.completed);
  const currentChapter = Number(input.currentChapter ?? (completed.length ? Math.min(4, Math.max(...completed) + 1) : 1));
  if (!Number.isInteger(currentChapter) || currentChapter < 1 || currentChapter > 4) return null;
  const workshopVariant = Number(input.workshopVariant ?? 0);
  if (!Number.isFinite(workshopVariant) || workshopVariant < 0) return null;
  const workshopUnlocked = input.workshopUnlocked === true || completed.includes(4);
  const savedAt = Number(input.savedAt ?? 0);
  return {
    version: SAVE_VERSION,
    completed,
    currentChapter,
    workshopUnlocked,
    workshopVariant: Math.floor(workshopVariant),
    records: asRecordMap(input.records),
    settings: asSettings(input.settings),
    savedAt: Number.isFinite(savedAt) ? savedAt : 0,
  };
}

export function loadProgress(storage: StorageLike | undefined = defaultStorage()): ProgressSave | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    return migrateProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProgress(save: ProgressSave, storage: StorageLike | undefined = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    const payload = migrateProgress({...save, version: SAVE_VERSION, savedAt: save.savedAt || Date.now()});
    if (!payload) return false;
    storage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(
  storage: StorageLike | undefined = defaultStorage(),
  options: {keepSettings?: boolean} = {},
): ProgressSave {
  const previous = loadProgress(storage);
  const next = emptyProgress();
  if (options.keepSettings && previous) next.settings = previous.settings;
  if (!storage) return next;
  try {
    if (options.keepSettings) storage.setItem(SAVE_KEY, JSON.stringify({...next, savedAt: Date.now()}));
    else storage.removeItem(SAVE_KEY);
  } catch {
    /* private mode */
  }
  return next;
}

export function updateRecord(
  records: Record<string, ChapterRecord>,
  level: number,
  strokes: number,
  variant = 0,
): Record<string, ChapterRecord> {
  const key = recordKey(level, variant);
  const stars = starRating(level, strokes);
  const previous = records[key];
  const bestStrokes = previous ? Math.min(previous.bestStrokes, strokes) : strokes;
  return {
    ...records,
    [key]: {
      bestStrokes,
      stars: Math.max(previous?.stars ?? 1, starRating(level, bestStrokes)),
      completions: (previous?.completions ?? 0) + 1,
    },
  };
}

export const WORKSHOP_PRESETS = [
  {id: 0, label: 'Remix 1 · slender span'},
  {id: 1, label: 'Remix 2 · wider stance'},
  {id: 2, label: 'Remix 3 · tighter budget'},
  {id: 3, label: 'Remix 4 · longest crossing'},
] as const;

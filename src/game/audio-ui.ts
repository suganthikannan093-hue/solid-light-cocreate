export interface AudioView {
  state: string;
  muted: boolean;
  paused: boolean;
  music: boolean;
  voice: string;
  volume: number;
  error: string;
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0.8;
  return Math.max(0, Math.min(1, value));
}

export function audioStatusLabel(view: AudioView): string {
  if (view.error) return view.error;
  if (view.paused) return 'Audio paused with the game. Resume to hear music and guidance.';
  if (view.state === 'locked' || view.state === 'suspended' || view.state === '') {
    return 'Tap Enable sound to hear music and LUMA’s voice.';
  }
  const pct = Math.round(clampVolume(view.volume) * 100);
  if (view.muted || pct === 0) return `Sound off · volume ${pct}%`;
  if (view.voice) return `Playing guidance · volume ${pct}%`;
  if (view.music) return `Music on · volume ${pct}%`;
  return `Sound ready · volume ${pct}%`;
}

export function muteButtonLabel(muted: boolean): string {
  return muted ? 'Sound off' : 'Sound on';
}

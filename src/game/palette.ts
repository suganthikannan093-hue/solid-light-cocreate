/** Authorship colors: cyan/teal is the player, amber is LUMA, gold dashed is the demo only. */
export const PALETTE = {
  playerFill: '#2fe0d2',
  playerFillContrast: '#7ffff6',
  playerStroke: '#c7fffb',
  playerCap: '#6affdf',
  playerGlow: '#55fff0',
  playerLegend: '#66e7e4',
  lumaFill: '#ffc57a',
  lumaFillContrast: '#ffd9a3',
  lumaGap: '#ffb05699',
  lumaLegend: '#ffc57a',
  lumaSolid: 0xb9c8ff,
  lumaSolidEmissive: 0x3249bc,
  lumaFail: 0xe7b0a0,
  lumaFailEmissive: 0x7a2e2e,
  ghostStroke: '#e8d24a',
  ghostFill: '#c9a61ccc',
  ghostTag: '#ffe86a',
  ghostTagStroke: '#1a1602',
  endpoint: '#e9f4f9',
} as const;

export function contrastRatio(hexA: string, hexB: string): number {
  const lum = (hex: string) => {
    const n = hex.replace('#', '').slice(0, 6);
    const ch = (i: number) => {
      const v = parseInt(n.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
  };
  const a = lum(hexA), b = lum(hexB);
  const hi = Math.max(a, b), lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

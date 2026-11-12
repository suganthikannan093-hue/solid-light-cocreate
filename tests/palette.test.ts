import {it,expect} from 'vitest';
import {PALETTE,contrastRatio} from '../src/game/palette';

const BOARD='#0d1b30';
const BODY='#090f23';
const rgb=(hex:string)=>{const n=hex.replace('#','').slice(0,6);return {r:parseInt(n.slice(0,2),16),g:parseInt(n.slice(2,4),16),b:parseInt(n.slice(4,6),16)};};

it('keeps player cyan, LUMA amber and the ghost gold distinct on the dark board',()=>{
 expect(contrastRatio(PALETTE.playerFill,BOARD)).toBeGreaterThan(4.5);
 expect(contrastRatio(PALETTE.lumaFill,BOARD)).toBeGreaterThan(4.5);
 expect(contrastRatio(PALETTE.ghostStroke,BOARD)).toBeGreaterThan(4.5);
 expect(contrastRatio(PALETTE.playerFill,BODY)).toBeGreaterThan(4.5);
 const player=rgb(PALETTE.playerFill),luma=rgb(PALETTE.lumaFill),ghost=rgb(PALETTE.ghostStroke);
 expect(player.b).toBeGreaterThan(player.r); // cyan / teal
 expect(luma.r).toBeGreaterThan(luma.b+80); // orange amber
 expect(ghost.g).toBeGreaterThan(ghost.b+80); // yellow gold
 expect(ghost.b).toBeLessThan(luma.b); // less orange than LUMA
 expect(PALETTE.playerFill).not.toBe(PALETTE.lumaFill);
 expect(PALETTE.ghostStroke).not.toBe(PALETTE.lumaFill);
 expect(PALETTE.ghostStroke).not.toBe(PALETTE.playerFill);
});

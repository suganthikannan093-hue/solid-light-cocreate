import {it,expect} from 'vitest';
import {OUTLINE_LABELS} from '../src/game/labels';

it('keeps ghost and A/B labels large enough to read at a seated viewing distance',()=>{
 expect(OUTLINE_LABELS.ghostFont).toBeGreaterThanOrEqual(36);
 expect(OUTLINE_LABELS.endpointFont).toBeGreaterThanOrEqual(32);
 expect(OUTLINE_LABELS.endpointRadius).toBeGreaterThanOrEqual(16);
});

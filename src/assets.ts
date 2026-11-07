import { defineAssets } from '@iwsdk/core';
import { drawingPlane, bank, creature } from './scene-assets/light.scene-asset.js';
export default defineAssets({ 'drawing-plane': drawingPlane(), bank:bank(), creature:creature() });

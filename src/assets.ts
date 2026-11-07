import { defineAssets } from '@iwsdk/core';
import { drawingPlane, bank, creature } from './scene-assets/light.scene-asset.js';
import { lightGarden } from './scene-assets/garden.scene-asset.js';
export default defineAssets({ 'light-garden':lightGarden(), 'drawing-plane': drawingPlane(), bank:bank(), creature:creature() });

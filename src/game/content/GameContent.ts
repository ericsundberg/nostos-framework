import type { Texture } from 'pixi.js';

import type { GameplayData } from '../data/GameplayData';
import type { TitleScreenData } from '../data/TitleScreenData';

export interface GameContentAssets {
  markerTexture: Texture;
  mainMenuMusicUrl: string;
}

export interface GameContentData {
  gameplay: GameplayData;
  titleScreen: TitleScreenData;
}

export interface GameContent {
  assets: GameContentAssets;
  data: GameContentData;
}

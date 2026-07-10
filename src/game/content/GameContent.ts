import type { Texture } from 'pixi.js';

import type { GameplayData } from '../data/GameplayData';
import type { MusicData } from '../music/MusicData';
import type { TitleScreenData } from '../data/TitleScreenData';

export interface GameContentAssets {
  markerTexture: Texture;
}

export interface GameContentData {
  gameplay: GameplayData;
  music: MusicData;
  titleScreen: TitleScreenData;
}

export interface GameContent {
  assets: GameContentAssets;
  data: GameContentData;
}
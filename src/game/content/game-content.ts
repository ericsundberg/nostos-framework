import type { Texture } from 'pixi.js';

import type { GameplayData } from '../data/gameplay-data';
import type { MusicData } from '../music/music-data';
import type { TitleScreenData } from '../data/title-screen-data';

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
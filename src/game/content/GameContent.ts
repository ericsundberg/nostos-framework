import type { Texture } from 'pixi.js';

import type { GameplayData } from '../data/GameplayData';
import type { LocalizationData } from '../localization/LocalizationData';
import type { MusicData } from '../music/MusicData';
import type { TitleScreenData } from '../data/TitleScreenData';

export interface GameContentAssets {
  markerTexture: Texture;
}

export interface GameContentData {
  gameplay: GameplayData;
  localization: LocalizationData;
  music: MusicData;
  titleScreen: TitleScreenData;
}

export interface GameContent {
  assets: GameContentAssets;
  data: GameContentData;
}
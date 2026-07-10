import {
  Assets,
  Texture,
} from 'pixi.js';

import { initializeAssetBundles } from '../../core/assets/initializeAssetBundles';
import { loadAssetManifest } from '../../core/assets/loadAssetManifest';
import { loadJsonAsset } from '../../core/data/loadJsonAsset';
import {
  isGameplayData,
  type GameplayData,
} from '../data/GameplayData';
import {
  isTitleScreenData,
  type TitleScreenData,
} from '../data/TitleScreenData';
import {
  isMusicData,
  type MusicData,
} from '../music/MusicData';
import type { GameContent } from './GameContent';

export interface LoadGameContentOptions {
  resolveAssetUrl: (
    relativePath: string,
  ) => string;
}

export const loadGameContent =
  async (
    options: LoadGameContentOptions,
  ): Promise<GameContent> => {
    const { resolveAssetUrl } = options;

    const music =
      await loadJsonAsset<MusicData>({
        relativePath:
          'music.json',

        resolveAssetUrl,

        validate:
          isMusicData,
      });

    console.info(
      'Loaded validated music data.',
    );

    const titleScreen =
      await loadJsonAsset<TitleScreenData>({
        relativePath:
          'data/title-screen.json',

        resolveAssetUrl,

        validate:
          isTitleScreenData,
      });

    console.info(
      'Loaded validated title-screen data.',
    );

    const gameplay =
      await loadJsonAsset<GameplayData>({
        relativePath:
          'data/gameplay.json',

        resolveAssetUrl,

        validate:
          isGameplayData,
      });

    console.info(
      'Loaded validated gameplay data.',
    );

    const manifest =
      await loadAssetManifest(
        resolveAssetUrl,
      );

    await initializeAssetBundles(
      manifest,
      resolveAssetUrl,
    );

    const startupAssets:
      Record<string, unknown> =
        await Assets.loadBundle(
          'startup',
        );

    const markerTexture =
      startupAssets[
        'ui.pipeline-marker'
      ];

    if (
      !(markerTexture instanceof Texture)
    ) {
      throw new Error(
        'The startup bundle did not provide ui.pipeline-marker.',
      );
    }

    console.info(
      `Loaded asset manifest schema ${
        manifest.schemaVersion
      }.`,
    );

    console.info(
      'Loaded PixiJS startup asset bundle.',
    );

    return {
      assets: {
        markerTexture,
      },

      data: {
        gameplay,
        music,
        titleScreen,
      },
    };
  };
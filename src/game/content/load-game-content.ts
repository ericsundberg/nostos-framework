import {
  Assets,
  Texture,
} from 'pixi.js';

import { initializeAssetBundles } from '../../core/assets/initialize-asset-bundles';
import { loadAssetManifest } from '../../core/assets/load-asset-manifest';
import { loadJsonAsset } from '../../core/data/load-json-asset';
import {
  isGameplayData,
  type GameplayData,
} from '../data/gameplay-data';
import {
  isTitleScreenData,
  type TitleScreenData,
} from '../data/title-screen-data';
import {
  isMusicData,
  type MusicData,
} from '../music/music-data';
import type { GameContent } from './game-content';

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
          'audio/music/music-manifest.json',

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
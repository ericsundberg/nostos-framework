import {
  Assets,
  Texture,
} from 'pixi.js';

import { createGameApplication } from '../../core/application/createGameApplication';
import { initializeAssetBundles } from '../../core/assets/initializeAssetBundles';
import { loadAssetManifest } from '../../core/assets/loadAssetManifest';
import { loadJsonAsset } from '../../core/data/loadJsonAsset';
import { SettingsManager } from '../../core/settings/SettingsManager';
import {
  isTitleScreenData,
  type TitleScreenData,
} from '../data/TitleScreenData';
import {
  type GameSettings,
  normalizeGameSettings,
} from '../settings/GameSettings';
import { GameServices } from './GameServices';

export const createGameServices =
  async (
    host: HTMLElement,
  ): Promise<GameServices> => {
    const resolveAssetUrl = (
      relativePath: string,
    ): string =>
      window.gamePlatform.assets.url(
        relativePath,
      );

    const settings =
      new SettingsManager<GameSettings>({
        normalize:
          normalizeGameSettings,

        storage: {
          load: () =>
            window.gamePlatform
              .settings.load(),

          save: (value) =>
            window.gamePlatform
              .settings.save(value),
        },
      });

    await settings.load();

    console.info(
      'Loaded persistent game settings.',
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

    const app =
      await createGameApplication({
        background: '#111318',
        resizeTo: window,
        antialias: true,
      });

    const services =
      new GameServices({
        app,
        host,
        settings,

        assets: {
          markerTexture,
        },

        data: {
          titleScreen,
        },
      });

    services.input.bindAction(
      'ui.confirm',
      ['Enter', 'Space'],
    );

    services.input.bindAction(
      'ui.back',
      ['Escape'],
    );

    services.input.bindAction(
      'settings.toggleMarker',
      ['KeyM'],
    );

    return services;
  };
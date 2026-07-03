import {
  Assets,
  Texture,
} from 'pixi.js';

import { createGameApplication } from '../core/application/createGameApplication';
import { initializeAssetBundles } from '../core/assets/initializeAssetBundles';
import { loadAssetManifest } from '../core/assets/loadAssetManifest';
import { InputManager } from '../core/input/InputManager';
import { SceneManager } from '../core/scenes/SceneManager';
import { SettingsManager } from '../core/settings/SettingsManager';
import {
  type GameSettings,
  normalizeGameSettings,
} from './settings/GameSettings';
import { InputTestScene } from './scenes/InputTestScene';
import { TitleScene } from './scenes/TitleScene';

export async function startGame(
  host: HTMLElement,
): Promise<void> {
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

  host.appendChild(app.canvas);

  const input = new InputManager();

  input.bindAction(
    'ui.confirm',
    ['Enter', 'Space'],
  );

  input.bindAction(
    'ui.back',
    ['Escape'],
  );

  input.bindAction(
    'settings.toggleMarker',
    ['KeyM'],
  );

  const sceneManager =
    new SceneManager(app);

  function showTitleScene(): void {
    sceneManager.show(
      new TitleScene({
        markerTexture,
        input,
        settings,
        onContinue:
          showInputTestScene,
      }),
    );
  }

  function showInputTestScene():
    void {
    sceneManager.show(
      new InputTestScene({
        input,
        settings,
        onBack: showTitleScene,
      }),
    );
  }

  showTitleScene();

  window.addEventListener(
    'beforeunload',
    () => {
      sceneManager.destroy();
      input.destroy();
    },
    {
      once: true,
    },
  );
}
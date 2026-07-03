import {
  Assets,
  Texture,
} from 'pixi.js';

import { createGameApplication } from '../core/application/createGameApplication';
import { initializeAssetBundles } from '../core/assets/initializeAssetBundles';
import { loadAssetManifest } from '../core/assets/loadAssetManifest';
import { InputManager } from '../core/input/InputManager';
import { SceneManager } from '../core/scenes/SceneManager';
import { InputTestScene } from './scenes/InputTestScene';
import { TitleScene } from './scenes/TitleScene';

export async function startGame(
  host: HTMLElement,
): Promise<void> {
  const resolveAssetUrl = (
    relativePath: string,
  ): string =>
    window.gamePlatform.assets.url(relativePath);

  const manifest = await loadAssetManifest(
    resolveAssetUrl,
  );

  await initializeAssetBundles(
    manifest,
    resolveAssetUrl,
  );

  const startupAssets: Record<string, unknown> =
    await Assets.loadBundle('startup');

  const markerTexture =
    startupAssets['ui.pipeline-marker'];

  if (!(markerTexture instanceof Texture)) {
    throw new Error(
      'The startup bundle did not provide ui.pipeline-marker.',
    );
  }

  console.info(
    `Loaded asset manifest schema ${manifest.schemaVersion}.`,
  );

  console.info(
    'Loaded PixiJS startup asset bundle.',
  );

  const app = await createGameApplication({
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

  const sceneManager = new SceneManager(app);

  function showTitleScene(): void {
    sceneManager.show(
      new TitleScene({
        markerTexture,
        input,
        onContinue: showInputTestScene,
      }),
    );
  }

  function showInputTestScene(): void {
    sceneManager.show(
      new InputTestScene({
        input,
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
import {
  Assets,
  Texture,
} from 'pixi.js';

import { createGameApplication } from '../core/application/createGameApplication';
import { initializeAssetBundles } from '../core/assets/initializeAssetBundles';
import { loadAssetManifest } from '../core/assets/loadAssetManifest';
import { SceneManager } from '../core/scenes/SceneManager';
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

  const sceneManager = new SceneManager(app);

  sceneManager.show(
    new TitleScene({
      markerTexture,
    }),
  );
}
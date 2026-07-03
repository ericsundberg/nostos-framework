import { createGameApplication } from '../core/application/createGameApplication';
import { loadAssetManifest } from '../core/assets/loadAssetManifest';
import { createTitleScene } from './scenes/createTitleScene';

export async function startGame(host: HTMLElement): Promise<void> {
  const manifest = await loadAssetManifest(
    (relativePath) =>
      window.gamePlatform.assets.url(relativePath),
  );

  console.info(
    `Loaded asset manifest schema ${manifest.schemaVersion}.`,
  );

  const app = await createGameApplication({
    background: '#111318',
    resizeTo: window,
    antialias: true,
  });

  host.appendChild(app.canvas);

  const titleScene = createTitleScene();
  app.stage.addChild(titleScene);

  const layoutTitleScene = (): void => {
    titleScene.position.set(
      app.screen.width / 2,
      app.screen.height / 2,
    );
  };

  layoutTitleScene();
  window.addEventListener('resize', layoutTitleScene);
}
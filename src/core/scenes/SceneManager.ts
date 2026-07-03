import type {
  Application,
  Ticker,
} from 'pixi.js';

import type { Scene } from './Scene';

export class SceneManager {
  private activeScene: Scene | null = null;

  public constructor(
    private readonly app: Application,
  ) {
    this.app.ticker.add(this.handleUpdate);
    window.addEventListener(
      'resize',
      this.handleResize,
    );
  }

  public show(scene: Scene): void {
    if (scene === this.activeScene) {
      return;
    }

    this.removeActiveScene();

    this.activeScene = scene;
    this.app.stage.addChild(scene.view);

    this.resizeActiveScene();
    scene.enter?.();
  }

  public destroy(): void {
    window.removeEventListener(
      'resize',
      this.handleResize,
    );

    this.app.ticker.remove(this.handleUpdate);
    this.removeActiveScene();
  }

  private readonly handleUpdate = (
    ticker: Ticker,
  ): void => {
    this.activeScene?.update?.(ticker.deltaMS);
  };

  private readonly handleResize = (): void => {
    this.resizeActiveScene();
  };

  private resizeActiveScene(): void {
    this.activeScene?.resize(
      this.app.screen.width,
      this.app.screen.height,
    );
  }

  private removeActiveScene(): void {
    const scene = this.activeScene;

    if (scene === null) {
      return;
    }

    scene.exit?.();

    if (scene.view.parent === this.app.stage) {
      this.app.stage.removeChild(scene.view);
    }

    scene.destroy?.();
    this.activeScene = null;
  }
}
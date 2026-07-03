import type {
  Application,
  Texture,
} from 'pixi.js';

import { InputManager } from '../../core/input/InputManager';
import { SceneManager } from '../../core/scenes/SceneManager';
import type { SettingsManager } from '../../core/settings/SettingsManager';
import type { TitleScreenData } from '../data/TitleScreenData';
import type { GameSettings } from '../settings/GameSettings';

export interface GameAssets {
  markerTexture: Texture;
}

export interface GameData {
  titleScreen: TitleScreenData;
}

export interface GameServicesOptions {
  app: Application;
  host: HTMLElement;
  settings: SettingsManager<GameSettings>;
  assets: GameAssets;
  data: GameData;
}

export class GameServices {
  public readonly app: Application;

  public readonly input:
    InputManager;

  public readonly scenes:
    SceneManager;

  public readonly settings:
    SettingsManager<GameSettings>;

  public readonly assets:
    GameAssets;

  public readonly data:
    GameData;

  private isDestroyed = false;

  public constructor(
    options: GameServicesOptions,
  ) {
    this.app = options.app;
    this.settings = options.settings;
    this.assets = options.assets;
    this.data = options.data;

    options.host.appendChild(
      this.app.canvas,
    );

    this.input =
      new InputManager();

    this.scenes =
      new SceneManager(this.app);
  }

  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    this.scenes.destroy();
    this.input.destroy();

    this.app.destroy(
      {
        removeView: true,
      },
      {
        children: true,
      },
    );
  }
}
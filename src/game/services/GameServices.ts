import type { Application } from 'pixi.js';

import { InputManager } from '../../core/input/InputManager';
import { SceneManager } from '../../core/scenes/SceneManager';
import type { SettingsManager } from '../../core/settings/SettingsManager';
import type { GameContent } from '../content/GameContent';
import type { GameSettings } from '../settings/GameSettings';
import type { MusicService } from './MusicService';

export interface GameServicesOptions {
  app: Application;
  host: HTMLElement;
  settings:
    SettingsManager<GameSettings>;
  music: MusicService;
  resolveAssetUrl: (
    relativePath: string,
  ) => string;
}

export class GameServices {
  public readonly app: Application;

  public readonly input:
    InputManager;

  public readonly scenes:
    SceneManager;

  public readonly settings:
    SettingsManager<GameSettings>;

  public readonly music:
    MusicService;

  public readonly resolveAssetUrl:
    (relativePath: string) => string;

  private content:
    GameContent | null = null;

  private isDestroyed = false;

  public constructor(
    options: GameServicesOptions,
  ) {
    this.app = options.app;
    this.settings = options.settings;
    this.music = options.music;
    this.resolveAssetUrl =
      options.resolveAssetUrl;

    options.host.appendChild(
      this.app.canvas,
    );

    this.input =
      new InputManager();

    this.scenes =
      new SceneManager(this.app);
  }

  public setContent(
    content: GameContent,
  ): void {
    this.content = content;
  }

  public getContent(): GameContent {
    if (this.content === null) {
      throw new Error(
        'Game content has not been loaded.',
      );
    }

    return this.content;
  }

  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    this.music.destroy();
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

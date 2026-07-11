import type { Application } from 'pixi.js';

import { InputManager } from '../../core/input/input-manager';
import { SceneManager } from '../../core/scenes/scene-manager';
import type { SettingsManager } from '../../core/settings/settings-manager';
import type { GameContent } from '../content/game-content';
import type { LocalizationData } from '../localization/localization-data';
import { LocalizationService } from '../localization/localization-service';
import { MusicDirector } from '../music/music-director';
import type { GameSettings } from '../settings/game-settings';
import { FrameRateService } from './frame-rate-service';
import type { MusicService } from './music-service';

export interface GameServicesOptions {
  app: Application;
  host: HTMLElement;
  settings:
    SettingsManager<GameSettings>;
  music: MusicService;
  resolveAssetUrl: (
    relativePath: string,
  ) => string;
  quitApp: () => Promise<void>;
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

  public readonly frameRate:
    FrameRateService;

  public readonly resolveAssetUrl:
    (relativePath: string) => string;

  public readonly quitApp:
    () => Promise<void>;

  private content:
    GameContent | null = null;

  private localization:
    LocalizationService | null = null;

  private musicDirector:
    MusicDirector | null = null;

  private isDestroyed = false;

  public constructor(
    options: GameServicesOptions,
  ) {
    this.app = options.app;
    this.settings = options.settings;
    this.music = options.music;
    this.resolveAssetUrl =
      options.resolveAssetUrl;
    this.quitApp = options.quitApp;

    options.host.appendChild(
      this.app.canvas,
    );

    this.input =
      new InputManager();

    this.scenes =
      new SceneManager(this.app);

    this.frameRate =
      new FrameRateService({
        app: this.app,
        settings: this.settings,
      });
  }

  public setLocalizationData(
    localizationData: LocalizationData,
  ): void {
    this.localization =
      new LocalizationService(
        localizationData,
      );
  }

  public setContent(
    content: GameContent,
  ): void {
    this.content = content;

    this.musicDirector =
      new MusicDirector({
        data:
          content.data.music,

        music:
          this.music,

        resolveAssetUrl:
          this.resolveAssetUrl,
      });
  }

  public getContent(): GameContent {
    if (this.content === null) {
      throw new Error(
        'Game content has not been loaded.',
      );
    }

    return this.content;
  }

  public getLocalization():
    LocalizationService {
    if (this.localization === null) {
      throw new Error(
        'Localization service has not been initialized.',
      );
    }

    return this.localization;
  }

  public getMusicDirector():
    MusicDirector {
    if (this.musicDirector === null) {
      throw new Error(
        'Music director has not been initialized.',
      );
    }

    return this.musicDirector;
  }

  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    this.musicDirector?.stop();
    this.frameRate.destroy();
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
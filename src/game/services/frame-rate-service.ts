import type { Application } from 'pixi.js';

import type { SettingsManager } from '../../core/settings/settings-manager';
import type { GameSettings } from '../settings/game-settings';

export interface FrameRateServiceOptions {
  app: Application;
  settings: SettingsManager<GameSettings>;
  target?: Window;
  documentRef?: Document;
}

export class FrameRateService {
  private readonly target: Window;

  private readonly documentRef: Document;

  private readonly unsubscribeSettings:
    () => void;

  private currentSettings:
    Readonly<GameSettings>;

  private isFocused = true;

  private isDestroyed = false;

  public constructor(
    private readonly options:
      FrameRateServiceOptions,
  ) {
    this.target =
      options.target ?? window;

    this.documentRef =
      options.documentRef ?? document;

    this.currentSettings =
      options.settings.getAll();

    this.target.addEventListener(
      'focus',
      this.handleFocus,
    );

    this.target.addEventListener(
      'blur',
      this.handleBlur,
    );

    this.documentRef.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );

    this.unsubscribeSettings =
      options.settings.subscribe(
        (settings) => {
          this.currentSettings =
            settings;

          this.applyFrameRateLimit();
        },
      );
  }

  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    this.unsubscribeSettings();

    this.target.removeEventListener(
      'focus',
      this.handleFocus,
    );

    this.target.removeEventListener(
      'blur',
      this.handleBlur,
    );

    this.documentRef.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
  }

  private readonly handleFocus =
    (): void => {
      this.isFocused = true;
      this.applyFrameRateLimit();
    };

  private readonly handleBlur =
    (): void => {
      this.isFocused = false;
      this.applyFrameRateLimit();
    };

  private readonly handleVisibilityChange =
    (): void => {
      this.applyFrameRateLimit();
    };

  private isBackgrounded(): boolean {
    return (
      this.documentRef.visibilityState ===
        'hidden' ||
      !this.isFocused
    );
  }

  private applyFrameRateLimit():
    void {
    const graphics =
      this.currentSettings.graphics;

    this.options.app.ticker.maxFPS =
      this.isBackgrounded()
        ? graphics.backgroundFpsLimit
        : graphics.fpsLimit;
  }
}
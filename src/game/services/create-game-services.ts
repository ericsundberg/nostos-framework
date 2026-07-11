import type { InputManager } from '../../core/input/input-manager';
import { createGameApplication } from '../../core/application/create-game-application';
import { SettingsManager } from '../../core/settings/settings-manager';
import {
  FRAMEWORK_FALLBACK_GAME_SETTINGS,
  mergeGameSettingsDefaults,
  type GameSettings,
  normalizeGameSettings,
} from '../settings/game-settings';
import { loadSettingsConfig } from '../settings/load-settings-config';
import { GameServices } from './game-services';
import { MusicService } from './music-service';

const bindInputActions = (
  input: InputManager,
  inputBindings: Record<string, string[]>,
): void => {
  for (
    const [action, codes] of
    Object.entries(inputBindings)
  ) {
    input.bindAction(
      action,
      codes,
    );
  }
};

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

    const settingsConfig =
      await loadSettingsConfig();

    const defaultSettings =
      settingsConfig === null
        ? FRAMEWORK_FALLBACK_GAME_SETTINGS
        : mergeGameSettingsDefaults(
          FRAMEWORK_FALLBACK_GAME_SETTINGS,
          settingsConfig.defaults,
        );

    const settings =
      new SettingsManager<GameSettings>({
        normalize: (value) =>
          normalizeGameSettings(
            value,
            defaultSettings,
          ),

        storage: {
          load: () =>
            window.gamePlatform
              .settings.load(),

          save: (value) =>
            window.gamePlatform
              .settings.save({
                ...value,
              }),
        },
      });

    await settings.load();

    console.info(
      'Loaded persistent game settings.',
    );

    const currentSettings =
      settings.getAll();

    const app =
      await createGameApplication({
        background: '#111318',
        resizeTo: window,
        antialias:
          currentSettings.graphics
            .antialias,
      });

    const services =
      new GameServices({
        app,
        host,
        settings,
        music: new MusicService(),
        resolveAssetUrl,
        quitApp: () =>
          window.gamePlatform.app.quit(),
      });

    bindInputActions(
      services.input,
      currentSettings.controls
        .inputBindings,
    );

    return services;
  };
import { createGameApplication } from '../../core/application/create-game-application';
import { SettingsManager } from '../../core/settings/settings-manager';
import {
  type GameSettings,
  normalizeGameSettings,
} from '../settings/game-settings';
import { GameServices } from './game-services';
import { MusicService } from './music-service';

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
              .settings.save({
                ...value,
              }),
        },
      });

    await settings.load();

    console.info(
      'Loaded persistent game settings.',
    );

    const app =
      await createGameApplication({
        background: '#111318',
        resizeTo: window,
        antialias: true,
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

    services.input.bindAction(
      'ui.confirm',
      ['Enter', 'Space'],
    );

    services.input.bindAction(
      'ui.back',
      ['Escape'],
    );

    services.input.bindAction(
      'settings.toggleMarker',
      ['KeyM'],
    );

    services.input.bindAction(
      'movement.left',
      ['KeyA', 'ArrowLeft'],
    );

    services.input.bindAction(
      'movement.right',
      ['KeyD', 'ArrowRight'],
    );

    services.input.bindAction(
      'movement.up',
      ['KeyW', 'ArrowUp'],
    );

    services.input.bindAction(
      'movement.down',
      ['KeyS', 'ArrowDown'],
    );

    return services;
  };
import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  DEFAULT_GAME_SETTINGS,
  FRAMEWORK_FALLBACK_GAME_SETTINGS,
  mergeGameSettingsDefaults,
  normalizeGameSettings,
} from '../../src/game/settings/game-settings';

describe(
  'game settings',
  () => {
    it(
      'migrates legacy flat settings into gameplay settings',
      () => {
        const settings =
          normalizeGameSettings({
            showPipelineMarker: false,
            showLaunchScreen: false,
          });

        expect(
          settings.gameplay
            .showPipelineMarker,
        ).toBe(false);

        expect(
          settings.gameplay
            .showLaunchScreen,
        ).toBe(false);

        expect(
          settings.graphics
            .fpsLimit,
        ).toBe(0);

        expect(
          settings.graphics
            .backgroundFpsLimit,
        ).toBe(30);
      },
    );

    it(
      'falls back when values are invalid',
      () => {
        const settings =
          normalizeGameSettings({
            gameplay: {
              showPipelineMarker:
                'nope',
            },

            graphics: {
              fpsLimit: -1,
              backgroundFpsLimit: 0,
              renderScale: 0,
            },

            audio: {
              masterVolume: 2,
            },
          });

        expect(settings).toEqual(
          DEFAULT_GAME_SETTINGS,
        );
      },
    );

    it(
      'merges project defaults over framework fallback defaults',
      () => {
        const settings =
          mergeGameSettingsDefaults(
            FRAMEWORK_FALLBACK_GAME_SETTINGS,
            {
              gameplay: {
                ...FRAMEWORK_FALLBACK_GAME_SETTINGS
                  .gameplay,

                showLaunchScreen: false,
              },

              controls: {
                inputBindings: {
                  ...FRAMEWORK_FALLBACK_GAME_SETTINGS
                    .controls
                    .inputBindings,

                  'ui.confirm': [
                    'Enter',
                  ],
                },
              },

              display:
                FRAMEWORK_FALLBACK_GAME_SETTINGS
                  .display,

              graphics: {
                ...FRAMEWORK_FALLBACK_GAME_SETTINGS
                  .graphics,

                fpsLimit: 60,
                backgroundFpsLimit: 15,
              },

              audio:
                FRAMEWORK_FALLBACK_GAME_SETTINGS
                  .audio,

              accessibility:
                FRAMEWORK_FALLBACK_GAME_SETTINGS
                  .accessibility,
            },
          );

        expect(
          settings.gameplay
            .showLaunchScreen,
        ).toBe(false);

        expect(
          settings.controls
            .inputBindings[
              'ui.confirm'
            ],
        ).toEqual([
          'Enter',
        ]);

        expect(
          settings.graphics
            .fpsLimit,
        ).toBe(60);

        expect(
          settings.graphics
            .backgroundFpsLimit,
        ).toBe(15);
      },
    );
  },
);
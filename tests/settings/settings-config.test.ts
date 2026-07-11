import {
  describe,
  expect,
  it,
} from 'vitest';

import { DEFAULT_GAME_SETTINGS } from '../../src/game/settings/game-settings';
import { isSettingsConfig } from '../../src/game/settings/settings-config';

describe(
  'settings config',
  () => {
    it(
      'accepts the public settings config shape',
      () => {
        expect(
          isSettingsConfig({
            schemaVersion: 1,

            defaults:
              DEFAULT_GAME_SETTINGS,

            options: {
              graphics: {
                fpsLimit: [
                  0,
                  30,
                  60,
                ],

                backgroundFpsLimit: [
                  1,
                  15,
                  30,
                ],
              },

              display: {
                windowMode: [
                  'windowed',
                  'fullscreen',
                  'borderless',
                ],

                resolution: [
                  'auto',
                  '1920x1080',
                ],
              },
            },
          }),
        ).toBe(true);
      },
    );

    it(
      'rejects invalid defaults',
      () => {
        expect(
          isSettingsConfig({
            schemaVersion: 1,

            defaults: {
              ...DEFAULT_GAME_SETTINGS,

              graphics: {
                ...DEFAULT_GAME_SETTINGS
                  .graphics,

                backgroundFpsLimit: 0,
              },
            },
          }),
        ).toBe(false);
      },
    );

    it(
      'rejects invalid option values',
      () => {
        expect(
          isSettingsConfig({
            schemaVersion: 1,

            defaults:
              DEFAULT_GAME_SETTINGS,

            options: {
              display: {
                windowMode: [
                  'floating',
                ],
              },
            },
          }),
        ).toBe(false);
      },
    );
  },
);
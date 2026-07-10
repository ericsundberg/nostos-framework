import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { loadAssetManifest } from '../../src/core/assets/load-asset-manifest';
import { loadJsonAsset } from '../../src/core/data/load-json-asset';
import {
  isTitleScreenData,
  type TitleScreenData,
} from '../../src/game/data/title-screen-data';
import {
  DEFAULT_GAME_SETTINGS,
  normalizeGameSettings,
} from '../../src/game/settings/game-settings';

const validTitleScreen:
  TitleScreenData = {
    schemaVersion: 1,

    text: {
      title:
        'Not What It Seems',

      prompt:
        'Press Enter or Space',
    },

    layout: {
      markerSize: 96,
      markerY: -104,
      titleY: 8,
      promptY: 72,
    },

    style: {
      titleColor: '#f5f5f5',
      promptColor: '#b8bec9',
      titleFontSize: 48,
      promptFontSize: 20,
    },
  };

const createResponse = (
  body: unknown,
  options: {
    ok?: boolean;
    status?: number;
    rejectJson?: boolean;
  } = {},
): Response => ({
  ok:
    options.ok ?? true,

  status:
    options.status ?? 200,

  json:
    options.rejectJson
      ? async (): Promise<unknown> => {
          throw new Error(
            'Invalid JSON.',
          );
        }
      : async (): Promise<unknown> =>
          body,
} as unknown as Response);

describe(
  'game data normalization',
  () => {
    it(
      'normalizes valid and invalid settings',
      () => {
        expect(
          normalizeGameSettings({
            showPipelineMarker: false,
            showLaunchScreen: false,
          }),
        ).toEqual({
          showPipelineMarker: false,
          showLaunchScreen: false,
        });

        expect(
          normalizeGameSettings({
            showPipelineMarker: false,
          }),
        ).toEqual({
          showPipelineMarker: false,
          showLaunchScreen:
            DEFAULT_GAME_SETTINGS
              .showLaunchScreen,
        });

        expect(
          normalizeGameSettings(null),
        ).toEqual(
          DEFAULT_GAME_SETTINGS,
        );
      },
    );

    it(
      'validates title-screen data',
      () => {
        expect(
          isTitleScreenData(
            validTitleScreen,
          ),
        ).toBe(true);

        expect(
          isTitleScreenData({
            ...validTitleScreen,
            schemaVersion: 2,
          }),
        ).toBe(false);

        expect(
          isTitleScreenData({
            ...validTitleScreen,

            layout: {
              ...validTitleScreen
                .layout,

              markerSize: 0,
            },
          }),
        ).toBe(false);
      },
    );
  },
);

describe(
  'public asset loaders',
  () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it(
      'loads a valid asset manifest',
      async () => {
        const manifest = {
          schemaVersion: 1,

          bundles: [
            {
              name: 'startup',

              assets: [
                {
                  alias:
                    'ui.pipeline-marker',

                  src:
                    'images/pipeline-marker.svg',
                },
              ],
            },
          ],
        };

        const fetchMock = vi.fn(
          async (): Promise<Response> =>
            createResponse(
              manifest,
            ),
        );

        vi.stubGlobal(
          'fetch',
          fetchMock,
        );

        await expect(
          loadAssetManifest(
            (relativePath) =>
              `game-asset://assets/${relativePath}`,
          ),
        ).resolves.toEqual(
          manifest,
        );

        expect(fetchMock)
          .toHaveBeenCalledWith(
            'game-asset://assets/manifest.json',
          );
      },
    );

    it(
      'rejects failed or malformed manifests',
      async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn(
            async (): Promise<Response> =>
              createResponse(
                null,
                {
                  ok: false,
                  status: 404,
                },
              ),
          ),
        );

        await expect(
          loadAssetManifest(
            () => 'manifest.json',
          ),
        ).rejects.toThrow(
          'HTTP 404',
        );

        vi.stubGlobal(
          'fetch',
          vi.fn(
            async (): Promise<Response> =>
              createResponse({
                schemaVersion: 2,
                bundles: [],
              }),
          ),
        );

        await expect(
          loadAssetManifest(
            () => 'manifest.json',
          ),
        ).rejects.toThrow(
          'invalid structure',
        );
      },
    );

    it(
      'loads JSON through its supplied validator',
      async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn(
            async (): Promise<Response> =>
              createResponse(
                validTitleScreen,
              ),
          ),
        );

        await expect(
          loadJsonAsset({
            relativePath:
              'data/title-screen.json',

            resolveAssetUrl:
              (relativePath) =>
                `game-asset://assets/${relativePath}`,

            validate:
              isTitleScreenData,
          }),
        ).resolves.toEqual(
          validTitleScreen,
        );
      },
    );

    it(
      'distinguishes parse and schema failures',
      async () => {
        vi.stubGlobal(
          'fetch',
          vi.fn(
            async (): Promise<Response> =>
              createResponse(
                null,
                {
                  rejectJson: true,
                },
              ),
          ),
        );

        await expect(
          loadJsonAsset({
            relativePath:
              'data/title-screen.json',

            resolveAssetUrl:
              (relativePath) =>
                relativePath,

            validate:
              isTitleScreenData,
          }),
        ).rejects.toThrow(
          'Failed to parse JSON asset',
        );

        vi.stubGlobal(
          'fetch',
          vi.fn(
            async (): Promise<Response> =>
              createResponse({
                schemaVersion: 2,
              }),
          ),
        );

        await expect(
          loadJsonAsset({
            relativePath:
              'data/title-screen.json',

            resolveAssetUrl:
              (relativePath) =>
                relativePath,

            validate:
              isTitleScreenData,
          }),
        ).rejects.toThrow(
          'invalid structure',
        );
      },
    );
  },
);
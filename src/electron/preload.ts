import {
  contextBridge,
  ipcRenderer,
} from 'electron';

import type { GamePlatform } from '../shared/platform';

const ASSET_BASE_URL =
  'game-asset://assets/';

const LOAD_CONFIG_CHANNEL =
  'config:load';

const LOAD_SETTINGS_CHANNEL =
  'settings:load';

const SAVE_SETTINGS_CHANNEL =
  'settings:save';

const QUIT_APP_CHANNEL =
  'app:quit';

const createAssetUrl = (
  relativePath: string,
): string => {
  if (typeof relativePath !== 'string') {
    throw new TypeError(
      'Asset path must be a string.',
    );
  }

  const segments = relativePath
    .replace(/\\/g, '/')
    .split('/');

  const isInvalid = segments.some(
    (segment) =>
      segment.length === 0 ||
      segment === '.' ||
      segment === '..' ||
      segment.includes(':'),
  );

  if (isInvalid) {
    throw new Error(
      `Invalid asset path: ${relativePath}`,
    );
  }

  const encodedPath = segments
    .map(
      (segment) =>
        encodeURIComponent(segment),
    )
    .join('/');

  return `${ASSET_BASE_URL}${encodedPath}`;
};

const gamePlatform: GamePlatform = {
  assets: {
    url: createAssetUrl,
  },

  config: {
    load: (
      filename: string,
    ): Promise<unknown> =>
      ipcRenderer.invoke(
        LOAD_CONFIG_CHANNEL,
        filename,
      ),
  },

  settings: {
    load: (): Promise<unknown> =>
      ipcRenderer.invoke(
        LOAD_SETTINGS_CHANNEL,
      ),

    save: async (
      settings: Record<string, unknown>,
    ): Promise<void> => {
      await ipcRenderer.invoke(
        SAVE_SETTINGS_CHANNEL,
        settings,
      );
    },
  },

  app: {
    quit: async (): Promise<void> => {
      await ipcRenderer.invoke(
        QUIT_APP_CHANNEL,
      );
    },
  },
};

contextBridge.exposeInMainWorld(
  'gamePlatform',
  gamePlatform,
);
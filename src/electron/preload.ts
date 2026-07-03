import { contextBridge } from 'electron';

import type { GamePlatform } from '../shared/platform';

const ASSET_BASE_URL = 'game-asset://assets/';

const createAssetUrl = (relativePath: string): string => {
  if (typeof relativePath !== 'string') {
    throw new TypeError('Asset path must be a string.');
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
    throw new Error(`Invalid asset path: ${relativePath}`);
  }

  const encodedPath = segments
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${ASSET_BASE_URL}${encodedPath}`;
};

const gamePlatform: GamePlatform = {
  assets: {
    url: createAssetUrl,
  },
};

contextBridge.exposeInMainWorld('gamePlatform', gamePlatform);
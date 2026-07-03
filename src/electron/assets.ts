import { realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { app, net, protocol } from 'electron';

const ASSET_SCHEME = 'game-asset';
const ASSET_HOST = 'assets';

const isPathInside = (rootPath: string, targetPath: string): boolean => {
  const relativePath = path.relative(rootPath, targetPath);

  return (
    relativePath.length > 0 &&
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath)
  );
};

const getAssetRoot = (): string => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'game-assets');
  }

  return path.join(app.getAppPath(), 'game-assets');
};

export const registerAssetScheme = (): void => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: ASSET_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ]);
};

export const registerAssetProtocol = (): void => {
  protocol.handle(ASSET_SCHEME, async (request) => {
    if (request.method !== 'GET') {
      return new Response('Method not allowed.', {
        status: 405,
      });
    }

    let requestUrl: URL;
    let requestedPath: string;

    try {
      requestUrl = new URL(request.url);
      requestedPath = decodeURIComponent(requestUrl.pathname)
        .replace(/^\/+/, '');
    } catch {
      return new Response('Invalid asset request.', {
        status: 400,
      });
    }

    if (requestUrl.host !== ASSET_HOST || requestedPath.length === 0) {
      return new Response('Asset not found.', {
        status: 404,
      });
    }

    const assetRoot = path.resolve(getAssetRoot());
    const candidatePath = path.resolve(assetRoot, requestedPath);

    if (!isPathInside(assetRoot, candidatePath)) {
      return new Response('Invalid asset path.', {
        status: 400,
      });
    }

    try {
      const [realAssetRoot, realCandidatePath] = await Promise.all([
        realpath(assetRoot),
        realpath(candidatePath),
      ]);

      if (!isPathInside(realAssetRoot, realCandidatePath)) {
        return new Response('Invalid asset path.', {
          status: 400,
        });
      }

      return net.fetch(
        pathToFileURL(realCandidatePath).toString(),
      );
    } catch {
      return new Response('Asset not found.', {
        status: 404,
      });
    }
  });
};
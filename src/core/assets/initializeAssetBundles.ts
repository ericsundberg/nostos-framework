import { Assets } from 'pixi.js';

import type { AssetManifest } from './loadAssetManifest';

export const initializeAssetBundles = async (
  manifest: AssetManifest,
  resolveAssetUrl: (relativePath: string) => string,
): Promise<void> => {
  const pixiManifest = {
    bundles: manifest.bundles.map((bundle) => ({
      name: bundle.name,
      assets: bundle.assets.map((asset) => ({
        alias: asset.alias,
        src: resolveAssetUrl(asset.src),
      })),
    })),
  };

  await Assets.init({
    manifest: pixiManifest,
  });
};
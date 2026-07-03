export interface AssetManifestEntry {
  alias: string;
  src: string;
}

export interface AssetManifestBundle {
  name: string;
  assets: AssetManifestEntry[];
}

export interface AssetManifest {
  schemaVersion: 1;
  bundles: AssetManifestBundle[];
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isManifestEntry = (
  value: unknown,
): value is AssetManifestEntry =>
  isRecord(value) &&
  typeof value.alias === 'string' &&
  value.alias.length > 0 &&
  typeof value.src === 'string' &&
  value.src.length > 0;

const isManifestBundle = (
  value: unknown,
): value is AssetManifestBundle =>
  isRecord(value) &&
  typeof value.name === 'string' &&
  value.name.length > 0 &&
  Array.isArray(value.assets) &&
  value.assets.every(isManifestEntry);

const isAssetManifest = (
  value: unknown,
): value is AssetManifest =>
  isRecord(value) &&
  value.schemaVersion === 1 &&
  Array.isArray(value.bundles) &&
  value.bundles.every(isManifestBundle);

export const loadAssetManifest = async (
  resolveAssetUrl: (relativePath: string) => string,
): Promise<AssetManifest> => {
  const manifestUrl = resolveAssetUrl('manifest.json');
  const response = await fetch(manifestUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to load asset manifest: HTTP ${response.status}`,
    );
  }

  const manifest: unknown = await response.json();

  if (!isAssetManifest(manifest)) {
    throw new Error('The asset manifest has an invalid structure.');
  }

  return manifest;
};
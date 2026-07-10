import {
  readdir,
  readFile,
  realpath,
  stat,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

const projectRoot = path.resolve(
  scriptDirectory,
  '..',
);

const assetRoot = path.join(
  projectRoot,
  'game-assets',
);

const errors = [];

let bundleCount = 0;
let manifestAssetCount = 0;
let validatedDataCount = 0;

const addError = (message) => {
  errors.push(message);
};

const isRecord = (value) =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const isNonEmptyString = (value) =>
  typeof value === 'string' &&
  value.trim().length > 0;

const isFiniteNumber = (value) =>
  typeof value === 'number' &&
  Number.isFinite(value);

const isPositiveNumber = (value) =>
  isFiniteNumber(value) &&
  value > 0;

const formatError = (error) =>
  error instanceof Error
    ? error.message
    : String(error);

const toAssetPath = (filePath) =>
  path
    .relative(assetRoot, filePath)
    .split(path.sep)
    .join('/');

const isPathInside = (
  rootPath,
  targetPath,
) => {
  const relativePath = path.relative(
    rootPath,
    targetPath,
  );

  return (
    relativePath.length > 0 &&
    relativePath !== '..' &&
    !relativePath.startsWith(
      `..${path.sep}`,
    ) &&
    !path.isAbsolute(relativePath)
  );
};

const isSafeRelativePath = (value) => {
  if (
    !isNonEmptyString(value) ||
    value.includes('\\') ||
    path.posix.isAbsolute(value)
  ) {
    return false;
  }

  return value.split('/').every(
    (segment) =>
      segment.length > 0 &&
      segment !== '.' &&
      segment !== '..' &&
      !segment.includes(':') &&
      !segment.includes('\0'),
  );
};

const readJsonFile = async (
  filePath,
  displayPath,
) => {
  let contents;

  try {
    contents = await readFile(
      filePath,
      'utf8',
    );
  } catch (error) {
    addError(
      `${displayPath}: could not be read: ` +
        formatError(error),
    );

    return null;
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    addError(
      `${displayPath}: contains invalid JSON: ` +
        formatError(error),
    );

    return null;
  }
};

const validateReferencedFile = async (
  relativePath,
  realAssetRoot,
) => {
  const candidatePath = path.resolve(
    assetRoot,
    relativePath,
  );

  if (!isPathInside(assetRoot, candidatePath)) {
    addError(
      `manifest.json: asset path escapes ` +
        `game-assets: "${relativePath}".`,
    );

    return;
  }

  let resolvedPath;

  try {
    resolvedPath = await realpath(
      candidatePath,
    );
  } catch {
    addError(
      `manifest.json: referenced asset is ` +
        `missing: "${relativePath}".`,
    );

    return;
  }

  if (
    !isPathInside(
      realAssetRoot,
      resolvedPath,
    )
  ) {
    addError(
      `manifest.json: referenced asset resolves ` +
        `outside game-assets: "${relativePath}".`,
    );

    return;
  }

  const fileStats = await stat(
    resolvedPath,
  );

  if (!fileStats.isFile()) {
    addError(
      `manifest.json: referenced asset is not ` +
        `a file: "${relativePath}".`,
    );
  }
};

const validateManifest = async (
  manifest,
  realAssetRoot,
) => {
  if (
    !isRecord(manifest) ||
    manifest.schemaVersion !== 1 ||
    !Array.isArray(manifest.bundles)
  ) {
    addError(
      'manifest.json: expected schemaVersion 1 ' +
        'and a bundles array.',
    );

    return;
  }

  bundleCount = manifest.bundles.length;

  const bundleNames = new Set();
  const aliases = new Set();
  const fileChecks = [];

  manifest.bundles.forEach(
    (bundle, bundleIndex) => {
      const bundleLabel =
        `manifest.json bundle ${bundleIndex}`;

      if (
        !isRecord(bundle) ||
        !isNonEmptyString(bundle.name) ||
        !Array.isArray(bundle.assets)
      ) {
        addError(
          `${bundleLabel}: expected a name ` +
            'and an assets array.',
        );

        return;
      }

      if (bundleNames.has(bundle.name)) {
        addError(
          `manifest.json: duplicate bundle name ` +
            `"${bundle.name}".`,
        );
      }

      bundleNames.add(bundle.name);

      bundle.assets.forEach(
        (asset, assetIndex) => {
          manifestAssetCount += 1;

          const assetLabel =
            `${bundleLabel} asset ${assetIndex}`;

          if (
            !isRecord(asset) ||
            !isNonEmptyString(asset.alias) ||
            !isNonEmptyString(asset.src)
          ) {
            addError(
              `${assetLabel}: expected non-empty ` +
                'alias and src strings.',
            );

            return;
          }

          if (aliases.has(asset.alias)) {
            addError(
              `manifest.json: duplicate asset alias ` +
                `"${asset.alias}".`,
            );
          }

          aliases.add(asset.alias);

          if (!isSafeRelativePath(asset.src)) {
            addError(
              `${assetLabel}: invalid relative path ` +
                `"${asset.src}".`,
            );

            return;
          }

          fileChecks.push(
            validateReferencedFile(
              asset.src,
              realAssetRoot,
            ),
          );
        },
      );
    },
  );

  await Promise.all(fileChecks);
};

const validateTitleScreenData = (
  value,
) => {
  const problems = [];

  if (
    !isRecord(value) ||
    value.schemaVersion !== 1
  ) {
    return [
      'expected schemaVersion 1.',
    ];
  }

  const {
    text,
    layout,
    style,
  } = value;

  if (
    !isRecord(text) ||
    !isNonEmptyString(text.title) ||
    !isNonEmptyString(text.prompt)
  ) {
    problems.push(
      'text.title and text.prompt must be ' +
        'non-empty strings.',
    );
  }

  if (
    !isRecord(layout) ||
    !isPositiveNumber(
      layout.markerSize,
    ) ||
    !isFiniteNumber(layout.markerY) ||
    !isFiniteNumber(layout.titleY) ||
    !isFiniteNumber(layout.promptY)
  ) {
    problems.push(
      'layout values are missing or invalid.',
    );
  }

  if (
    !isRecord(style) ||
    !isNonEmptyString(
      style.titleColor,
    ) ||
    !isNonEmptyString(
      style.promptColor,
    ) ||
    !isPositiveNumber(
      style.titleFontSize,
    ) ||
    !isPositiveNumber(
      style.promptFontSize,
    )
  ) {
    problems.push(
      'style values are missing or invalid.',
    );
  }

  return problems;
};


const validateGameplayData = (
  value,
) => {
  const problems = [];

  if (
    !isRecord(value) ||
    value.schemaVersion !== 1
  ) {
    return [
      'expected schemaVersion 1.',
    ];
  }

  const {
    playfield,
    player,
    text,
  } = value;

  let validPlayfield = false;
  let validPlayer = false;

  if (isRecord(playfield)) {
    const {
      width,
      height,
      padding,
      backgroundColor,
      borderColor,
    } = playfield;

    validPlayfield =
      isPositiveNumber(width) &&
      isPositiveNumber(height) &&
      isFiniteNumber(padding) &&
      padding >= 0 &&
      isNonEmptyString(
        backgroundColor,
      ) &&
      isNonEmptyString(borderColor);

    if (!validPlayfield) {
      problems.push(
        'playfield values are missing or invalid.',
      );
    }
  } else {
    problems.push(
      'playfield values are missing or invalid.',
    );
  }

  if (isRecord(player)) {
    validPlayer =
      isPositiveNumber(player.size) &&
      isPositiveNumber(player.speed) &&
      isNonEmptyString(player.color);

    if (!validPlayer) {
      problems.push(
        'player values are missing or invalid.',
      );
    }
  } else {
    problems.push(
      'player values are missing or invalid.',
    );
  }

  if (
    !isRecord(text) ||
    !isNonEmptyString(
      text.instructionsKey,
    )
  ) {
    problems.push(
      'text.instructionsKey must be a non-empty localization key string.',
    );
  }

  if (
    validPlayfield &&
    validPlayer
  ) {
    const usableWidth =
      playfield.width -
      playfield.padding * 2;

    const usableHeight =
      playfield.height -
      playfield.padding * 2;

    if (
      usableWidth <= player.size ||
      usableHeight <= player.size
    ) {
      problems.push(
        'playfield must contain usable movement space.',
      );
    }
  }

  return problems;
};

const dataValidators = new Map([
  [
    'data/title-screen.json',
    validateTitleScreenData,
  ],
  [
    'data/gameplay.json',
    validateGameplayData,
  ],
]);

const collectJsonFiles = async (
  directoryPath,
) => {
  let entries;

  try {
    entries = await readdir(
      directoryPath,
      {
        withFileTypes: true,
      },
    );
  } catch (error) {
    addError(
      `${toAssetPath(directoryPath)}: ` +
        `could not be read: ${formatError(error)}`,
    );

    return [];
  }

  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(
      directoryPath,
      entry.name,
    );

    if (entry.isSymbolicLink()) {
      addError(
        `${toAssetPath(entryPath)}: symbolic links ` +
          'are not supported in game-assets/data.',
      );

      continue;
    }

    if (entry.isDirectory()) {
      files.push(
        ...await collectJsonFiles(
          entryPath,
        ),
      );

      continue;
    }

    if (
      entry.isFile() &&
      path
        .extname(entry.name)
        .toLowerCase() === '.json'
    ) {
      files.push(entryPath);
    }
  }

  return files;
};

const validateDataFiles = async () => {
  const dataDirectory = path.join(
    assetRoot,
    'data',
  );

  const jsonFiles =
    await collectJsonFiles(
      dataDirectory,
    );

  const seenPaths = new Set();

  for (const filePath of jsonFiles) {
    const relativePath =
      toAssetPath(filePath);

    seenPaths.add(relativePath);

    const validator =
      dataValidators.get(
        relativePath,
      );

    if (validator === undefined) {
      addError(
        `${relativePath}: no schema validator ` +
          'is registered.',
      );

      continue;
    }

    const value = await readJsonFile(
      filePath,
      relativePath,
    );

    if (value === null) {
      continue;
    }

    const problems =
      validator(value);

    if (problems.length > 0) {
      for (const problem of problems) {
        addError(
          `${relativePath}: ${problem}`,
        );
      }

      continue;
    }

    validatedDataCount += 1;
  }

  for (
    const relativePath of
    dataValidators.keys()
  ) {
    if (!seenPaths.has(relativePath)) {
      addError(
        `${relativePath}: required data file ` +
          'is missing.',
      );
    }
  }
};

const main = async () => {
  let realAssetRoot;

  try {
    realAssetRoot =
      await realpath(assetRoot);
  } catch (error) {
    addError(
      `game-assets: directory could not be read: ` +
        formatError(error),
    );
  }

  if (realAssetRoot !== undefined) {
    const manifestPath = path.join(
      assetRoot,
      'manifest.json',
    );

    const manifest =
      await readJsonFile(
        manifestPath,
        'manifest.json',
      );

    if (manifest !== null) {
      await validateManifest(
        manifest,
        realAssetRoot,
      );
    }

    await validateDataFiles();
  }

  if (errors.length > 0) {
    console.error(
      `Public asset validation failed with ` +
        `${errors.length} error(s):`,
    );

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log(
    'Public asset validation passed.',
  );

  console.log(
    `Manifest: ${bundleCount} bundle(s), ` +
      `${manifestAssetCount} asset(s).`,
  );

  console.log(
    `Data: ${validatedDataCount} ` +
      'validated JSON file(s).',
  );
};

await main();
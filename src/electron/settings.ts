import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  app,
  ipcMain,
} from 'electron';

const LOAD_SETTINGS_CHANNEL = 'settings:load';
const SAVE_SETTINGS_CHANNEL = 'settings:save';

const MAX_SETTINGS_BYTES = 64 * 1024;

const isNodeError = (
  error: unknown,
): error is NodeJS.ErrnoException =>
  error instanceof Error;

const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
};

const getSettingsDirectory = (): string =>
  path.join(
    app.getPath('userData'),
    'game-data',
  );

const getSettingsPath = (): string =>
  path.join(
    getSettingsDirectory(),
    'settings.json',
  );

const loadSettings = async (): Promise<unknown> => {
  try {
    const contents = await readFile(
      getSettingsPath(),
      'utf8',
    );

    return JSON.parse(contents) as unknown;
  } catch (error: unknown) {
    if (
      isNodeError(error) &&
      error.code === 'ENOENT'
    ) {
      return null;
    }

    if (error instanceof SyntaxError) {
      console.warn(
        'The settings file contains invalid JSON. Using defaults.',
      );

      return null;
    }

    throw error;
  }
};

const saveSettings = async (
  value: unknown,
): Promise<void> => {
  if (!isPlainObject(value)) {
    throw new Error(
      'Settings must be a plain object.',
    );
  }

  const serialized = JSON.stringify(
    value,
    null,
    2,
  );

  if (
    Buffer.byteLength(serialized, 'utf8') >
    MAX_SETTINGS_BYTES
  ) {
    throw new Error(
      'The settings document is too large.',
    );
  }

  const settingsDirectory =
    getSettingsDirectory();

  const settingsPath =
    getSettingsPath();

  const temporaryPath =
    `${settingsPath}.${process.pid}.${Date.now()}.tmp`;

  await mkdir(
    settingsDirectory,
    {
      recursive: true,
    },
  );

  await writeFile(
    temporaryPath,
    `${serialized}\n`,
    {
      encoding: 'utf8',
      mode: 0o600,
    },
  );

  try {
    try {
      await rename(
        temporaryPath,
        settingsPath,
      );
    } catch (error: unknown) {
      const requiresReplacement =
        isNodeError(error) &&
        (
          error.code === 'EEXIST' ||
          error.code === 'EPERM'
        );

      if (!requiresReplacement) {
        throw error;
      }

      await rm(
        settingsPath,
        {
          force: true,
        },
      );

      await rename(
        temporaryPath,
        settingsPath,
      );
    }
  } finally {
    await rm(
      temporaryPath,
      {
        force: true,
      },
    );
  }
};

export const registerSettingsIpc = (): void => {
  ipcMain.handle(
    LOAD_SETTINGS_CHANNEL,
    loadSettings,
  );

  ipcMain.handle(
    SAVE_SETTINGS_CHANNEL,
    (
      _event,
      settings: unknown,
    ) => saveSettings(settings),
  );
};
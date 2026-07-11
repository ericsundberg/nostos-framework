import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  app,
  ipcMain,
} from 'electron';

const LOAD_CONFIG_CHANNEL = 'config:load';

const SETTINGS_CONFIG_FILENAME =
  'settings.config.json';

const ALLOWED_CONFIG_FILENAMES =
  new Set([
    SETTINGS_CONFIG_FILENAME,
  ]);

const MAX_CONFIG_BYTES = 256 * 1024;

const isNodeError = (
  error: unknown,
): error is NodeJS.ErrnoException =>
  error instanceof Error;

const getConfigDirectory = (): string =>
  app.isPackaged
    ? path.join(
      process.resourcesPath,
      'config',
    )
    : path.join(
      app.getAppPath(),
      'config',
    );

const loadConfig = async (
  filename: unknown,
): Promise<unknown> => {
  if (
    typeof filename !== 'string' ||
    !ALLOWED_CONFIG_FILENAMES.has(filename)
  ) {
    throw new Error(
      'Unsupported public config filename.',
    );
  }

  const configPath = path.join(
    getConfigDirectory(),
    filename,
  );

  let contents: string;

  try {
    contents = await readFile(
      configPath,
      'utf8',
    );
  } catch (error: unknown) {
    if (
      isNodeError(error) &&
      error.code === 'ENOENT'
    ) {
      return null;
    }

    throw error;
  }

  if (
    Buffer.byteLength(contents, 'utf8') >
    MAX_CONFIG_BYTES
  ) {
    throw new Error(
      `Public config file is too large: config/${filename}`,
    );
  }

  try {
    return JSON.parse(contents) as unknown;
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse public config file: config/${filename}`,
      );
    }

    throw error;
  }
};

export const registerConfigIpc = (): void => {
  ipcMain.handle(
    LOAD_CONFIG_CHANNEL,
    (
      _event,
      filename: unknown,
    ) => loadConfig(filename),
  );
};
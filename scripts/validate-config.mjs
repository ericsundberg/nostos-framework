import {
  readFile,
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

const configRoot = path.join(
  projectRoot,
  'config',
);

const settingsConfigPath = path.join(
  configRoot,
  'settings.config.json',
);

const errors = [];

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

const isNonNegativeNumber = (value) =>
  isFiniteNumber(value) &&
  value >= 0;

const isBoolean = (value) =>
  typeof value === 'boolean';

const isVolume = (value) =>
  isFiniteNumber(value) &&
  value >= 0 &&
  value <= 1;

const isWindowMode = (value) =>
  value === 'windowed' ||
  value === 'fullscreen' ||
  value === 'borderless';

const isPowerPreference = (value) =>
  value === 'default' ||
  value === 'high-performance' ||
  value === 'low-power';

const isColorblindMode = (value) =>
  value === 'off' ||
  value === 'protanopia' ||
  value === 'deuteranopia' ||
  value === 'tritanopia';

const isRenderScale = (value) =>
  value === 'auto' ||
  isPositiveNumber(value);

const formatError = (error) =>
  error instanceof Error
    ? error.message
    : String(error);

const validateRequiredObject = (
  value,
  label,
) => {
  if (!isRecord(value)) {
    addError(
      `${label}: expected an object.`,
    );

    return false;
  }

  return true;
};

const validateBoolean = (
  value,
  label,
) => {
  if (!isBoolean(value)) {
    addError(
      `${label}: expected a boolean.`,
    );
  }
};

const validateNonEmptyString = (
  value,
  label,
) => {
  if (!isNonEmptyString(value)) {
    addError(
      `${label}: expected a non-empty string.`,
    );
  }
};

const validateVolume = (
  value,
  label,
) => {
  if (!isVolume(value)) {
    addError(
      `${label}: expected a number from 0 to 1.`,
    );
  }
};

const validateInputBindings = (
  value,
  label,
) => {
  if (!isRecord(value)) {
    addError(
      `${label}: expected an object.`,
    );

    return;
  }

  for (const [
    action,
    codes,
  ] of Object.entries(value)) {
    const bindingLabel =
      `${label}.${action}`;

    if (!isNonEmptyString(action)) {
      addError(
        `${label}: expected all action names to be non-empty strings.`,
      );

      continue;
    }

    if (
      !Array.isArray(codes) ||
      codes.length === 0 ||
      !codes.every(isNonEmptyString)
    ) {
      addError(
        `${bindingLabel}: expected a non-empty array of key-code strings.`,
      );
    }
  }
};

const validateNumberOptions = (
  value,
  label,
  {
    allowZero,
  },
) => {
  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    addError(
      `${label}: expected a non-empty number array.`,
    );

    return;
  }

  const isValidNumber =
    allowZero
      ? isNonNegativeNumber
      : isPositiveNumber;

  if (!value.every(isValidNumber)) {
    addError(
      `${label}: contains an invalid number.`,
    );
  }
};

const validateStringOptions = (
  value,
  label,
) => {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every(isNonEmptyString)
  ) {
    addError(
      `${label}: expected a non-empty string array.`,
    );
  }
};

const validateWindowModeOptions = (
  value,
  label,
) => {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every(isWindowMode)
  ) {
    addError(
      `${label}: expected windowed, fullscreen, or borderless values.`,
    );
  }
};

const validateSettingsConfig = (
  config,
) => {
  if (!validateRequiredObject(
    config,
    'settings.config.json',
  )) {
    return;
  }

  if (config.schemaVersion !== 1) {
    addError(
      'settings.config.json: expected schemaVersion 1.',
    );
  }

  if (!validateRequiredObject(
    config.defaults,
    'settings.config.json.defaults',
  )) {
    return;
  }

  const defaults = config.defaults;

  const gameplay = defaults.gameplay;
  const controls = defaults.controls;
  const display = defaults.display;
  const graphics = defaults.graphics;
  const audio = defaults.audio;
  const accessibility =
    defaults.accessibility;

  if (validateRequiredObject(
    gameplay,
    'defaults.gameplay',
  )) {
    validateBoolean(
      gameplay.showLaunchScreen,
      'defaults.gameplay.showLaunchScreen',
    );

    validateBoolean(
      gameplay.showPipelineMarker,
      'defaults.gameplay.showPipelineMarker',
    );

    validateBoolean(
      gameplay.pauseWhenUnfocused,
      'defaults.gameplay.pauseWhenUnfocused',
    );

    validateBoolean(
      gameplay.confirmBeforeQuit,
      'defaults.gameplay.confirmBeforeQuit',
    );
  }

  if (validateRequiredObject(
    controls,
    'defaults.controls',
  )) {
    validateInputBindings(
      controls.inputBindings,
      'defaults.controls.inputBindings',
    );
  }

  if (validateRequiredObject(
    display,
    'defaults.display',
  )) {
    if (!isWindowMode(display.windowMode)) {
      addError(
        'defaults.display.windowMode: expected windowed, fullscreen, or borderless.',
      );
    }

    validateNonEmptyString(
      display.resolution,
      'defaults.display.resolution',
    );

    validateNonEmptyString(
      display.displayId,
      'defaults.display.displayId',
    );

    validateBoolean(
      display.rememberWindowPosition,
      'defaults.display.rememberWindowPosition',
    );
  }

  if (validateRequiredObject(
    graphics,
    'defaults.graphics',
  )) {
    if (!isNonNegativeNumber(graphics.fpsLimit)) {
      addError(
        'defaults.graphics.fpsLimit: expected a non-negative number; 0 means unlimited.',
      );
    }

    if (!isPositiveNumber(graphics.backgroundFpsLimit)) {
      addError(
        'defaults.graphics.backgroundFpsLimit: expected a positive number.',
      );
    }

    if (!isRenderScale(graphics.renderScale)) {
      addError(
        'defaults.graphics.renderScale: expected "auto" or a positive number.',
      );
    }

    validateBoolean(
      graphics.antialias,
      'defaults.graphics.antialias',
    );

    validateBoolean(
      graphics.roundPixels,
      'defaults.graphics.roundPixels',
    );

    if (!isPowerPreference(graphics.powerPreference)) {
      addError(
        'defaults.graphics.powerPreference: expected default, high-performance, or low-power.',
      );
    }
  }

  if (validateRequiredObject(
    audio,
    'defaults.audio',
  )) {
    validateVolume(
      audio.masterVolume,
      'defaults.audio.masterVolume',
    );

    validateVolume(
      audio.musicVolume,
      'defaults.audio.musicVolume',
    );

    validateVolume(
      audio.sfxVolume,
      'defaults.audio.sfxVolume',
    );

    validateVolume(
      audio.uiVolume,
      'defaults.audio.uiVolume',
    );

    validateBoolean(
      audio.muteAll,
      'defaults.audio.muteAll',
    );

    validateBoolean(
      audio.muteWhenUnfocused,
      'defaults.audio.muteWhenUnfocused',
    );
  }

  if (validateRequiredObject(
    accessibility,
    'defaults.accessibility',
  )) {
    validateBoolean(
      accessibility.reducedMotion,
      'defaults.accessibility.reducedMotion',
    );

    validateBoolean(
      accessibility.screenShake,
      'defaults.accessibility.screenShake',
    );

    validateBoolean(
      accessibility.flashingEffects,
      'defaults.accessibility.flashingEffects',
    );

    validateBoolean(
      accessibility.highContrast,
      'defaults.accessibility.highContrast',
    );

    validateBoolean(
      accessibility.largeText,
      'defaults.accessibility.largeText',
    );

    if (!isPositiveNumber(accessibility.textScale)) {
      addError(
        'defaults.accessibility.textScale: expected a positive number.',
      );
    }

    if (!isColorblindMode(accessibility.colorblindMode)) {
      addError(
        'defaults.accessibility.colorblindMode: expected off, protanopia, deuteranopia, or tritanopia.',
      );
    }
  }

  if (config.options === undefined) {
    return;
  }

  if (!validateRequiredObject(
    config.options,
    'settings.config.json.options',
  )) {
    return;
  }

  const optionGraphics =
    config.options.graphics;

  const optionDisplay =
    config.options.display;

  if (
    optionGraphics !== undefined &&
    validateRequiredObject(
      optionGraphics,
      'options.graphics',
    )
  ) {
    if (
      optionGraphics.fpsLimit !==
      undefined
    ) {
      validateNumberOptions(
        optionGraphics.fpsLimit,
        'options.graphics.fpsLimit',
        {
          allowZero: true,
        },
      );

      if (
        Array.isArray(
          optionGraphics.fpsLimit,
        ) &&
        !optionGraphics.fpsLimit
          .includes(0)
      ) {
        addError(
          'options.graphics.fpsLimit: expected 0 to be included for Unlimited FPS.',
        );
      }
    }

    if (
      optionGraphics.backgroundFpsLimit !==
      undefined
    ) {
      validateNumberOptions(
        optionGraphics.backgroundFpsLimit,
        'options.graphics.backgroundFpsLimit',
        {
          allowZero: false,
        },
      );

      if (
        Array.isArray(
          optionGraphics.backgroundFpsLimit,
        ) &&
        !optionGraphics.backgroundFpsLimit
          .includes(
            graphics?.backgroundFpsLimit,
          )
      ) {
        addError(
          'options.graphics.backgroundFpsLimit: expected the default background FPS limit to be listed as an option.',
        );
      }
    }
  }

  if (
    optionDisplay !== undefined &&
    validateRequiredObject(
      optionDisplay,
      'options.display',
    )
  ) {
    if (
      optionDisplay.windowMode !==
      undefined
    ) {
      validateWindowModeOptions(
        optionDisplay.windowMode,
        'options.display.windowMode',
      );
    }

    if (
      optionDisplay.resolution !==
      undefined
    ) {
      validateStringOptions(
        optionDisplay.resolution,
        'options.display.resolution',
      );
    }
  }
};

const loadSettingsConfig = async () => {
  let fileStats;

  try {
    fileStats = await stat(
      settingsConfigPath,
    );
  } catch (error) {
    addError(
      'config/settings.config.json: missing file.',
    );

    addError(
      formatError(error),
    );

    return null;
  }

  if (!fileStats.isFile()) {
    addError(
      'config/settings.config.json: expected a file.',
    );

    return null;
  }

  let contents;

  try {
    contents = await readFile(
      settingsConfigPath,
      'utf8',
    );
  } catch (error) {
    addError(
      'config/settings.config.json: could not be read: ' +
        formatError(error),
    );

    return null;
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    addError(
      'config/settings.config.json: contains invalid JSON: ' +
        formatError(error),
    );

    return null;
  }
};

const main = async () => {
  const settingsConfig =
    await loadSettingsConfig();

  if (settingsConfig !== null) {
    validateSettingsConfig(
      settingsConfig,
    );
  }

  if (errors.length > 0) {
    console.error(
      'Public config validation failed.',
    );

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.info(
    'Public config validation passed.',
  );

  console.info(
    'Config: settings.config.json.',
  );
};

await main();
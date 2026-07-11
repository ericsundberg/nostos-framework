import type {
  ColorblindMode,
  GameSettings,
  PowerPreference,
  WindowMode,
} from './game-settings';

export interface SettingsConfigOptions {
  graphics?: {
    fpsLimit?: number[];
    backgroundFpsLimit?: number[];
  };

  display?: {
    windowMode?: WindowMode[];
    resolution?: string[];
  };
}

export interface SettingsConfig {
  schemaVersion: 1;
  defaults: GameSettings;
  options?: SettingsConfigOptions;
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const isNonEmptyString = (
  value: unknown,
): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0;

const isFiniteNumber = (
  value: unknown,
): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value);

const isPositiveNumber = (
  value: unknown,
): value is number =>
  isFiniteNumber(value) &&
  value > 0;

const isNonNegativeNumber = (
  value: unknown,
): value is number =>
  isFiniteNumber(value) &&
  value >= 0;

const isWindowMode = (
  value: unknown,
): value is WindowMode =>
  value === 'windowed' ||
  value === 'fullscreen' ||
  value === 'borderless';

const isPowerPreference = (
  value: unknown,
): value is PowerPreference =>
  value === 'default' ||
  value === 'high-performance' ||
  value === 'low-power';

const isColorblindMode = (
  value: unknown,
): value is ColorblindMode =>
  value === 'off' ||
  value === 'protanopia' ||
  value === 'deuteranopia' ||
  value === 'tritanopia';

const isVolume = (
  value: unknown,
): value is number =>
  isFiniteNumber(value) &&
  value >= 0 &&
  value <= 1;

const isRenderScale = (
  value: unknown,
): value is GameSettings['graphics']['renderScale'] =>
  value === 'auto' ||
  isPositiveNumber(value);

const isInputBindings = (
  value: unknown,
): value is Record<string, string[]> => {
  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([action, codes]) =>
      isNonEmptyString(action) &&
      Array.isArray(codes) &&
      codes.length > 0 &&
      codes.every(isNonEmptyString),
  );
};

const isGameplaySettings = (
  value: unknown,
): value is GameSettings['gameplay'] =>
  isRecord(value) &&
  typeof value.showLaunchScreen ===
    'boolean' &&
  typeof value.showPipelineMarker ===
    'boolean' &&
  typeof value.pauseWhenUnfocused ===
    'boolean' &&
  typeof value.confirmBeforeQuit ===
    'boolean';

const isControlsSettings = (
  value: unknown,
): value is GameSettings['controls'] =>
  isRecord(value) &&
  isInputBindings(
    value.inputBindings,
  );

const isDisplaySettings = (
  value: unknown,
): value is GameSettings['display'] =>
  isRecord(value) &&
  isWindowMode(value.windowMode) &&
  isNonEmptyString(value.resolution) &&
  isNonEmptyString(value.displayId) &&
  typeof value.rememberWindowPosition ===
    'boolean';

const isGraphicsSettings = (
  value: unknown,
): value is GameSettings['graphics'] =>
  isRecord(value) &&
  isNonNegativeNumber(value.fpsLimit) &&
  isPositiveNumber(
    value.backgroundFpsLimit,
  ) &&
  isRenderScale(value.renderScale) &&
  typeof value.antialias ===
    'boolean' &&
  typeof value.roundPixels ===
    'boolean' &&
  isPowerPreference(
    value.powerPreference,
  );

const isAudioSettings = (
  value: unknown,
): value is GameSettings['audio'] =>
  isRecord(value) &&
  isVolume(value.masterVolume) &&
  isVolume(value.musicVolume) &&
  isVolume(value.sfxVolume) &&
  isVolume(value.uiVolume) &&
  typeof value.muteAll === 'boolean' &&
  typeof value.muteWhenUnfocused ===
    'boolean';

const isAccessibilitySettings = (
  value: unknown,
): value is GameSettings['accessibility'] =>
  isRecord(value) &&
  typeof value.reducedMotion ===
    'boolean' &&
  typeof value.screenShake ===
    'boolean' &&
  typeof value.flashingEffects ===
    'boolean' &&
  typeof value.highContrast ===
    'boolean' &&
  typeof value.largeText ===
    'boolean' &&
  isPositiveNumber(value.textScale) &&
  isColorblindMode(
    value.colorblindMode,
  );

const isGameSettings = (
  value: unknown,
): value is GameSettings =>
  isRecord(value) &&
  isGameplaySettings(value.gameplay) &&
  isControlsSettings(value.controls) &&
  isDisplaySettings(value.display) &&
  isGraphicsSettings(value.graphics) &&
  isAudioSettings(value.audio) &&
  isAccessibilitySettings(
    value.accessibility,
  );

const isNumberArray = (
  value: unknown,
): value is number[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isFiniteNumber);

const isWindowModeArray = (
  value: unknown,
): value is WindowMode[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isWindowMode);

const isStringArray = (
  value: unknown,
): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isNonEmptyString);

const isSettingsConfigOptions = (
  value: unknown,
): value is SettingsConfigOptions => {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  const graphics = value.graphics;
  const display = value.display;

  if (
    graphics !== undefined &&
    !isRecord(graphics)
  ) {
    return false;
  }

  if (
    display !== undefined &&
    !isRecord(display)
  ) {
    return false;
  }

  if (
    isRecord(graphics) &&
    graphics.fpsLimit !== undefined &&
    !isNumberArray(graphics.fpsLimit)
  ) {
    return false;
  }

  if (
    isRecord(graphics) &&
    graphics.backgroundFpsLimit !==
      undefined &&
    !isNumberArray(
      graphics.backgroundFpsLimit,
    )
  ) {
    return false;
  }

  if (
    isRecord(display) &&
    display.windowMode !== undefined &&
    !isWindowModeArray(display.windowMode)
  ) {
    return false;
  }

  if (
    isRecord(display) &&
    display.resolution !== undefined &&
    !isStringArray(display.resolution)
  ) {
    return false;
  }

  return true;
};

export const isSettingsConfig = (
  value: unknown,
): value is SettingsConfig =>
  isRecord(value) &&
  value.schemaVersion === 1 &&
  isGameSettings(value.defaults) &&
  isSettingsConfigOptions(
    value.options,
  );
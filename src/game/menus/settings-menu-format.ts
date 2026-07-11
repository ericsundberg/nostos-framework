import type { LocalizationService } from '../localization/localization-service';
import type { SettingsConfigOptions } from '../settings/settings-config';

const DEFAULT_FPS_LIMIT_OPTIONS = [
  0,
  30,
  60,
  90,
  120,
  144,
  165,
  240,
];

const DEFAULT_BACKGROUND_FPS_LIMIT_OPTIONS = [
  1,
  5,
  10,
  15,
  30,
];

export const DEFAULT_VOLUME_OPTIONS = [
  0,
  0.25,
  0.5,
  0.75,
  1,
];

const cloneNumberOptions = (
  configuredOptions:
    | number[]
    | undefined,
  fallbackOptions: number[],
): number[] => [
  ...(
    configuredOptions ??
    fallbackOptions
  ),
];

export const getFpsLimitOptions = (
  settingsOptions:
    SettingsConfigOptions,
): number[] =>
  cloneNumberOptions(
    settingsOptions.graphics?.fpsLimit,
    DEFAULT_FPS_LIMIT_OPTIONS,
  );

export const getBackgroundFpsLimitOptions = (
  settingsOptions:
    SettingsConfigOptions,
): number[] =>
  cloneNumberOptions(
    settingsOptions.graphics
      ?.backgroundFpsLimit,
    DEFAULT_BACKGROUND_FPS_LIMIT_OPTIONS,
  );

export const formatOnOff = (
  localization: LocalizationService,
  value: boolean,
): string =>
  localization.text(
    value ? 'on' : 'off',
  );

export const formatFpsValue = (
  localization: LocalizationService,
  value: number,
): string => {
  if (value === 0) {
    return localization.text(
      'unlimited_fps',
    );
  }

  return localization.format(
    'fps_value',
    {
      value,
    },
    `${value} FPS`,
  );
};

export const formatPercentValue = (
  localization: LocalizationService,
  value: number,
): string =>
  localization.format(
    'percent_value',
    {
      value: Math.round(value * 100),
    },
    `${Math.round(value * 100)}%`,
  );

export const getNextNumberOption = (
  currentValue: number,
  options: number[],
): number => {
  if (options.length === 0) {
    return currentValue;
  }

  const currentIndex =
    options.indexOf(currentValue);

  const nextIndex =
    currentIndex < 0
      ? 0
      : (
        currentIndex + 1
      ) % options.length;

  return (
    options[nextIndex] ??
    currentValue
  );
};
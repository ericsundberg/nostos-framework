import {
  isSettingsConfig,
  type SettingsConfig,
} from './settings-config';

const SETTINGS_CONFIG_FILENAME =
  'settings.config.json';

export const loadSettingsConfig =
  async (): Promise<SettingsConfig | null> => {
    const value =
      await window.gamePlatform.config.load(
        SETTINGS_CONFIG_FILENAME,
      );

    if (value === null) {
      console.info(
        'No public settings config was found. Using framework defaults.',
      );

      return null;
    }

    if (!isSettingsConfig(value)) {
      throw new Error(
        `Public settings config has an invalid structure: ` +
        `config/${SETTINGS_CONFIG_FILENAME}`,
      );
    }

    console.info(
      `Loaded public settings config schema ${value.schemaVersion}.`,
    );

    return value;
  };
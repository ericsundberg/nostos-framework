import {
  Container,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/input-manager';
import type { SettingsManager } from '../../core/settings/settings-manager';
import type { LocalizationService } from '../localization/localization-service';
import type { GameSettings } from '../settings/game-settings';
import type { SettingsConfigOptions } from '../settings/settings-config';
import { MenuButton } from './menu-button';
import type { MenuPanel } from './menu-panel';
import {
  DEFAULT_VOLUME_OPTIONS,
  formatFpsValue,
  formatOnOff,
  formatPercentValue,
  getBackgroundFpsLimitOptions,
  getFpsLimitOptions,
  getNextNumberOption,
} from './settings-menu-format';
import {
  createSettingsMenuButton,
  type AudioBooleanSetting,
  type AudioNumberSetting,
  type GameplayBooleanSetting,
  type GraphicsNumberSetting,
  type SettingsScreen,
} from './settings-menu-screen';

export interface SettingsMenuPanelOptions {
  input: InputManager;
  localization: LocalizationService;
  settings: SettingsManager<GameSettings>;
  settingsOptions: SettingsConfigOptions;
  onBack: () => void;
}

export class SettingsMenuPanel implements MenuPanel {
  public readonly view =
    new Container();

  private readonly headingText: Text;

  private readonly descriptionText:
    Text;

  private buttons: MenuButton[] = [];

  private markerButton:
    MenuButton | null = null;

  private launchButton:
    MenuButton | null = null;

  private fpsLimitButton:
    MenuButton | null = null;

  private backgroundFpsLimitButton:
    MenuButton | null = null;

  private masterVolumeButton:
    MenuButton | null = null;

  private musicVolumeButton:
    MenuButton | null = null;

  private sfxVolumeButton:
    MenuButton | null = null;

  private uiVolumeButton:
    MenuButton | null = null;

  private muteAllButton:
    MenuButton | null = null;

  private muteWhenUnfocusedButton:
    MenuButton | null = null;

  private selectedIndex = 0;

  private currentScreen:
    SettingsScreen = 'categories';

  private unsubscribeUp:
    (() => void) | null = null;

  private unsubscribeDown:
    (() => void) | null = null;

  private unsubscribeBack:
    (() => void) | null = null;

  private unsubscribeConfirm:
    (() => void) | null = null;

  private unsubscribeSettings:
    (() => void) | null = null;

  public constructor(
    private readonly options:
      SettingsMenuPanelOptions,
  ) {
    this.headingText =
      new Text({
        text:
          options.localization.text(
            'settings',
          ),

        style: {
          align: 'center',
          fill: '#f5f5f5',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 32,
          fontWeight: 'bold',
        },
      });

    this.headingText.anchor.set(0.5);

    this.headingText.position.set(
      0,
      -58,
    );

    this.descriptionText =
      new Text({
        text: '',

        style: {
          align: 'center',
          fill: '#8ecae6',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 15,
          lineHeight: 22,
          wordWrap: true,
          wordWrapWidth: 560,
        },
      });

    this.descriptionText.anchor.set(
      0.5,
    );

    this.view.addChild(
      this.headingText,
    );

    this.view.addChild(
      this.descriptionText,
    );

    this.showCategoryScreen();
  }

  public enter(): void {
    this.unsubscribeUp =
      this.options.input.onPressed(
        'movement.up',
        () => {
          this.moveSelection(-1);
        },
      );

    this.unsubscribeDown =
      this.options.input.onPressed(
        'movement.down',
        () => {
          this.moveSelection(1);
        },
      );

    this.unsubscribeBack =
      this.options.input.onPressed(
        'ui.back',
        this.handleBack,
      );

    this.unsubscribeConfirm =
      this.options.input.onPressed(
        'ui.confirm',
        () => {
          this.buttons[
            this.selectedIndex
          ]?.activate();
        },
      );

    this.unsubscribeSettings =
      this.options.settings.subscribe(
        (settings) => {
          this.updateSettingsLabels(
            settings,
          );
        },
      );
  }

  public exit(): void {
    this.unsubscribeUp?.();
    this.unsubscribeUp = null;

    this.unsubscribeDown?.();
    this.unsubscribeDown = null;

    this.unsubscribeBack?.();
    this.unsubscribeBack = null;

    this.unsubscribeConfirm?.();
    this.unsubscribeConfirm = null;

    this.unsubscribeSettings?.();
    this.unsubscribeSettings = null;
  }

  public destroy(): void {
    this.exit();
    this.clearButtons();
  }

  private readonly handleBack =
    (): void => {
      if (
        this.currentScreen ===
        'categories'
      ) {
        this.options.onBack();
        return;
      }

      this.showCategoryScreen();
    };

  private readonly showCategoryScreen =
    (): void => {
      this.currentScreen =
        'categories';

      this.headingText.text =
        this.options.localization.text(
          'settings',
        );

      this.clearSettingButtonReferences();

      this.setButtons([
        createSettingsMenuButton({
          id: 'gameplay_settings',
          label:
            this.options.localization.text(
              'gameplay_settings',
            ),
          onActivate:
            this.showGameplayScreen,
        }),

        createSettingsMenuButton({
          id: 'graphics_settings',
          label:
            this.options.localization.text(
              'graphics_settings',
            ),
          onActivate:
            this.showGraphicsScreen,
        }),

        createSettingsMenuButton({
          id: 'audio_settings',
          label:
            this.options.localization.text(
              'audio_settings',
            ),
          onActivate:
            this.showAudioScreen,
        }),

        createSettingsMenuButton({
          id: 'display_settings',
          label:
            this.options.localization.text(
              'display_settings',
            ),
          onActivate: () => {
            this.showPlaceholderScreen(
              'display_settings',
            );
          },
        }),

        createSettingsMenuButton({
          id: 'accessibility_settings',
          label:
            this.options.localization.text(
              'accessibility_settings',
            ),
          onActivate: () => {
            this.showPlaceholderScreen(
              'accessibility_settings',
            );
          },
        }),

        createSettingsMenuButton({
          id: 'back',
          label:
            this.options.localization.text(
              'back',
            ),
          onActivate:
            this.options.onBack,
        }),
      ]);
    };

  private readonly showGameplayScreen =
    (): void => {
      this.currentScreen =
        'gameplay';

      this.headingText.text =
        this.options.localization.text(
          'gameplay_settings',
        );

      this.clearSettingButtonReferences();

      this.markerButton =
        createSettingsMenuButton({
          id: 'pipeline_marker',
          label: '',
          onActivate: () => {
            void this.toggleGameplaySetting(
              'showPipelineMarker',
            );
          },
        });

      this.launchButton =
        createSettingsMenuButton({
          id: 'launch_screen',
          label: '',
          onActivate: () => {
            void this.toggleGameplaySetting(
              'showLaunchScreen',
            );
          },
        });

      this.setButtons([
        this.markerButton,
        this.launchButton,
        createSettingsMenuButton({
          id: 'back',
          label:
            this.options.localization.text(
              'back',
            ),
          onActivate:
            this.showCategoryScreen,
        }),
      ]);

      this.updateSettingsLabels(
        this.options.settings.getAll(),
      );
    };

  private readonly showGraphicsScreen =
    (): void => {
      this.currentScreen =
        'graphics';

      this.headingText.text =
        this.options.localization.text(
          'graphics_settings',
        );

      this.clearSettingButtonReferences();

      this.fpsLimitButton =
        createSettingsMenuButton({
          id: 'fps_limit',
          label: '',
          onActivate: () => {
            void this.cycleGraphicsNumberSetting(
              'fpsLimit',
              getFpsLimitOptions(
                this.options.settingsOptions,
              ),
            );
          },
        });

      this.backgroundFpsLimitButton =
        createSettingsMenuButton({
          id: 'background_fps_limit',
          label: '',
          onActivate: () => {
            void this.cycleGraphicsNumberSetting(
              'backgroundFpsLimit',
              getBackgroundFpsLimitOptions(
                this.options.settingsOptions,
              ),
            );
          },
        });

      this.setButtons([
        this.fpsLimitButton,
        this.backgroundFpsLimitButton,
        createSettingsMenuButton({
          id: 'back',
          label:
            this.options.localization.text(
              'back',
            ),
          onActivate:
            this.showCategoryScreen,
        }),
      ]);

      this.updateSettingsLabels(
        this.options.settings.getAll(),
      );
    };

  private readonly showAudioScreen =
    (): void => {
      this.currentScreen =
        'audio';

      this.headingText.text =
        this.options.localization.text(
          'audio_settings',
        );

      this.clearSettingButtonReferences();

      this.masterVolumeButton =
        createSettingsMenuButton({
          id: 'master_volume',
          label: '',
          onActivate: () => {
            void this.cycleAudioNumberSetting(
              'masterVolume',
            );
          },
        });

      this.musicVolumeButton =
        createSettingsMenuButton({
          id: 'music_volume',
          label: '',
          onActivate: () => {
            void this.cycleAudioNumberSetting(
              'musicVolume',
            );
          },
        });

      this.sfxVolumeButton =
        createSettingsMenuButton({
          id: 'sfx_volume',
          label: '',
          onActivate: () => {
            void this.cycleAudioNumberSetting(
              'sfxVolume',
            );
          },
        });

      this.uiVolumeButton =
        createSettingsMenuButton({
          id: 'ui_volume',
          label: '',
          onActivate: () => {
            void this.cycleAudioNumberSetting(
              'uiVolume',
            );
          },
        });

      this.muteAllButton =
        createSettingsMenuButton({
          id: 'mute_all',
          label: '',
          onActivate: () => {
            void this.toggleAudioSetting(
              'muteAll',
            );
          },
        });

      this.muteWhenUnfocusedButton =
        createSettingsMenuButton({
          id: 'mute_when_unfocused',
          label: '',
          onActivate: () => {
            void this.toggleAudioSetting(
              'muteWhenUnfocused',
            );
          },
        });

      this.setButtons([
        this.masterVolumeButton,
        this.musicVolumeButton,
        this.sfxVolumeButton,
        this.uiVolumeButton,
        this.muteAllButton,
        this.muteWhenUnfocusedButton,
        createSettingsMenuButton({
          id: 'back',
          label:
            this.options.localization.text(
              'back',
            ),
          onActivate:
            this.showCategoryScreen,
        }),
      ]);

      this.updateSettingsLabels(
        this.options.settings.getAll(),
      );
    };

  private showPlaceholderScreen(
    headingKey: string,
  ): void {
    this.currentScreen =
      'placeholder';

    this.headingText.text =
      this.options.localization.text(
        headingKey,
      );

    this.clearSettingButtonReferences();

    this.setButtons(
      [
        createSettingsMenuButton({
          id: 'settings_coming_soon',
          label:
            this.options.localization.text(
              'settings_coming_soon',
            ),
          enabled: false,
          onActivate: () => undefined,
        }),

        createSettingsMenuButton({
          id: 'back',
          label:
            this.options.localization.text(
              'back',
            ),
          onActivate:
            this.showCategoryScreen,
        }),
      ],
      1,
    );
  }

  private setButtons(
    buttons: MenuButton[],
    selectedIndex = 0,
  ): void {
    this.clearButtons();

    this.buttons = buttons;

    this.selectedIndex =
      Math.min(
        Math.max(0, selectedIndex),
        Math.max(
          0,
          this.buttons.length - 1,
        ),
      );

    this.buttons.forEach(
      (button, index) => {
        button.view.position.set(
          0,
          index * 62,
        );

        this.view.addChild(
          button.view,
        );
      },
    );

    this.descriptionText.position.set(
      0,
      this.buttons.length * 62 + 30,
    );

    this.updateSelection();
  }

  private clearButtons(): void {
    for (const button of this.buttons) {
      if (
        button.view.parent ===
        this.view
      ) {
        this.view.removeChild(
          button.view,
        );
      }

      button.destroy();
    }

    this.buttons = [];
  }

  private clearSettingButtonReferences():
    void {
    this.markerButton = null;
    this.launchButton = null;
    this.fpsLimitButton = null;
    this.backgroundFpsLimitButton =
      null;
    this.masterVolumeButton = null;
    this.musicVolumeButton = null;
    this.sfxVolumeButton = null;
    this.uiVolumeButton = null;
    this.muteAllButton = null;
    this.muteWhenUnfocusedButton =
      null;
  }

  private moveSelection(
    direction: number,
  ): void {
    if (this.buttons.length === 0) {
      return;
    }

    this.selectedIndex =
      (
        this.selectedIndex +
        direction +
        this.buttons.length
      ) % this.buttons.length;

    this.updateSelection();
  }

  private updateSelection(): void {
    this.buttons.forEach(
      (button, index) => {
        button.setSelected(
          index === this.selectedIndex,
        );
      },
    );

    const selectedButton =
      this.buttons[this.selectedIndex];

    this.descriptionText.text =
      selectedButton === undefined
        ? ''
        : this.options.localization
          .description(
            selectedButton.id,
          );
  }

  private updateSettingsLabels(
    settings: Readonly<GameSettings>,
  ): void {
    this.markerButton?.setLabel(
      `${this.options.localization.text(
        'pipeline_marker',
      )}: ${formatOnOff(
        this.options.localization,
        settings.gameplay
          .showPipelineMarker,
      )}`,
    );

    this.launchButton?.setLabel(
      `${this.options.localization.text(
        'launch_screen',
      )}: ${formatOnOff(
        this.options.localization,
        settings.gameplay
          .showLaunchScreen,
      )}`,
    );

    this.fpsLimitButton?.setLabel(
      `${this.options.localization.text(
        'fps_limit',
      )}: ${formatFpsValue(
        this.options.localization,
        settings.graphics.fpsLimit,
      )}`,
    );

    this.backgroundFpsLimitButton
      ?.setLabel(
        `${this.options.localization.text(
          'background_fps_limit',
        )}: ${formatFpsValue(
          this.options.localization,
          settings.graphics
            .backgroundFpsLimit,
        )}`,
      );

    this.masterVolumeButton?.setLabel(
      `${this.options.localization.text(
        'master_volume',
      )}: ${formatPercentValue(
        this.options.localization,
        settings.audio.masterVolume,
      )}`,
    );

    this.musicVolumeButton?.setLabel(
      `${this.options.localization.text(
        'music_volume',
      )}: ${formatPercentValue(
        this.options.localization,
        settings.audio.musicVolume,
      )}`,
    );

    this.sfxVolumeButton?.setLabel(
      `${this.options.localization.text(
        'sfx_volume',
      )}: ${formatPercentValue(
        this.options.localization,
        settings.audio.sfxVolume,
      )}`,
    );

    this.uiVolumeButton?.setLabel(
      `${this.options.localization.text(
        'ui_volume',
      )}: ${formatPercentValue(
        this.options.localization,
        settings.audio.uiVolume,
      )}`,
    );

    this.muteAllButton?.setLabel(
      `${this.options.localization.text(
        'mute_all',
      )}: ${formatOnOff(
        this.options.localization,
        settings.audio.muteAll,
      )}`,
    );

    this.muteWhenUnfocusedButton
      ?.setLabel(
        `${this.options.localization.text(
          'mute_when_unfocused',
        )}: ${formatOnOff(
          this.options.localization,
          settings.audio
            .muteWhenUnfocused,
        )}`,
      );
  }

  private async toggleGameplaySetting(
    key: GameplayBooleanSetting,
  ): Promise<void> {
    try {
      await this.options.settings.update(
        (current) => ({
          ...current,

          gameplay: {
            ...current.gameplay,

            [key]:
              !current.gameplay[key],
          },
        }),
      );
    } catch (error: unknown) {
      console.error(
        'Failed to save settings:',
        error,
      );
    }
  }

  private async cycleGraphicsNumberSetting(
    key: GraphicsNumberSetting,
    options: number[],
  ): Promise<void> {
    try {
      await this.options.settings.update(
        (current) => {
          const currentValue =
            current.graphics[key];

          const nextValue =
            getNextNumberOption(
              currentValue,
              options,
            );

          const graphics:
            GameSettings['graphics'] = {
              ...current.graphics,

              [key]: nextValue,
            };

          return {
            ...current,
            graphics,
          };
        },
      );
    } catch (error: unknown) {
      console.error(
        'Failed to save settings:',
        error,
      );
    }
  }

  private async cycleAudioNumberSetting(
    key: AudioNumberSetting,
  ): Promise<void> {
    try {
      await this.options.settings.update(
        (current) => {
          const currentValue =
            current.audio[key];

          const nextValue =
            getNextNumberOption(
              currentValue,
              DEFAULT_VOLUME_OPTIONS,
            );

          const audio:
            GameSettings['audio'] = {
              ...current.audio,

              [key]: nextValue,
            };

          return {
            ...current,
            audio,
          };
        },
      );
    } catch (error: unknown) {
      console.error(
        'Failed to save settings:',
        error,
      );
    }
  }

  private async toggleAudioSetting(
    key: AudioBooleanSetting,
  ): Promise<void> {
    try {
      await this.options.settings.update(
        (current) => ({
          ...current,

          audio: {
            ...current.audio,

            [key]:
              !current.audio[key],
          },
        }),
      );
    } catch (error: unknown) {
      console.error(
        'Failed to save settings:',
        error,
      );
    }
  }
}
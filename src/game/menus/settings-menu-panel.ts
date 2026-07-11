import {
  Container,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/input-manager';
import type { SettingsManager } from '../../core/settings/settings-manager';
import type { LocalizationService } from '../localization/localization-service';
import type { GameSettings } from '../settings/game-settings';
import type { MenuPanel } from './menu-panel';
import { MenuButton } from './menu-button';

type GameplayBooleanSetting =
  keyof Pick<
    GameSettings['gameplay'],
    | 'showLaunchScreen'
    | 'showPipelineMarker'
  >;

export interface SettingsMenuPanelOptions {
  input: InputManager;
  localization: LocalizationService;
  settings: SettingsManager<GameSettings>;
  onBack: () => void;
}

export class SettingsMenuPanel implements MenuPanel {
  public readonly view =
    new Container();

  private readonly markerButton:
    MenuButton;

  private readonly launchButton:
    MenuButton;

  private readonly backButton:
    MenuButton;

  private readonly buttons:
    MenuButton[];

  private readonly descriptionText:
    Text;

  private selectedIndex = 0;

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
    const heading =
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

    heading.anchor.set(0.5);
    heading.position.set(0, -58);

    this.markerButton =
      new MenuButton({
        id: 'pipeline_marker',
        label: '',
        onActivate: () => {
          void this.toggleGameplaySetting(
            'showPipelineMarker',
          );
        },
      });

    this.launchButton =
      new MenuButton({
        id: 'launch_screen',
        label: '',
        onActivate: () => {
          void this.toggleGameplaySetting(
            'showLaunchScreen',
          );
        },
      });

    this.backButton =
      new MenuButton({
        id: 'back',
        label:
          options.localization.text(
            'back',
          ),
        onActivate:
          options.onBack,
      });

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

    this.descriptionText.anchor.set(0.5);

    this.buttons = [
      this.markerButton,
      this.launchButton,
      this.backButton,
    ];

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

    this.view.addChild(heading);

    this.view.addChild(
      this.descriptionText,
    );

    this.updateLabels(
      options.settings.getAll(),
    );

    this.updateSelection();
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
        this.options.onBack,
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
          this.updateLabels(
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

    for (const button of this.buttons) {
      button.destroy();
    }
  }

  private moveSelection(
    direction: number,
  ): void {
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

  private updateLabels(
    settings: Readonly<GameSettings>,
  ): void {
    this.markerButton.setLabel(
      `${this.options.localization.text(
        'pipeline_marker',
      )}: ${
        this.options.localization.text(
          settings.gameplay
            .showPipelineMarker
            ? 'on'
            : 'off',
        )
      }`,
    );

    this.launchButton.setLabel(
      `${this.options.localization.text(
        'launch_screen',
      )}: ${
        this.options.localization.text(
          settings.gameplay
            .showLaunchScreen
            ? 'on'
            : 'off',
        )
      }`,
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
}
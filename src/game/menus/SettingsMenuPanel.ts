import {
  Container,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/InputManager';
import type { SettingsManager } from '../../core/settings/SettingsManager';
import type { GameSettings } from '../settings/GameSettings';
import type { MenuPanel } from './MenuPanel';
import { MenuButton } from './MenuButton';

export interface SettingsMenuPanelOptions {
  input: InputManager;
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
        text: 'Settings',
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
        label: 'Pipeline Marker: On',
        onActivate: () => {
          void this.toggleSetting(
            'showPipelineMarker',
          );
        },
      });

    this.launchButton =
      new MenuButton({
        label: 'Launch Screen: On',
        onActivate: () => {
          void this.toggleSetting(
            'showLaunchScreen',
          );
        },
      });

    this.backButton =
      new MenuButton({
        label: 'Back',
        onActivate:
          options.onBack,
      });

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

    this.view.addChild(heading);

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
  }

  private updateLabels(
    settings: Readonly<GameSettings>,
  ): void {
    this.markerButton.setLabel(
      `Pipeline Marker: ${
        settings.showPipelineMarker
          ? 'On'
          : 'Off'
      }`,
    );

    this.launchButton.setLabel(
      `Launch Screen: ${
        settings.showLaunchScreen
          ? 'On'
          : 'Off'
      }`,
    );
  }

  private async toggleSetting(
    key: keyof GameSettings,
  ): Promise<void> {
    try {
      await this.options.settings.update(
        (current) => ({
          ...current,
          [key]: !current[key],
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
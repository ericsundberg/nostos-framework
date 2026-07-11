import {
  Container,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/input-manager';
import type { Scene } from '../../core/scenes/scene';
import type { SettingsManager } from '../../core/settings/settings-manager';
import type { GameSettings } from '../settings/game-settings';

export interface InputTestSceneOptions {
  input: InputManager;
  settings: SettingsManager<GameSettings>;
  onBack: () => void;
}

export class InputTestScene implements Scene {
  public readonly view = new Container();

  private readonly content =
    new Container();

  private readonly statusText: Text;

  private unsubscribeBack:
    (() => void) | null = null;

  private unsubscribeToggle:
    (() => void) | null = null;

  private unsubscribeSettings:
    (() => void) | null = null;

  public constructor(
    private readonly options:
      InputTestSceneOptions,
  ) {
    const heading = new Text({
      text: 'Input Service Active',
      style: {
        fill: '#f5f5f5',
        fontFamily:
          'Arial, sans-serif',
        fontSize: 40,
        fontWeight: 'bold',
      },
    });

    heading.anchor.set(0.5);
    heading.position.set(0, -80);

    const message = new Text({
      text:
        'Press M to toggle the title marker.\n' +
        'Press Escape to return.',
      style: {
        align: 'center',
        fill: '#b8bec9',
        fontFamily:
          'Arial, sans-serif',
        fontSize: 22,
        lineHeight: 32,
      },
    });

    message.anchor.set(0.5);
    message.position.set(0, 0);

    this.statusText = new Text({
      text: '',
      style: {
        fill: '#8ecae6',
        fontFamily:
          'Arial, sans-serif',
        fontSize: 22,
        fontWeight: 'bold',
      },
    });

    this.statusText.anchor.set(0.5);
    this.statusText.position.set(
      0,
      88,
    );

    this.content.addChild(heading);
    this.content.addChild(message);

    this.content.addChild(
      this.statusText,
    );

    this.view.addChild(this.content);
  }

  public enter(): void {
    this.unsubscribeBack =
      this.options.input.onPressed(
        'ui.back',
        this.options.onBack,
      );

    this.unsubscribeToggle =
      this.options.input.onPressed(
        'settings.toggleMarker',
        () => {
          void this.toggleMarker();
        },
      );

    this.unsubscribeSettings =
      this.options.settings.subscribe(
        (settings) => {
          this.updateStatus(
            settings.gameplay
              .showPipelineMarker,
          );
        },
      );
  }

  public exit(): void {
    this.unsubscribeBack?.();
    this.unsubscribeBack = null;

    this.unsubscribeToggle?.();
    this.unsubscribeToggle = null;

    this.unsubscribeSettings?.();
    this.unsubscribeSettings = null;
  }

  public resize(
    width: number,
    height: number,
  ): void {
    this.content.position.set(
      width / 2,
      height / 2,
    );
  }

  public destroy(): void {
    this.exit();

    this.view.destroy({
      children: true,
    });
  }

  private async toggleMarker():
    Promise<void> {
    try {
      await this.options.settings.update(
        (current) => ({
          ...current,

          gameplay: {
            ...current.gameplay,

            showPipelineMarker:
              !current.gameplay
                .showPipelineMarker,
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

  private updateStatus(
    isVisible: boolean,
  ): void {
    this.statusText.text =
      `Title marker: ${
        isVisible ? 'ON' : 'OFF'
      }`;
  }
}
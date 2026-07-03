import {
  Container,
  Graphics,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/InputManager';
import type { Scene } from '../../core/scenes/Scene';
import type { SettingsManager } from '../../core/settings/SettingsManager';
import type { GameplayData } from '../data/GameplayData';
import type { GameSettings } from '../settings/GameSettings';
import {
  movePlayer,
  type PlayerMovementBounds,
} from '../systems/PlayerMovement';

export interface GameplaySceneOptions {
  data: GameplayData;
  input: InputManager;
  settings: SettingsManager<GameSettings>;
  onBack: () => void;
}

export class GameplayScene implements Scene {
  public readonly view =
    new Container();

  private readonly content =
    new Container();

  private readonly player: Graphics;

  private readonly statusText: Text;

  private readonly bounds:
    PlayerMovementBounds;

  private unsubscribeBack:
    (() => void) | null = null;

  private unsubscribeToggle:
    (() => void) | null = null;

  private unsubscribeSettings:
    (() => void) | null = null;

  public constructor(
    private readonly options:
      GameplaySceneOptions,
  ) {
    const { data } = options;

    const playfield =
      new Container();

    const background =
      new Graphics()
        .rect(
          0,
          0,
          data.playfield.width,
          data.playfield.height,
        )
        .fill(
          data.playfield
            .backgroundColor,
        )
        .stroke({
          color:
            data.playfield
              .borderColor,

          width: 2,
        });

    const halfPlayerSize =
      data.player.size / 2;

    this.player =
      new Graphics()
        .rect(
          -halfPlayerSize,
          -halfPlayerSize,
          data.player.size,
          data.player.size,
        )
        .fill(data.player.color);

    this.player.position.set(
      data.playfield.width / 2,
      data.playfield.height / 2,
    );

    this.bounds = {
      minX:
        data.playfield.padding +
        halfPlayerSize,

      maxX:
        data.playfield.width -
        data.playfield.padding -
        halfPlayerSize,

      minY:
        data.playfield.padding +
        halfPlayerSize,

      maxY:
        data.playfield.height -
        data.playfield.padding -
        halfPlayerSize,
    };

    playfield.addChild(background);
    playfield.addChild(this.player);

    const instructions =
      new Text({
        text:
          data.text.instructions,

        style: {
          align: 'center',
          fill: '#b8bec9',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 18,
          lineHeight: 26,
          wordWrap: true,
          wordWrapWidth:
            data.playfield.width,
        },
      });

    instructions.anchor.set(0.5);

    instructions.position.set(
      data.playfield.width / 2,
      data.playfield.height + 30,
    );

    this.statusText =
      new Text({
        text: '',

        style: {
          align: 'center',
          fill: '#8ecae6',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 17,
          fontWeight: 'bold',
        },
      });

    this.statusText.anchor.set(0.5);

    this.statusText.position.set(
      data.playfield.width / 2,
      data.playfield.height + 62,
    );

    this.content.addChild(playfield);
    this.content.addChild(instructions);

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
            settings
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

  public update(
    deltaMilliseconds: number,
  ): void {
    const nextPosition =
      movePlayer({
        position: {
          x: this.player.x,
          y: this.player.y,
        },

        input: {
          left:
            this.options.input
              .isDown(
                'movement.left',
              ),

          right:
            this.options.input
              .isDown(
                'movement.right',
              ),

          up:
            this.options.input
              .isDown(
                'movement.up',
              ),

          down:
            this.options.input
              .isDown(
                'movement.down',
              ),
        },

        bounds: this.bounds,

        speed:
          this.options.data
            .player.speed,

        deltaMilliseconds,
      });

    this.player.position.set(
      nextPosition.x,
      nextPosition.y,
    );
  }

  public resize(
    width: number,
    height: number,
  ): void {
    const contentWidth =
      this.options.data
        .playfield.width;

    const contentHeight =
      this.options.data
        .playfield.height + 88;

    const availableWidth =
      Math.max(1, width - 48);

    const availableHeight =
      Math.max(1, height - 48);

    const scale = Math.min(
      1,
      availableWidth /
        contentWidth,

      availableHeight /
        contentHeight,
    );

    this.content.scale.set(scale);

    this.content.position.set(
      (
        width -
        contentWidth * scale
      ) / 2,

      (
        height -
        contentHeight * scale
      ) / 2,
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

          showPipelineMarker:
            !current
              .showPipelineMarker,
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
import {
  Container,
  Graphics,
  Text,
} from 'pixi.js';

import type { Scene } from '../../core/scenes/Scene';

export interface LaunchSceneOptions {
  minimumMilliseconds: number;
  loadingTask: () => Promise<void>;
  onComplete: () => void;
}

const getErrorMessage = (
  error: unknown,
): string => {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  if (
    typeof error === 'string' &&
    error.trim().length > 0
  ) {
    return error;
  }

  return 'An unknown loading error occurred.';
};

export class LaunchScene implements Scene {
  public readonly view =
    new Container();

  private readonly content =
    new Container();

  private readonly panel =
    new Graphics();

  private readonly statusText: Text;

  private readonly timerText: Text;

  private elapsedMilliseconds = 0;

  private hasExited = false;

  public constructor(
    private readonly options:
      LaunchSceneOptions,
  ) {
    const bootLabel =
      new Text({
        text: 'BOOT / LOADING SCREEN TEST',
        style: {
          align: 'center',
          fill: '#8ecae6',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 18,
          fontWeight: 'bold',
          letterSpacing: 2,
        },
      });

    bootLabel.anchor.set(0.5);
    bootLabel.position.set(0, -150);

    const title =
      new Text({
        text: 'Not What It Seems',
        style: {
          align: 'center',
          fill: '#f5f5f5',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 46,
          fontWeight: 'bold',
        },
      });

    title.anchor.set(0.5);
    title.position.set(0, -92);

    const badges =
      new Text({
        text:
          '[ Studio Logo ]   [ Electron ]   [ PixiJS ]',
        style: {
          align: 'center',
          fill: '#f5f5f5',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 22,
          fontWeight: 'bold',
        },
      });

    badges.anchor.set(0.5);
    badges.position.set(0, -20);

    this.statusText =
      new Text({
        text:
          'Loading public game assets…',
        style: {
          align: 'center',
          fill: '#b8bec9',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 19,
          lineHeight: 28,
          wordWrap: true,
          wordWrapWidth: 640,
        },
      });

    this.statusText.anchor.set(0.5);
    this.statusText.position.set(0, 54);

    this.timerText =
      new Text({
        text: 'Minimum display timer: 0.0s / 5.0s',
        style: {
          align: 'center',
          fill: '#8ecae6',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 16,
        },
      });

    this.timerText.anchor.set(0.5);
    this.timerText.position.set(0, 108);

    this.content.addChild(this.panel);
    this.content.addChild(bootLabel);
    this.content.addChild(title);
    this.content.addChild(badges);

    this.content.addChild(
      this.statusText,
    );

    this.content.addChild(
      this.timerText,
    );

    this.view.addChild(this.content);
  }

  public enter(): void {
    void this.runLaunchSequence();
  }

  public exit(): void {
    this.hasExited = true;
  }

  public update(
    deltaMilliseconds: number,
  ): void {
    this.elapsedMilliseconds +=
      deltaMilliseconds;

    const elapsedSeconds =
      Math.min(
        this.elapsedMilliseconds,
        this.options
          .minimumMilliseconds,
      ) / 1000;

    const minimumSeconds =
      this.options
        .minimumMilliseconds / 1000;

    const dots =
      '.'.repeat(
        Math.floor(
          this.elapsedMilliseconds / 400,
        ) % 4,
      );

    this.statusText.text =
      `Loading public game assets${dots}`;

    this.timerText.text =
      `Minimum display timer: ${
        elapsedSeconds.toFixed(1)
      }s / ${
        minimumSeconds.toFixed(1)
      }s`;
  }

  public resize(
    width: number,
    height: number,
  ): void {
    this.content.position.set(
      width / 2,
      height / 2,
    );

    this.drawPanel();
  }

  public destroy(): void {
    this.exit();

    this.view.destroy({
      children: true,
    });
  }

  private drawPanel(): void {
    this.panel.clear();

    this.panel
      .roundRect(
        -390,
        -205,
        780,
        410,
        18,
      )
      .fill('#171b22')
      .stroke({
        color: '#42556a',
        width: 2,
      });

    this.panel
      .roundRect(
        -340,
        -54,
        680,
        78,
        10,
      )
      .stroke({
        color: '#394150',
        width: 2,
      });
  }

  private async runLaunchSequence():
    Promise<void> {
    const minimumDelay =
      new Promise<void>(
        (resolve) => {
          window.setTimeout(
            resolve,
            this.options
              .minimumMilliseconds,
          );
        },
      );

    try {
      await Promise.all([
        minimumDelay,
        this.options.loadingTask(),
      ]);
    } catch (error: unknown) {
      if (this.hasExited) {
        return;
      }

      console.error(
        'Failed to load game content:',
        error,
      );

      this.statusText.text =
        'Failed to load game content.\n' +
        getErrorMessage(error);

      return;
    }

    if (this.hasExited) {
      return;
    }

    this.options.onComplete();
  }
}
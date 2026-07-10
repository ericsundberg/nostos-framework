import {
  Container,
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

  private readonly statusText: Text;

  private hasExited = false;

  public constructor(
    private readonly options:
      LaunchSceneOptions,
  ) {
    const title =
      new Text({
        text: 'Not What It Seems',
        style: {
          align: 'center',
          fill: '#f5f5f5',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 42,
          fontWeight: 'bold',
        },
      });

    title.anchor.set(0.5);
    title.position.set(0, -48);

    const badges =
      new Text({
        text:
          'Built with Electron + PixiJS',
        style: {
          align: 'center',
          fill: '#8ecae6',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 20,
          fontWeight: 'bold',
        },
      });

    badges.anchor.set(0.5);
    badges.position.set(0, 10);

    this.statusText =
      new Text({
        text:
          'Loading public game assets…',
        style: {
          align: 'center',
          fill: '#b8bec9',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 18,
          lineHeight: 26,
          wordWrap: true,
          wordWrapWidth: 560,
        },
      });

    this.statusText.anchor.set(0.5);
    this.statusText.position.set(0, 58);

    this.content.addChild(title);
    this.content.addChild(badges);

    this.content.addChild(
      this.statusText,
    );

    this.view.addChild(this.content);
  }

  public enter(): void {
    void this.runLaunchSequence();
  }

  public exit(): void {
    this.hasExited = true;
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

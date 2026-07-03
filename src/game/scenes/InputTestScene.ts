import {
  Container,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/InputManager';
import type { Scene } from '../../core/scenes/Scene';

export interface InputTestSceneOptions {
  input: InputManager;
  onBack: () => void;
}

export class InputTestScene implements Scene {
  public readonly view = new Container();

  private readonly content = new Container();

  private unsubscribeBack:
    (() => void) | null = null;

  public constructor(
    private readonly options: InputTestSceneOptions,
  ) {
    const heading = new Text({
      text: 'Input Service Active',
      style: {
        fill: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
        fontSize: 40,
        fontWeight: 'bold',
      },
    });

    heading.anchor.set(0.5);
    heading.position.set(0, -40);

    const message = new Text({
      text:
        'The scene transition succeeded.\n' +
        'Press Escape to return.',
      style: {
        align: 'center',
        fill: '#b8bec9',
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        lineHeight: 32,
      },
    });

    message.anchor.set(0.5);
    message.position.set(0, 40);

    this.content.addChild(heading);
    this.content.addChild(message);
    this.view.addChild(this.content);
  }

  public enter(): void {
    this.unsubscribeBack =
      this.options.input.onPressed(
        'ui.back',
        this.options.onBack,
      );
  }

  public exit(): void {
    this.unsubscribeBack?.();
    this.unsubscribeBack = null;
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
}
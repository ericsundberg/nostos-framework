import {
  Container,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';

import type { InputManager } from '../../core/input/InputManager';
import type { Scene } from '../../core/scenes/Scene';
import type { SettingsManager } from '../../core/settings/SettingsManager';
import type { GameSettings } from '../settings/GameSettings';

export interface TitleSceneOptions {
  markerTexture: Texture;
  input: InputManager;
  settings: SettingsManager<GameSettings>;
  onContinue: () => void;
}

export class TitleScene implements Scene {
  public readonly view = new Container();

  private readonly content =
    new Container();

  private readonly marker: Sprite;

  private unsubscribeConfirm:
    (() => void) | null = null;

  private unsubscribeSettings:
    (() => void) | null = null;

  public constructor(
    private readonly options:
      TitleSceneOptions,
  ) {
    this.marker = new Sprite(
      options.markerTexture,
    );

    this.marker.anchor.set(0.5);
    this.marker.width = 96;
    this.marker.height = 96;
    this.marker.position.set(0, -104);

    const title = new Text({
      text: 'Not What It Seems',
      style: {
        fill: '#f5f5f5',
        fontFamily:
          'Arial, sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
      },
    });

    title.anchor.set(0.5);
    title.position.set(0, 8);

    const prompt = new Text({
      text: 'Press Enter or Space',
      style: {
        fill: '#b8bec9',
        fontFamily:
          'Arial, sans-serif',
        fontSize: 20,
      },
    });

    prompt.anchor.set(0.5);
    prompt.position.set(0, 72);

    this.content.addChild(
      this.marker,
    );

    this.content.addChild(title);
    this.content.addChild(prompt);
    this.view.addChild(this.content);
  }

  public enter(): void {
    this.unsubscribeConfirm =
      this.options.input.onPressed(
        'ui.confirm',
        this.options.onContinue,
      );

    this.unsubscribeSettings =
      this.options.settings.subscribe(
        (settings) => {
          this.marker.visible =
            settings
              .showPipelineMarker;
        },
      );
  }

  public exit(): void {
    this.unsubscribeConfirm?.();
    this.unsubscribeConfirm = null;

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
}
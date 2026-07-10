import {
  Container,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';

import type { InputManager } from '../../core/input/InputManager';
import type { Scene } from '../../core/scenes/Scene';
import type { SettingsManager } from '../../core/settings/SettingsManager';
import type { TitleScreenData } from '../data/TitleScreenData';
import type { GameSettings } from '../settings/GameSettings';
import type { MusicService } from '../services/MusicService';

export interface TitleSceneOptions {
  markerTexture: Texture;
  mainMenuMusicUrl: string;
  music: MusicService;
  data: TitleScreenData;
  input: InputManager;
  settings: SettingsManager<GameSettings>;
  onContinue: () => void;
}

export class TitleScene implements Scene {
  public readonly view =
    new Container();

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
    const { data } = options;

    this.marker = new Sprite(
      options.markerTexture,
    );

    this.marker.anchor.set(0.5);

    this.marker.width =
      data.layout.markerSize;

    this.marker.height =
      data.layout.markerSize;

    this.marker.position.set(
      0,
      data.layout.markerY,
    );

    const title = new Text({
      text: data.text.title,

      style: {
        fill:
          data.style.titleColor,

        fontFamily:
          'Arial, sans-serif',

        fontSize:
          data.style.titleFontSize,

        fontWeight: 'bold',
      },
    });

    title.anchor.set(0.5);

    title.position.set(
      0,
      data.layout.titleY,
    );

    const prompt = new Text({
      text: data.text.prompt,

      style: {
        fill:
          data.style.promptColor,

        fontFamily:
          'Arial, sans-serif',

        fontSize:
          data.style.promptFontSize,
      },
    });

    prompt.anchor.set(0.5);

    prompt.position.set(
      0,
      data.layout.promptY,
    );

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
      () => {
        this.options.music.playLoop(
    this.options.mainMenuMusicUrl,
        );

        this.options.onContinue();
      },
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

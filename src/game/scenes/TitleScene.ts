import {
  Container,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';

import type { Scene } from '../../core/scenes/Scene';

export interface TitleSceneAssets {
  markerTexture: Texture;
}

export class TitleScene implements Scene {
  public readonly view = new Container();

  private readonly content = new Container();

  public constructor(
    assets: TitleSceneAssets,
  ) {
    const marker = new Sprite(
      assets.markerTexture,
    );

    marker.anchor.set(0.5);
    marker.width = 96;
    marker.height = 96;
    marker.position.set(0, -88);

    const title = new Text({
      text: 'Not What It Seems',
      style: {
        fill: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
      },
    });

    title.anchor.set(0.5);
    title.position.set(0, 24);

    this.content.addChild(marker);
    this.content.addChild(title);
    this.view.addChild(this.content);
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
    this.view.destroy({
      children: true,
    });
  }
}
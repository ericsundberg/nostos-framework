import {
  Container,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';

export interface TitleSceneAssets {
  markerTexture: Texture;
}

export function createTitleScene(
  assets: TitleSceneAssets,
): Container {
  const scene = new Container();

  const marker = new Sprite(assets.markerTexture);

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

  scene.addChild(marker);
  scene.addChild(title);

  return scene;
}
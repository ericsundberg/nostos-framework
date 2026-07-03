import { Container, Text } from 'pixi.js';

export function createTitleScene(): Container {
  const scene = new Container();

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
  scene.addChild(title);

  return scene;
}

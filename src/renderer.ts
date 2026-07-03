import './index.css';
import { Application, Text } from 'pixi.js';

async function startGame(): Promise<void> {
  const app = new Application();

  await app.init({
    background: '#111318',
    resizeTo: window,
    antialias: true,
  });

  document.body.appendChild(app.canvas);

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
  app.stage.addChild(title);

  const positionTitle = (): void => {
    title.position.set(
      app.screen.width / 2,
      app.screen.height / 2,
    );
  };

  positionTitle();
  window.addEventListener('resize', positionTitle);
}

void startGame().catch((error: unknown) => {
  console.error('Failed to start PixiJS renderer:', error);

  document.body.textContent =
    'The game failed to start. Check DevTools for details.';
});

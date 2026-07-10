// eslint-disable-next-line import/no-unresolved
import 'pixi.js/unsafe-eval';
import { Application } from 'pixi.js';

export interface GameApplicationOptions {
  background: string;
  resizeTo: Window;
  antialias?: boolean;
}

export async function createGameApplication(
  options: GameApplicationOptions,
): Promise<Application> {
  const app = new Application();

  await app.init({
    background: options.background,
    resizeTo: options.resizeTo,
    antialias: options.antialias ?? true,
  });

  return app;
}

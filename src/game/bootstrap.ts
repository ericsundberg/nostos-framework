import { GameRouter } from './navigation/game-router';
import { createGameServices } from './services/create-game-services';

export async function startGame(
  host: HTMLElement,
): Promise<void> {
  const services =
    await createGameServices(host);

  try {
    const router =
      new GameRouter(services);

    await router.start();
  } catch (error: unknown) {
    services.destroy();
    throw error;
  }

  window.addEventListener(
    'beforeunload',
    () => {
      services.destroy();
    },
    {
      once: true,
    },
  );
}
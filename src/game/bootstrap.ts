import { GameRouter } from './navigation/GameRouter';
import { createGameServices } from './services/createGameServices';

export async function startGame(
  host: HTMLElement,
): Promise<void> {
  const services =
    await createGameServices(host);

  try {
    const router =
      new GameRouter(services);

    router.start();
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
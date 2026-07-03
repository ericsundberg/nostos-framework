import './styles/base.css';

import { startGame } from '../game/bootstrap';
import { StartupScreen } from './startup/StartupScreen';

const startupScreen =
  new StartupScreen(document.body);

startupScreen.showLoading();

const launchGame =
  async (): Promise<void> => {
    try {
      await startGame(document.body);
      startupScreen.destroy();
    } catch (error: unknown) {
      console.error(
        'Failed to start the game:',
        error,
      );

      startupScreen.showError(error);
    }
  };

void launchGame();
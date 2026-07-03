import './styles/base.css';
import { startGame } from '../game/bootstrap';

void startGame(document.body).catch((error: unknown) => {
  console.error('Failed to start the game:', error);

  document.body.textContent =
    'The game failed to start. Check DevTools for details.';
});

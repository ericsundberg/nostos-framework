import { GameplayScene } from '../scenes/GameplayScene';
import { TitleScene } from '../scenes/TitleScene';
import type { GameServices } from '../services/GameServices';

export class GameRouter {
  public constructor(
    private readonly services:
      GameServices,
  ) {}

  public start(): void {
    this.showTitleScene();
  }

  private readonly showTitleScene =
    (): void => {
      this.services.scenes.show(
        new TitleScene({
          markerTexture:
            this.services.assets
              .markerTexture,

          data:
            this.services.data
              .titleScreen,

          input:
            this.services.input,

          settings:
            this.services.settings,

          onContinue:
            this.showGameplayScene,
        }),
      );
    };

  private readonly showGameplayScene =
    (): void => {
      this.services.scenes.show(
        new GameplayScene({
          data:
            this.services.data
              .gameplay,

          input:
            this.services.input,

          settings:
            this.services.settings,

          onBack:
            this.showTitleScene,
        }),
      );
    };
}
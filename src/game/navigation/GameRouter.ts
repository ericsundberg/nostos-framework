import { loadGameContent } from '../content/loadGameContent';
import { GameplayScene } from '../scenes/GameplayScene';
import { LaunchScene } from '../scenes/LaunchScene';
import { TitleScene } from '../scenes/TitleScene';
import type { GameServices } from '../services/GameServices';

const LAUNCH_SCREEN_MINIMUM_MS = 2500;

export class GameRouter {
  private contentLoadPromise:
    Promise<void> | null = null;

  public constructor(
    private readonly services:
      GameServices,
  ) {}

  public async start(): Promise<void> {
    if (
      this.services.settings.get(
        'showLaunchScreen',
      )
    ) {
      this.showLaunchScene();
      return;
    }

    await this.loadContent();
    this.showTitleScene();
  }

  private readonly showLaunchScene =
    (): void => {
      this.services.scenes.show(
        new LaunchScene({
          minimumMilliseconds:
            LAUNCH_SCREEN_MINIMUM_MS,

          loadingTask:
            this.loadContent,

          onComplete:
            this.showTitleScene,
        }),
      );
    };

  private readonly showTitleScene =
    (): void => {
      const content =
        this.services.getContent();

      this.services
        .getMusicDirector()
        .setContext({
          screen: 'title',
        });

      this.services.scenes.show(
        new TitleScene({
          markerTexture:
            content.assets
              .markerTexture,

          data:
            content.data
              .titleScreen,

          input:
            this.services.input,

          localization:
            this.services
              .getLocalization(),

          settings:
            this.services.settings,

          canContinue:
            false,

          onNewGame:
            this.showGameplayScene,

          onContinueGame:
            this.showGameplayScene,

          onQuitGame:
            () => {
              void this.services
                .quitApp();
            },
        }),
      );
    };

  private readonly showGameplayScene =
    (): void => {
      const content =
        this.services.getContent();

      this.services
        .getMusicDirector()
        .setContext({
          screen: 'game',
          combat: false,
        });

      this.services.scenes.show(
        new GameplayScene({
          data:
            content.data
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

  private readonly loadContent =
    async (): Promise<void> => {
      if (this.contentLoadPromise !== null) {
        await this.contentLoadPromise;
        return;
      }

      this.contentLoadPromise =
        loadGameContent({
          resolveAssetUrl:
            this.services
              .resolveAssetUrl,
        }).then((content) => {
          this.services.setContent(
            content,
          );
        });

      await this.contentLoadPromise;
    };
}
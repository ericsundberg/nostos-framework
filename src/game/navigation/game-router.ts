import { loadGameContent } from '../content/load-game-content';
import { loadLocalization } from '../localization/load-localization';
import { GameplayScene } from '../scenes/gameplay-scene';
import { LaunchScene } from '../scenes/launch-scene';
import { TitleScene } from '../scenes/title-scene';
import type { GameServices } from '../services/game-services';

const LAUNCH_SCREEN_MINIMUM_MS = 2500;

export class GameRouter {
  private localizationLoadPromise:
    Promise<void> | null = null;

  private contentLoadPromise:
    Promise<void> | null = null;

  public constructor(
    private readonly services:
      GameServices,
  ) {}

  public async start(): Promise<void> {
    await this.loadLocalization();

    if (
      this.services.settings.getAll()
        .gameplay.showLaunchScreen
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
          localization:
            this.services
              .getLocalization(),

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

          localization:
            this.services
              .getLocalization(),

          settings:
            this.services.settings,

          onBack:
            this.showTitleScene,
        }),
      );
    };

  private readonly loadLocalization =
    async (): Promise<void> => {
      if (
        this.localizationLoadPromise !== null
      ) {
        await this.localizationLoadPromise;
        return;
      }

      this.localizationLoadPromise =
        loadLocalization({
          resolveAssetUrl:
            this.services
              .resolveAssetUrl,
        }).then((localizationData) => {
          this.services
            .setLocalizationData(
              localizationData,
            );
        });

      await this.localizationLoadPromise;
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
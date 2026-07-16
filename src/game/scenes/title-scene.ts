import {
  Container,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';

import type { InputManager } from '../../core/input/input-manager';
import type { Scene } from '../../core/scenes/scene';
import type { SettingsManager } from '../../core/settings/settings-manager';
import { GAME_BUILD_VERSION } from '../build-version';
import type { TitleScreenData } from '../data/title-screen-data';
import type { LocalizationService } from '../localization/localization-service';
import { LoadGamePanel } from '../menus/load-game-panel';
import { MainMenuPanel } from '../menus/main-menu-panel';
import type { MenuPanel } from '../menus/menu-panel';
import { SettingsMenuPanel } from '../menus/settings-menu-panel';
import type { GameSettings } from '../settings/game-settings';
import type { SettingsConfigOptions } from '../settings/settings-config';

const VERSION_TEXT_PADDING = 16;
export interface TitleSceneOptions {
  markerTexture: Texture;
  data: TitleScreenData;
  input: InputManager;
  localization: LocalizationService;
  settings: SettingsManager<GameSettings>;
  settingsOptions: SettingsConfigOptions;
  canContinue: boolean;
  onNewGame: () => void;
  onContinueGame: () => void;
  onQuitGame: () => void;
}

export class TitleScene implements Scene {
  public readonly view =
    new Container();

  private readonly content =
    new Container();

  private readonly overlay =
    new Container();

  private readonly menuHost =
    new Container();

  private readonly marker: Sprite;

  private readonly versionText: Text;

  private activePanel:
    MenuPanel | null = null;

  private unsubscribeSettings:
    (() => void) | null = null;

  public constructor(
    private readonly options:
      TitleSceneOptions,
  ) {
    const { data } = options;

    this.marker = new Sprite(
      options.markerTexture,
    );

    this.marker.anchor.set(0.5);

    this.marker.width =
      data.layout.markerSize;

    this.marker.height =
      data.layout.markerSize;

    this.marker.position.set(
      0,
      data.layout.markerY,
    );

    const title = new Text({
      text:
        options.localization.text(
          'game_title',
          data.text.title,
        ),

      style: {
        fill:
          data.style.titleColor,

        fontFamily:
          'Arial, sans-serif',

        fontSize:
          data.style.titleFontSize,

        fontWeight: 'bold',
      },
    });

    title.anchor.set(0.5);

    title.position.set(
      0,
      data.layout.titleY,
    );

    this.versionText = new Text({
      text: `v${GAME_BUILD_VERSION}`,

      style: {
        align: 'right',
        fill: '#6f7785',
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
      },
    });

    this.versionText.anchor.set(
      1,
      1,
    );

    this.content.addChild(
      this.marker,
    );

    this.content.addChild(title);

    this.content.addChild(
      this.menuHost,
    );

    this.overlay.addChild(
      this.versionText,
    );

    this.view.addChild(this.content);

    this.view.addChild(
      this.overlay,
    );
  }

  public enter(): void {
    this.unsubscribeSettings =
      this.options.settings.subscribe(
        (settings) => {
          this.marker.visible =
            settings.gameplay
              .showPipelineMarker;
        },
      );

    this.showMainMenu();
  }

  public exit(): void {
    this.unsubscribeSettings?.();
    this.unsubscribeSettings = null;

    this.clearActivePanel();
  }

  public resize(
    width: number,
    height: number,
  ): void {
    this.layoutContent(
      width,
      height,
    );

    this.versionText.position.set(
      width - VERSION_TEXT_PADDING,
      height - VERSION_TEXT_PADDING,
    );

    this.activePanel?.resize?.(
      width,
      height,
    );
  }

  public destroy(): void {
    this.exit();

    this.view.destroy({
      children: true,
    });
  }

  private layoutContent(
    width: number,
    height: number,
  ): void {
    this.content.position.set(
      width / 2,
      height / 2,
    );

    this.menuHost.position.set(
      0,
      this.options.data.layout.promptY,
    );
  }

  private readonly showMainMenu =
    (): void => {
      this.showPanel(
        new MainMenuPanel({
          input:
            this.options.input,

          localization:
            this.options.localization,

          canContinue:
            this.options.canContinue,

          onNewGame:
            this.options.onNewGame,

          onContinue:
            this.options.onContinueGame,

          onLoadGame:
            this.showLoadGameMenu,

          onSettings:
            this.showSettingsMenu,

          onQuit:
            this.options.onQuitGame,
        }),
      );
    };

  private readonly showLoadGameMenu =
    (): void => {
      this.showPanel(
        new LoadGamePanel({
          input:
            this.options.input,

          localization:
            this.options.localization,

          onBack:
            this.showMainMenu,
        }),
      );
    };

  private readonly showSettingsMenu =
    (): void => {
      this.showPanel(
        new SettingsMenuPanel({
          input:
            this.options.input,

          localization:
            this.options.localization,

          settings:
            this.options.settings,

          settingsOptions:
            this.options
              .settingsOptions,

          onBack:
            this.showMainMenu,
        }),
      );
    };

  private showPanel(
    panel: MenuPanel,
  ): void {
    this.clearActivePanel();

    this.activePanel = panel;

    this.menuHost.addChild(
      panel.view,
    );

    panel.enter?.();
  }

  private clearActivePanel(): void {
    const panel = this.activePanel;

    if (panel === null) {
      return;
    }

    panel.exit?.();

    if (panel.view.parent === this.menuHost) {
      this.menuHost.removeChild(
        panel.view,
      );
    }

    panel.destroy?.();
    this.activePanel = null;
  }
}
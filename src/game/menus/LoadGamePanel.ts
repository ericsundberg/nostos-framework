import {
  Container,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/InputManager';
import type { LocalizationService } from '../localization/LocalizationService';
import type { MenuPanel } from './MenuPanel';
import { MenuButton } from './MenuButton';

export interface LoadGamePanelOptions {
  input: InputManager;
  localization: LocalizationService;
  onBack: () => void;
}

export class LoadGamePanel implements MenuPanel {
  public readonly view =
    new Container();

  private readonly backButton:
    MenuButton;

  private unsubscribeBack:
    (() => void) | null = null;

  private unsubscribeConfirm:
    (() => void) | null = null;

  public constructor(
    private readonly options:
      LoadGamePanelOptions,
  ) {
    const heading =
      new Text({
        text:
          options.localization.text(
            'load_game',
          ),
        style: {
          align: 'center',
          fill: '#f5f5f5',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 32,
          fontWeight: 'bold',
        },
      });

    heading.anchor.set(0.5);
    heading.position.set(0, -40);

    const message =
      new Text({
        text:
          options.localization.text(
            'no_save_files_found',
          ),
        style: {
          align: 'center',
          fill: '#b8bec9',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 20,
        },
      });

    message.anchor.set(0.5);
    message.position.set(0, 16);

    this.backButton =
      new MenuButton({
        id: 'back',
        label:
          options.localization.text(
            'back',
          ),
        onActivate:
          options.onBack,
      });

    this.backButton.view.position.set(
      0,
      88,
    );

    this.backButton.setSelected(true);

    this.view.addChild(heading);
    this.view.addChild(message);

    this.view.addChild(
      this.backButton.view,
    );
  }

  public enter(): void {
    this.unsubscribeBack =
      this.options.input.onPressed(
        'ui.back',
        this.options.onBack,
      );

    this.unsubscribeConfirm =
      this.options.input.onPressed(
        'ui.confirm',
        this.options.onBack,
      );
  }

  public exit(): void {
    this.unsubscribeBack?.();
    this.unsubscribeBack = null;

    this.unsubscribeConfirm?.();
    this.unsubscribeConfirm = null;
  }

  public destroy(): void {
    this.exit();
    this.backButton.destroy();
  }
}
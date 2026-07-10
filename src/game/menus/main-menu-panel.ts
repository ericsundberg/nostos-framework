import {
  Container,
  Text,
} from 'pixi.js';

import type { InputManager } from '../../core/input/input-manager';
import type { LocalizationService } from '../localization/localization-service';
import type { MenuPanel } from './menu-panel';
import { MenuButton } from './menu-button';

interface MenuItem {
  key: string;
  button: MenuButton;
  visible: boolean;
}

export interface MainMenuPanelOptions {
  input: InputManager;
  localization: LocalizationService;
  canContinue: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onLoadGame: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

export class MainMenuPanel implements MenuPanel {
  public readonly view =
    new Container();

  private readonly items:
    MenuItem[];

  private readonly descriptionText:
    Text;

  private selectedIndex = 0;

  private unsubscribeUp:
    (() => void) | null = null;

  private unsubscribeDown:
    (() => void) | null = null;

  private unsubscribeConfirm:
    (() => void) | null = null;

  public constructor(
    private readonly options:
      MainMenuPanelOptions,
  ) {
    this.descriptionText =
      new Text({
        text: '',
        style: {
          align: 'center',
          fill: '#8ecae6',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 15,
          lineHeight: 22,
          wordWrap: true,
          wordWrapWidth: 560,
        },
      });

    this.descriptionText.anchor.set(0.5);

    this.items = [
      this.createItem({
        key: 'new_game',
        visible: true,
        onActivate:
          options.onNewGame,
      }),

      this.createItem({
        key: 'continue_game',
        visible:
          options.canContinue,
        onActivate:
          options.onContinue,
      }),

      this.createItem({
        key: 'load_game',
        visible: true,
        onActivate:
          options.onLoadGame,
      }),

      this.createItem({
        key: 'settings',
        visible: true,
        onActivate:
          options.onSettings,
      }),

      this.createItem({
        key: 'quit_game',
        visible: true,
        onActivate:
          options.onQuit,
      }),
    ];

    this.layoutButtons();

    for (const item of this.items) {
      if (item.visible) {
        this.view.addChild(
          item.button.view,
        );
      }
    }

    this.view.addChild(
      this.descriptionText,
    );

    this.updateSelection();
  }

  public enter(): void {
    this.unsubscribeUp =
      this.options.input.onPressed(
        'movement.up',
        () => {
          this.moveSelection(-1);
        },
      );

    this.unsubscribeDown =
      this.options.input.onPressed(
        'movement.down',
        () => {
          this.moveSelection(1);
        },
      );

    this.unsubscribeConfirm =
      this.options.input.onPressed(
        'ui.confirm',
        () => {
          this.getVisibleItems()[
            this.selectedIndex
          ]?.button.activate();
        },
      );
  }

  public exit(): void {
    this.unsubscribeUp?.();
    this.unsubscribeUp = null;

    this.unsubscribeDown?.();
    this.unsubscribeDown = null;

    this.unsubscribeConfirm?.();
    this.unsubscribeConfirm = null;
  }

  public destroy(): void {
    this.exit();

    for (const item of this.items) {
      item.button.destroy();
    }
  }

  private createItem(
    options: {
      key: string;
      visible: boolean;
      onActivate: () => void;
    },
  ): MenuItem {
    return {
      key: options.key,
      visible: options.visible,
      button: new MenuButton({
        id: options.key,
        label:
          this.options.localization
            .text(options.key),
        onActivate:
          options.onActivate,
      }),
    };
  }

  private layoutButtons(): void {
    const visibleItems =
      this.getVisibleItems();

    visibleItems.forEach(
      (item, index) => {
        item.button.view.position.set(
          0,
          index * 62,
        );
      },
    );

    this.descriptionText.position.set(
      0,
      visibleItems.length * 62 + 30,
    );
  }

  private moveSelection(
    direction: number,
  ): void {
    const visibleItems =
      this.getVisibleItems();

    this.selectedIndex =
      (
        this.selectedIndex +
        direction +
        visibleItems.length
      ) % visibleItems.length;

    this.updateSelection();
  }

  private updateSelection(): void {
    const visibleItems =
      this.getVisibleItems();

    visibleItems.forEach(
      (item, index) => {
        item.button.setSelected(
          index === this.selectedIndex,
        );
      },
    );

    const selectedItem =
      visibleItems[this.selectedIndex];

    if (selectedItem === undefined) {
      this.descriptionText.text = '';
      return;
    }

    this.descriptionText.text =
      this.options.localization
        .description(selectedItem.key);
  }

  private getVisibleItems():
    MenuItem[] {
    return this.items.filter(
      (item) => item.visible,
    );
  }
}
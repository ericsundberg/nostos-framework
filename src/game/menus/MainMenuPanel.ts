import { Container } from 'pixi.js';

import type { InputManager } from '../../core/input/InputManager';
import type { MenuPanel } from './MenuPanel';
import { MenuButton } from './MenuButton';

interface MenuItem {
  button: MenuButton;
  visible: boolean;
}

export interface MainMenuPanelOptions {
  input: InputManager;
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
    this.items = [
      {
        visible: true,
        button: new MenuButton({
          label: 'New Game',
          onActivate:
            options.onNewGame,
        }),
      },

      {
        visible:
          options.canContinue,
        button: new MenuButton({
          label: 'Continue',
          onActivate:
            options.onContinue,
        }),
      },

      {
        visible: true,
        button: new MenuButton({
          label: 'Load Game',
          onActivate:
            options.onLoadGame,
        }),
      },

      {
        visible: true,
        button: new MenuButton({
          label: 'Settings',
          onActivate:
            options.onSettings,
        }),
      },

      {
        visible: true,
        button: new MenuButton({
          label: 'Quit Game',
          onActivate:
            options.onQuit,
        }),
      },
    ];

    this.layoutButtons();

    for (const item of this.items) {
      if (item.visible) {
        this.view.addChild(
          item.button.view,
        );
      }
    }

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
  }

  private getVisibleItems():
    MenuItem[] {
    return this.items.filter(
      (item) => item.visible,
    );
  }
}
import {
  Container,
  Graphics,
  Text,
} from 'pixi.js';

import { MENU_BUTTON_STYLE } from '../ui/theme';

export interface MenuButtonOptions {
  id: string;
  label: string;
  enabled?: boolean;
  onActivate: () => void;
}

export class MenuButton {
  public readonly id: string;

  public readonly view =
    new Container();

  private readonly background =
    new Graphics();

  private readonly labelText: Text;

  private isSelected = false;

  private isHovered = false;

  private isPressed = false;

  private readonly isEnabled: boolean;

  public constructor(
    private readonly options:
      MenuButtonOptions,
  ) {
    if (options.id.trim().length === 0) {
      throw new Error(
        'Menu button IDs cannot be empty.',
      );
    }

    this.id = options.id;

    this.isEnabled =
      options.enabled ?? true;

    this.labelText =
      new Text({
        text: options.label,
        style: {
          align: 'center',
          fill: this.isEnabled
            ? MENU_BUTTON_STYLE.text.enabled
            : MENU_BUTTON_STYLE.text.disabled,
          fontFamily:
            MENU_BUTTON_STYLE.font.family,
          fontSize:
            MENU_BUTTON_STYLE.font.size,
          fontWeight:
            MENU_BUTTON_STYLE.font.weight,
        },
      });

    this.labelText.anchor.set(0.5);

    this.view.addChild(
      this.background,
    );

    this.view.addChild(
      this.labelText,
    );

    this.view.eventMode =
      this.isEnabled
        ? 'static'
        : 'none';

    this.view.cursor =
      this.isEnabled
        ? 'pointer'
        : 'default';

    this.view.on(
      'pointertap',
      this.handlePointerTap,
    );

    this.view.on(
      'pointerover',
      this.handlePointerOver,
    );

    this.view.on(
      'pointerout',
      this.handlePointerOut,
    );

    this.view.on(
      'pointerdown',
      this.handlePointerDown,
    );

    this.view.on(
      'pointerup',
      this.handlePointerUp,
    );

    this.view.on(
      'pointerupoutside',
      this.handlePointerUp,
    );

    this.draw();
  }

  public setSelected(
    isSelected: boolean,
  ): void {
    this.isSelected = isSelected;
    this.draw();
  }

  public setLabel(
    label: string,
  ): void {
    this.labelText.text = label;
  }

  public activate(): void {
    if (!this.isEnabled) {
      return;
    }

    this.options.onActivate();
  }

  public destroy(): void {
    this.view.off(
      'pointertap',
      this.handlePointerTap,
    );

    this.view.off(
      'pointerover',
      this.handlePointerOver,
    );

    this.view.off(
      'pointerout',
      this.handlePointerOut,
    );

    this.view.off(
      'pointerdown',
      this.handlePointerDown,
    );

    this.view.off(
      'pointerup',
      this.handlePointerUp,
    );

    this.view.off(
      'pointerupoutside',
      this.handlePointerUp,
    );

    this.view.destroy({
      children: true,
    });
  }

  private readonly handlePointerTap =
    (): void => {
      this.activate();
    };

  private readonly handlePointerOver =
    (): void => {
      if (!this.isEnabled) {
        return;
      }

      this.isHovered = true;
      this.draw();
    };

  private readonly handlePointerOut =
    (): void => {
      this.isHovered = false;
      this.isPressed = false;
      this.draw();
    };

  private readonly handlePointerDown =
    (): void => {
      if (!this.isEnabled) {
        return;
      }

      this.isPressed = true;
      this.draw();
    };

  private readonly handlePointerUp =
    (): void => {
      this.isPressed = false;
      this.draw();
    };

  private getBackgroundColor(): string {
    if (!this.isEnabled) {
      return MENU_BUTTON_STYLE.background.disabled;
    }

    if (this.isSelected) {
      return MENU_BUTTON_STYLE.background.selected;
    }

    if (this.isPressed) {
      return MENU_BUTTON_STYLE.background.pressed;
    }

    if (this.isHovered) {
      return MENU_BUTTON_STYLE.background.hover;
    }

    return MENU_BUTTON_STYLE.background.default;
  }

  private getBorderColor(): string {
    if (!this.isEnabled) {
      return MENU_BUTTON_STYLE.border.disabled;
    }

    if (this.isSelected) {
      return MENU_BUTTON_STYLE.border.selected;
    }

    if (this.isHovered || this.isPressed) {
      return MENU_BUTTON_STYLE.border.hover;
    }

    return MENU_BUTTON_STYLE.border.default;
  }

  private draw(): void {
    this.background.clear();

    this.background
      .roundRect(
        -MENU_BUTTON_STYLE.width / 2,
        -MENU_BUTTON_STYLE.height / 2,
        MENU_BUTTON_STYLE.width,
        MENU_BUTTON_STYLE.height,
        MENU_BUTTON_STYLE.radius,
      )
      .fill(
        this.getBackgroundColor(),
      )
      .stroke({
        color: this.getBorderColor(),
        width:
          MENU_BUTTON_STYLE.border.width,
      });
  }
}
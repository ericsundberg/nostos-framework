import {
  Container,
  Graphics,
  Text,
} from 'pixi.js';

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

  private isEnabled: boolean;

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
            ? '#f5f5f5'
            : '#6f7785',
          fontFamily:
            'Arial, sans-serif',
          fontSize: 24,
          fontWeight: 'bold',
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

    this.view.destroy({
      children: true,
    });
  }

  private readonly handlePointerTap =
    (): void => {
      this.activate();
    };

  private draw(): void {
    this.background.clear();

    this.background
      .roundRect(
        -150,
        -24,
        300,
        48,
        8,
      )
      .fill(
        this.isSelected
          ? '#243244'
          : '#171b22',
      )
      .stroke({
        color: this.isSelected
          ? '#8ecae6'
          : '#394150',
        width: 2,
      });
  }
}
import type { Container } from 'pixi.js';

export interface MenuPanel {
  readonly view: Container;

  enter?(): void;
  exit?(): void;
  resize?(
    width: number,
    height: number,
  ): void;
  destroy?(): void;
}
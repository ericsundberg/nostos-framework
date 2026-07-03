import type { Container } from 'pixi.js';

export interface Scene {
  readonly view: Container;

  enter?(): void;
  exit?(): void;
  resize(width: number, height: number): void;
  update?(deltaMilliseconds: number): void;
  destroy?(): void;
}
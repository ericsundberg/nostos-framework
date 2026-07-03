import type {
  Application,
  Ticker,
} from 'pixi.js';

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Scene } from '../../src/core/scenes/Scene';
import { SceneManager } from '../../src/core/scenes/SceneManager';

interface FakeView {
  parent: unknown | null;
}

const createScene = () => {
  const rawView: FakeView = {
    parent: null,
  };

  const scene: Scene = {
    view:
      rawView as unknown as
        Scene['view'],

    enter: vi.fn(),
    exit: vi.fn(),
    resize: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  };

  return {
    scene,
    rawView,
  };
};

const createApplication = () => {
  let updateCallback:
    ((ticker: Ticker) => void) |
    null = null;

  const stage = {
    addChild: vi.fn(
      (child: unknown): void => {
        (
          child as FakeView
        ).parent = stage;
      },
    ),

    removeChild: vi.fn(
      (child: unknown): void => {
        (
          child as FakeView
        ).parent = null;
      },
    ),
  };

  const ticker = {
    add: vi.fn(
      (
        callback:
          (ticker: Ticker) => void,
      ): void => {
        updateCallback = callback;
      },
    ),

    remove: vi.fn(),
  };

  const screen = {
    width: 800,
    height: 600,
  };

  const app = {
    stage,
    ticker,
    screen,
  } as unknown as Application;

  return {
    app,
    stage,
    ticker,
    screen,

    getUpdateCallback:
      () => updateCallback,
  };
};

describe('SceneManager', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(
    'enters, updates, resizes, replaces, and destroys scenes',
    () => {
      const target =
        new EventTarget();

      vi.stubGlobal(
        'window',
        target,
      );

      const application =
        createApplication();

      const manager =
        new SceneManager(
          application.app,
        );

      const first =
        createScene();

      manager.show(first.scene);

      expect(
        application.stage.addChild,
      ).toHaveBeenCalledWith(
        first.scene.view,
      );

      expect(first.scene.resize)
        .toHaveBeenCalledWith(
          800,
          600,
        );

      expect(first.scene.enter)
        .toHaveBeenCalledTimes(1);

      application
        .getUpdateCallback()
        ?.(
          {
            deltaMS: 16,
          } as unknown as Ticker,
        );

      expect(first.scene.update)
        .toHaveBeenCalledWith(16);

      application.screen.width =
        1280;

      application.screen.height =
        720;

      target.dispatchEvent(
        new Event('resize'),
      );

      expect(first.scene.resize)
        .toHaveBeenLastCalledWith(
          1280,
          720,
        );

      const second =
        createScene();

      manager.show(second.scene);

      expect(first.scene.exit)
        .toHaveBeenCalledTimes(1);

      expect(first.scene.destroy)
        .toHaveBeenCalledTimes(1);

      expect(
        application.stage.removeChild,
      ).toHaveBeenCalledWith(
        first.scene.view,
      );

      expect(second.scene.enter)
        .toHaveBeenCalledTimes(1);

      manager.destroy();

      expect(second.scene.exit)
        .toHaveBeenCalledTimes(1);

      expect(second.scene.destroy)
        .toHaveBeenCalledTimes(1);

      expect(application.ticker.remove)
        .toHaveBeenCalledTimes(1);
    },
  );

  it(
    'does nothing when asked to show the active scene again',
    () => {
      vi.stubGlobal(
        'window',
        new EventTarget(),
      );

      const application =
        createApplication();

      const manager =
        new SceneManager(
          application.app,
        );

      const current =
        createScene();

      manager.show(current.scene);
      manager.show(current.scene);

      expect(current.scene.enter)
        .toHaveBeenCalledTimes(1);

      expect(current.scene.exit)
        .not.toHaveBeenCalled();

      manager.destroy();
    },
  );
});
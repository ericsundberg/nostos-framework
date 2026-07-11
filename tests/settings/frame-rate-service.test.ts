import type { Application } from 'pixi.js';
import {
  describe,
  expect,
  it,
} from 'vitest';

import type { SettingsManager } from '../../src/core/settings/settings-manager';
import { FrameRateService } from '../../src/game/services/frame-rate-service';
import {
  DEFAULT_GAME_SETTINGS,
  type GameSettings,
} from '../../src/game/settings/game-settings';

type SettingsListener =
  (settings: Readonly<GameSettings>) => void;

class EventTargetStub {
  private readonly listeners =
    new Map<
      string,
      Set<EventListenerOrEventListenerObject>
    >();

  public addEventListener(
    type: string,
    listener:
      | EventListenerOrEventListenerObject
      | null,
  ): void {
    if (listener === null) {
      return;
    }

    const listeners =
      this.listeners.get(type) ??
      new Set<
        EventListenerOrEventListenerObject
      >();

    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  public removeEventListener(
    type: string,
    listener:
      | EventListenerOrEventListenerObject
      | null,
  ): void {
    if (listener === null) {
      return;
    }

    this.listeners
      .get(type)
      ?.delete(listener);
  }

  public dispatch(
    type: string,
  ): void {
    const event = new Event(type);

    for (
      const listener of
      this.listeners.get(type) ?? []
    ) {
      if (typeof listener === 'function') {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    }
  }
}

class DocumentStub extends EventTargetStub {
  public visibilityState:
    DocumentVisibilityState =
      'visible';
}

const createApp = ():
  Application => ({
    ticker: {
      maxFPS: -1,
    },
  } as unknown as Application);

const createSettingsStub = () => {
  let currentSettings:
    Readonly<GameSettings> =
      DEFAULT_GAME_SETTINGS;

  const listeners =
    new Set<SettingsListener>();

  const manager = {
    getAll: () => currentSettings,

    subscribe: (
      listener: SettingsListener,
      emitCurrent = true,
    ) => {
      listeners.add(listener);

      if (emitCurrent) {
        listener(currentSettings);
      }

      return () => {
        listeners.delete(listener);
      };
    },

    emit: (
      settings: Readonly<GameSettings>,
    ) => {
      currentSettings = settings;

      for (const listener of listeners) {
        listener(currentSettings);
      }
    },
  };

  return manager as
    SettingsManager<GameSettings> & {
      emit: (
        settings: Readonly<GameSettings>,
      ) => void;
    };
};

describe(
  'FrameRateService',
  () => {
    it(
      'uses active FPS while focused and background FPS while blurred',
      () => {
        const app = createApp();
        const settings =
          createSettingsStub();
        const target =
          new EventTargetStub();
        const documentRef =
          new DocumentStub();

        new FrameRateService({
          app,
          settings,
          target:
            target as unknown as Window,
          documentRef:
            documentRef as unknown as Document,
        });

        expect(
          app.ticker.maxFPS,
        ).toBe(0);

        target.dispatch('blur');

        expect(
          app.ticker.maxFPS,
        ).toBe(30);

        target.dispatch('focus');

        expect(
          app.ticker.maxFPS,
        ).toBe(0);
      },
    );

    it(
      'uses background FPS while document is hidden',
      () => {
        const app = createApp();
        const settings =
          createSettingsStub();
        const target =
          new EventTargetStub();
        const documentRef =
          new DocumentStub();

        new FrameRateService({
          app,
          settings,
          target:
            target as unknown as Window,
          documentRef:
            documentRef as unknown as Document,
        });

        documentRef.visibilityState =
          'hidden';

        documentRef.dispatch(
          'visibilitychange',
        );

        expect(
          app.ticker.maxFPS,
        ).toBe(30);

        documentRef.visibilityState =
          'visible';

        documentRef.dispatch(
          'visibilitychange',
        );

        expect(
          app.ticker.maxFPS,
        ).toBe(0);
      },
    );

    it(
      'reacts to graphics setting changes',
      () => {
        const app = createApp();
        const settings =
          createSettingsStub();
        const target =
          new EventTargetStub();
        const documentRef =
          new DocumentStub();

        new FrameRateService({
          app,
          settings,
          target:
            target as unknown as Window,
          documentRef:
            documentRef as unknown as Document,
        });

        settings.emit({
          ...DEFAULT_GAME_SETTINGS,

          graphics: {
            ...DEFAULT_GAME_SETTINGS
              .graphics,

            fpsLimit: 144,
            backgroundFpsLimit: 15,
          },
        });

        expect(
          app.ticker.maxFPS,
        ).toBe(144);

        target.dispatch('blur');

        expect(
          app.ticker.maxFPS,
        ).toBe(15);
      },
    );

    it(
      'stops reacting after destroy',
      () => {
        const app = createApp();
        const settings =
          createSettingsStub();
        const target =
          new EventTargetStub();
        const documentRef =
          new DocumentStub();

        const service =
          new FrameRateService({
            app,
            settings,
            target:
              target as unknown as Window,
            documentRef:
              documentRef as unknown as Document,
          });

        expect(
          app.ticker.maxFPS,
        ).toBe(0);

        service.destroy();

        target.dispatch('blur');

        settings.emit({
          ...DEFAULT_GAME_SETTINGS,

          graphics: {
            ...DEFAULT_GAME_SETTINGS
              .graphics,

            fpsLimit: 60,
            backgroundFpsLimit: 10,
          },
        });

        expect(
          app.ticker.maxFPS,
        ).toBe(0);
      },
    );
  },
);
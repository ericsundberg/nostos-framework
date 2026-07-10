import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { SettingsManager } from '../../src/core/settings/settings-manager';

interface TestSettings {
  enabled: boolean;
  count: number;
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const normalizeSettings = (
  value: unknown,
): TestSettings => {
  if (!isRecord(value)) {
    return {
      enabled: false,
      count: 0,
    };
  }

  return {
    enabled:
      typeof value.enabled === 'boolean'
        ? value.enabled
        : false,

    count:
      typeof value.count === 'number'
        ? value.count
        : 0,
  };
};

const createDeferred = () => {
  let resolvePromise:
    (() => void) | null = null;

  const promise =
    new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

  return {
    promise,

    resolve: (): void => {
      resolvePromise?.();
    },
  };
};

describe('SettingsManager', () => {
  it(
    'normalizes loaded settings and notifies subscribers',
    async () => {
      const load = vi.fn(
        async (): Promise<unknown> => ({
          enabled: true,
          count: 4,
        }),
      );

      const save = vi.fn(
        async (): Promise<void> =>
          undefined,
      );

      const manager =
        new SettingsManager<TestSettings>({
          normalize:
            normalizeSettings,

          storage: {
            load,
            save,
          },
        });

      const listener = vi.fn();

      manager.subscribe(listener);

      expect(listener)
        .toHaveBeenLastCalledWith({
          enabled: false,
          count: 0,
        });

      await manager.load();

      expect(load)
        .toHaveBeenCalledTimes(1);

      expect(manager.getAll())
        .toEqual({
          enabled: true,
          count: 4,
        });

      expect(listener)
        .toHaveBeenLastCalledWith({
          enabled: true,
          count: 4,
        });
    },
  );

  it(
    'serializes writes in request order',
    async () => {
      const firstSave =
        createDeferred();

      const saveOrder: string[] = [];

      const save = vi.fn(
        async (
          settings: TestSettings,
        ): Promise<void> => {
          saveOrder.push(
            `start:${settings.count}`,
          );

          if (settings.count === 1) {
            await firstSave.promise;
          }

          saveOrder.push(
            `end:${settings.count}`,
          );
        },
      );

      const manager =
        new SettingsManager<TestSettings>({
          normalize:
            normalizeSettings,

          storage: {
            load: async () => null,
            save,
          },
        });

      const first =
        manager.set('count', 1);

      const second =
        manager.set('count', 2);

      await Promise.resolve();
      await Promise.resolve();

      expect(save)
        .toHaveBeenCalledTimes(1);

      firstSave.resolve();

      await Promise.all([
        first,
        second,
      ]);

      expect(saveOrder).toEqual([
        'start:1',
        'end:1',
        'start:2',
        'end:2',
      ]);

      expect(
        manager.get('count'),
      ).toBe(2);
    },
  );

  it(
    'keeps the previous value after a failed save and allows later writes',
    async () => {
      let saveAttempt = 0;

      const manager =
        new SettingsManager<TestSettings>({
          normalize:
            normalizeSettings,

          storage: {
            load: async () => null,

            save: async () => {
              saveAttempt += 1;

              if (saveAttempt === 1) {
                throw new Error(
                  'Storage unavailable.',
                );
              }
            },
          },
        });

      await expect(
        manager.set('count', 1),
      ).rejects.toThrow(
        'Storage unavailable.',
      );

      expect(
        manager.get('count'),
      ).toBe(0);

      await manager.set(
        'count',
        2,
      );

      expect(
        manager.get('count'),
      ).toBe(2);
    },
  );
});
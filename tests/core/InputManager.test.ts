import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { InputManager } from '../../src/core/input/InputManager';

const createKeyboardEvent = (
  type: 'keydown' | 'keyup',
  code: string,
  repeat = false,
): KeyboardEvent => {
  const event = new Event(
    type,
    {
      cancelable: true,
    },
  );

  Object.defineProperties(
    event,
    {
      code: {
        value: code,
      },

      repeat: {
        value: repeat,
      },
    },
  );

  return event as KeyboardEvent;
};

describe('InputManager', () => {
  let input:
    InputManager | null = null;

  afterEach(() => {
    input?.destroy();
    input = null;
  });

  it(
    'emits once per physical press and tracks held actions',
    () => {
      const target =
        new EventTarget();

      input = new InputManager(
        target as unknown as Window,
      );

      input.bindAction(
        'ui.confirm',
        ['Enter', 'Space'],
      );

      const listener = vi.fn();

      input.onPressed(
        'ui.confirm',
        listener,
      );

      const firstPress =
        createKeyboardEvent(
          'keydown',
          'Enter',
        );

      target.dispatchEvent(
        firstPress,
      );

      expect(listener)
        .toHaveBeenCalledTimes(1);

      expect(
        input.isDown('ui.confirm'),
      ).toBe(true);

      expect(
        firstPress.defaultPrevented,
      ).toBe(true);

      target.dispatchEvent(
        createKeyboardEvent(
          'keydown',
          'Enter',
          true,
        ),
      );

      target.dispatchEvent(
        createKeyboardEvent(
          'keydown',
          'Enter',
        ),
      );

      expect(listener)
        .toHaveBeenCalledTimes(1);

      target.dispatchEvent(
        createKeyboardEvent(
          'keyup',
          'Enter',
        ),
      );

      expect(
        input.isDown('ui.confirm'),
      ).toBe(false);

      target.dispatchEvent(
        createKeyboardEvent(
          'keydown',
          'Enter',
        ),
      );

      expect(listener)
        .toHaveBeenCalledTimes(2);
    },
  );

  it(
    'clears held actions when the target loses focus',
    () => {
      const target =
        new EventTarget();

      input = new InputManager(
        target as unknown as Window,
      );

      input.bindAction(
        'movement.up',
        ['KeyW'],
      );

      target.dispatchEvent(
        createKeyboardEvent(
          'keydown',
          'KeyW',
        ),
      );

      expect(
        input.isDown('movement.up'),
      ).toBe(true);

      target.dispatchEvent(
        new Event('blur'),
      );

      expect(
        input.isDown('movement.up'),
      ).toBe(false);
    },
  );

  it(
    'supports unsubscribe and rejects invalid bindings',
    () => {
      const target =
        new EventTarget();

      input = new InputManager(
        target as unknown as Window,
      );

      expect(
        () =>
          input?.bindAction(
            '   ',
            ['Enter'],
          ),
      ).toThrow(
        'Input action names cannot be empty.',
      );

      expect(
        () =>
          input?.bindAction(
            'ui.confirm',
            [],
          ),
      ).toThrow(
        'requires at least one key',
      );

      input.bindAction(
        'ui.confirm',
        ['Enter'],
      );

      const listener = vi.fn();

      const unsubscribe =
        input.onPressed(
          'ui.confirm',
          listener,
        );

      unsubscribe();

      target.dispatchEvent(
        createKeyboardEvent(
          'keydown',
          'Enter',
        ),
      );

      expect(listener)
        .not.toHaveBeenCalled();
    },
  );
});
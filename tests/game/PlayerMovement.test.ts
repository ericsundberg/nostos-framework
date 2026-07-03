import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  movePlayer,
  type PlayerMovementBounds,
} from '../../src/game/systems/PlayerMovement';

const bounds:
  PlayerMovementBounds = {
    minX: 10,
    maxX: 90,
    minY: 20,
    maxY: 80,
  };

const noInput = {
  left: false,
  right: false,
  up: false,
  down: false,
};

describe('movePlayer', () => {
  it(
    'moves according to elapsed time',
    () => {
      const result = movePlayer({
        position: {
          x: 20,
          y: 30,
        },

        input: {
          ...noInput,
          right: true,
        },

        bounds,
        speed: 100,
        deltaMilliseconds: 500,
      });

      expect(result).toEqual({
        x: 70,
        y: 30,
      });
    },
  );

  it(
    'normalizes diagonal movement',
    () => {
      const result = movePlayer({
        position: {
          x: 0,
          y: 0,
        },

        input: {
          ...noInput,
          right: true,
          down: true,
        },

        bounds: {
          minX: -200,
          maxX: 200,
          minY: -200,
          maxY: 200,
        },

        speed: 100,
        deltaMilliseconds: 1000,
      });

      expect(result.x)
        .toBeCloseTo(
          Math.SQRT1_2 * 100,
        );

      expect(result.y)
        .toBeCloseTo(
          Math.SQRT1_2 * 100,
        );
    },
  );

  it(
    'cancels opposing directions',
    () => {
      const result = movePlayer({
        position: {
          x: 50,
          y: 50,
        },

        input: {
          left: true,
          right: true,
          up: true,
          down: true,
        },

        bounds,
        speed: 100,
        deltaMilliseconds: 1000,
      });

      expect(result).toEqual({
        x: 50,
        y: 50,
      });
    },
  );

  it(
    'keeps the player inside the bounds',
    () => {
      const result = movePlayer({
        position: {
          x: 88,
          y: 22,
        },

        input: {
          ...noInput,
          right: true,
          up: true,
        },

        bounds,
        speed: 500,
        deltaMilliseconds: 1000,
      });

      expect(result).toEqual({
        x: 90,
        y: 20,
      });
    },
  );

  it(
    'ignores invalid elapsed time',
    () => {
      const result = movePlayer({
        position: {
          x: 50,
          y: 50,
        },

        input: {
          ...noInput,
          right: true,
        },

        bounds,
        speed: 100,
        deltaMilliseconds: -10,
      });

      expect(result).toEqual({
        x: 50,
        y: 50,
      });
    },
  );
});
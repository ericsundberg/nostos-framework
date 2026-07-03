import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  isGameplayData,
  type GameplayData,
} from '../../src/game/data/GameplayData';

const validGameplayData:
  GameplayData = {
    schemaVersion: 1,

    playfield: {
      width: 640,
      height: 360,
      padding: 24,
      backgroundColor: '#171b22',
      borderColor: '#3a4353',
    },

    player: {
      size: 28,
      speed: 240,
      color: '#8ecae6',
    },

    text: {
      instructions:
        'Move with WASD.',
    },
  };

describe('GameplayData', () => {
  it(
    'accepts valid gameplay data',
    () => {
      expect(
        isGameplayData(
          validGameplayData,
        ),
      ).toBe(true);
    },
  );

  it(
    'rejects invalid fields',
    () => {
      expect(
        isGameplayData({
          ...validGameplayData,
          schemaVersion: 2,
        }),
      ).toBe(false);

      expect(
        isGameplayData({
          ...validGameplayData,

          player: {
            ...validGameplayData
              .player,

            speed: 0,
          },
        }),
      ).toBe(false);

      expect(
        isGameplayData({
          ...validGameplayData,

          text: {
            instructions: '',
          },
        }),
      ).toBe(false);
    },
  );

  it(
    'rejects a playfield too small for the player',
    () => {
      expect(
        isGameplayData({
          ...validGameplayData,

          playfield: {
            ...validGameplayData
              .playfield,

            width: 60,
            padding: 20,
          },

          player: {
            ...validGameplayData
              .player,

            size: 28,
          },
        }),
      ).toBe(false);
    },
  );
});
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { MusicDirector } from '../../src/game/music/music-director';
import type { MusicData } from '../../src/game/music/music-data';
import type {
  MusicPlaybackOptions,
  MusicService,
} from '../../src/game/services/music-service';

const musicData: MusicData = {
  schemaVersion: 1,

  tracks: {
    'title.main': {
      src: 'audio/music/main-menu.ogg',
      volume: 0.4,
    },

    'game.exploration.1': {
      src: 'audio/music/explore-one.ogg',
      volume: 0.2,
    },

    'game.exploration.2': {
      src: 'audio/music/explore-two.ogg',
      volume: 0.25,
    },

    'game.combat.1': {
      src: 'audio/music/combat-one.ogg',
      volume: 0.55,
    },
  },

  playlists: {
    title: [
      'title.main',
    ],

    'game.exploration': [
      'game.exploration.1',
      'game.exploration.2',
    ],

    'game.combat': [
      'game.combat.1',
    ],
  },

  rules: [
    {
      id: 'title',
      when: {
        screen: 'title',
      },
      playlist: 'title',
    },

    {
      id: 'game.exploration',
      when: {
        screen: 'game',
        combat: false,
      },
      playlist: 'game.exploration',
      cycle: true,
    },

    {
      id: 'game.combat',
      when: {
        screen: 'game',
        combat: true,
      },
      playlist: 'game.combat',
      cycle: true,
    },
  ],
};

const createHarness = (): {
  director: MusicDirector;
  play: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
} => {
  const play = vi.fn();
  const stop = vi.fn();

  const music = {
    play,
    playLoop: vi.fn(),
    stop,
    destroy: vi.fn(),
  } as unknown as MusicService;

  const director =
    new MusicDirector({
      data: musicData,
      music,
      resolveAssetUrl:
        (relativePath) =>
          `game-asset://assets/${relativePath}`,
    });

  return {
    director,
    play,
    stop,
  };
};

const getPlayCall = (
  play: ReturnType<typeof vi.fn>,
  index: number,
): [
  string,
  MusicPlaybackOptions,
] => {
  const call =
    play.mock.calls[index];

  if (call === undefined) {
    throw new Error(
      `Expected play call ${index} to exist.`,
    );
  }

  return call as [
    string,
    MusicPlaybackOptions,
  ];
};

describe('MusicDirector', () => {
  it(
    'plays title music for the title context',
    () => {
      const { director, play } =
        createHarness();

      director.setContext({
        screen: 'title',
      });

      expect(play)
        .toHaveBeenCalledTimes(1);

      const [url, options] =
        getPlayCall(play, 0);

      expect(url).toBe(
        'game-asset://assets/audio/music/main-menu.ogg',
      );

      expect(options).toEqual(
        expect.objectContaining({
          loop: true,
          volume: 0.4,
        }),
      );

      expect(options.onEnded)
        .toBeUndefined();
    },
  );

  it(
    'does not restart music when the matching rule is unchanged',
    () => {
      const { director, play } =
        createHarness();

      director.setContext({
        screen: 'title',
      });

      director.setContext({
        screen: 'title',
      });

      expect(play)
        .toHaveBeenCalledTimes(1);
    },
  );

  it(
    'plays exploration music and cycles when the playlist has multiple tracks',
    () => {
      const { director, play } =
        createHarness();

      director.setContext({
        screen: 'game',
        combat: false,
      });

      expect(play)
        .toHaveBeenCalledTimes(1);

      const [firstUrl, firstOptions] =
        getPlayCall(play, 0);

      expect(firstUrl).toBe(
        'game-asset://assets/audio/music/explore-one.ogg',
      );

      expect(firstOptions).toEqual(
        expect.objectContaining({
          loop: false,
          volume: 0.2,
        }),
      );

      expect(
        typeof firstOptions.onEnded,
      ).toBe('function');

      firstOptions.onEnded?.();

      expect(play)
        .toHaveBeenCalledTimes(2);

      const [secondUrl, secondOptions] =
        getPlayCall(play, 1);

      expect(secondUrl).toBe(
        'game-asset://assets/audio/music/explore-two.ogg',
      );

      expect(secondOptions).toEqual(
        expect.objectContaining({
          loop: false,
          volume: 0.25,
        }),
      );

      secondOptions.onEnded?.();

      expect(play)
        .toHaveBeenCalledTimes(3);

      const [thirdUrl] =
        getPlayCall(play, 2);

      expect(thirdUrl).toBe(
        'game-asset://assets/audio/music/explore-one.ogg',
      );
    },
  );

  it(
    'loops a single-track combat playlist even when the rule allows cycling',
    () => {
      const { director, play } =
        createHarness();

      director.setContext({
        screen: 'game',
        combat: true,
      });

      expect(play)
        .toHaveBeenCalledTimes(1);

      const [url, options] =
        getPlayCall(play, 0);

      expect(url).toBe(
        'game-asset://assets/audio/music/combat-one.ogg',
      );

      expect(options).toEqual(
        expect.objectContaining({
          loop: true,
          volume: 0.55,
        }),
      );

      expect(options.onEnded)
        .toBeUndefined();
    },
  );

  it(
    'stops music when no rule matches the context',
    () => {
      const {
        director,
        play,
        stop,
      } = createHarness();

      director.setContext({
        screen: 'title',
      });

      director.setContext({
        screen: 'unknown',
      });

      expect(play)
        .toHaveBeenCalledTimes(1);

      expect(stop)
        .toHaveBeenCalledTimes(1);
    },
  );

  it(
    'can manually advance to the next track in the active playlist',
    () => {
      const { director, play } =
        createHarness();

      director.setContext({
        screen: 'game',
        combat: false,
      });

      director.nextTrack();

      expect(play)
        .toHaveBeenCalledTimes(2);

      const [url] =
        getPlayCall(play, 1);

      expect(url).toBe(
        'game-asset://assets/audio/music/explore-two.ogg',
      );
    },
  );
});
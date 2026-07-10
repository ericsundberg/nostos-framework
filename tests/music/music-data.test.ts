import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  isMusicData,
  type MusicData,
} from '../../src/game/music/music-data';

const validMusicData: MusicData = {
  schemaVersion: 1,

  tracks: {
    'title.main': {
      src: 'audio/music/main-menu.ogg',
      volume: 0.35,
    },

    'game.exploration.1': {
      src: 'audio/music/explore-one.ogg',
      volume: 0.3,
    },

    'game.exploration.2': {
      src: 'audio/music/explore-two.ogg',
    },

    'game.combat.1': {
      src: 'audio/music/combat-one.ogg',
      volume: 0.6,
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

describe('MusicData', () => {
  it(
    'validates a complete music data document',
    () => {
      expect(
        isMusicData(validMusicData),
      ).toBe(true);
    },
  );

  it(
    'rejects invalid root documents and schema versions',
    () => {
      expect(
        isMusicData(null),
      ).toBe(false);

      expect(
        isMusicData({
          ...validMusicData,
          schemaVersion: 2,
        }),
      ).toBe(false);

      expect(
        isMusicData({
          ...validMusicData,
          tracks: [],
        }),
      ).toBe(false);
    },
  );

  it(
    'rejects invalid track definitions',
    () => {
      expect(
        isMusicData({
          ...validMusicData,

          tracks: {
            ...validMusicData.tracks,

            'title.main': {
              src: '',
            },
          },
        }),
      ).toBe(false);

      expect(
        isMusicData({
          ...validMusicData,

          tracks: {
            ...validMusicData.tracks,

            'title.main': {
              src: 'audio/music/main-menu.ogg',
              volume: 1.5,
            },
          },
        }),
      ).toBe(false);

      expect(
        isMusicData({
          ...validMusicData,

          tracks: {
            ...validMusicData.tracks,

            'title.main': {
              src: 'audio/music/main-menu.ogg',
              volume: -0.1,
            },
          },
        }),
      ).toBe(false);
    },
  );

  it(
    'rejects empty playlists and missing track references',
    () => {
      expect(
        isMusicData({
          ...validMusicData,

          playlists: {
            ...validMusicData.playlists,

            title: [],
          },
        }),
      ).toBe(false);

      expect(
        isMusicData({
          ...validMusicData,

          playlists: {
            ...validMusicData.playlists,

            title: [
              'missing.track',
            ],
          },
        }),
      ).toBe(false);
    },
  );

  it(
    'rejects invalid rules and missing playlist references',
    () => {
      expect(
        isMusicData({
          ...validMusicData,

          rules: [
            {
              id: 'broken',
              when: {
                screen: 'title',
              },
              playlist: 'missing.playlist',
            },
          ],
        }),
      ).toBe(false);

      expect(
        isMusicData({
          ...validMusicData,

          rules: [
            {
              id: '',
              when: {
                screen: 'title',
              },
              playlist: 'title',
            },
          ],
        }),
      ).toBe(false);

      expect(
        isMusicData({
          ...validMusicData,

          rules: [
            {
              id: 'broken',
              when: {
                screen: null,
              },
              playlist: 'title',
            },
          ],
        }),
      ).toBe(false);
    },
  );
});
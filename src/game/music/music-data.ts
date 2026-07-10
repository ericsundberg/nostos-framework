export type MusicContextValue =
  | string
  | number
  | boolean;

export type MusicContext =
  Record<string, MusicContextValue>;

export interface MusicTrack {
  src: string;
  volume?: number;
}

export interface MusicRule {
  id: string;
  when: MusicContext;
  playlist: string;
  cycle?: boolean;
}

export interface MusicData {
  schemaVersion: 1;
  tracks: Record<string, MusicTrack>;
  playlists: Record<string, string[]>;
  rules: MusicRule[];
}

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const isNonEmptyString = (
  value: unknown,
): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0;

const isFiniteNumber = (
  value: unknown,
): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value);

const isMusicContextValue = (
  value: unknown,
): value is MusicContextValue =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

const isMusicTrack = (
  value: unknown,
): value is MusicTrack => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.src)
  ) {
    return false;
  }

  if (
    value.volume !== undefined &&
    (
      !isFiniteNumber(value.volume) ||
      value.volume < 0 ||
      value.volume > 1
    )
  ) {
    return false;
  }

  return true;
};

const isMusicContext = (
  value: unknown,
): value is MusicContext => {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    isMusicContextValue,
  );
};

const isMusicRule = (
  value: unknown,
): value is MusicRule =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  isMusicContext(value.when) &&
  isNonEmptyString(value.playlist) &&
  (
    value.cycle === undefined ||
    typeof value.cycle === 'boolean'
  );

export const isMusicData = (
  value: unknown,
): value is MusicData => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isRecord(value.tracks) ||
    !isRecord(value.playlists) ||
    !Array.isArray(value.rules)
  ) {
    return false;
  }

  const tracks =
    value.tracks as Record<string, unknown>;

  const playlists =
    value.playlists as Record<string, unknown>;

  if (
    !Object.values(tracks).every(
      isMusicTrack,
    )
  ) {
    return false;
  }

  const trackIds =
    new Set(Object.keys(tracks));

  for (
    const playlist of
    Object.values(playlists)
  ) {
    if (
      !Array.isArray(playlist) ||
      playlist.length === 0 ||
      !playlist.every(isNonEmptyString)
    ) {
      return false;
    }

    for (const trackId of playlist) {
      if (!trackIds.has(trackId)) {
        return false;
      }
    }
  }

  const playlistIds =
    new Set(Object.keys(playlists));

  if (
    !value.rules.every(isMusicRule)
  ) {
    return false;
  }

  return value.rules.every(
    (rule) =>
      playlistIds.has(rule.playlist),
  );
};
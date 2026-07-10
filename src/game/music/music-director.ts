import type { MusicService } from '../services/music-service';
import type {
  MusicContext,
  MusicData,
  MusicRule,
} from './music-data';

export interface MusicDirectorOptions {
  data: MusicData;
  music: MusicService;
  resolveAssetUrl: (
    relativePath: string,
  ) => string;
}

export class MusicDirector {
  private currentRuleId:
    string | null = null;

  private currentPlaylistId:
    string | null = null;

  private currentTrackIndex = 0;

  private currentCycle = false;

  public constructor(
    private readonly options:
      MusicDirectorOptions,
  ) {}

  public setContext(
    context: MusicContext,
  ): void {
    const rule =
      this.findMatchingRule(context);

    if (rule === null) {
      this.stop();
      return;
    }

    if (
      this.currentRuleId === rule.id
    ) {
      return;
    }

    this.currentRuleId = rule.id;
    this.currentPlaylistId =
      rule.playlist;
    this.currentTrackIndex = 0;
    this.currentCycle =
      rule.cycle ?? false;

    this.playCurrentTrack();
  }

  public readonly nextTrack =
    (): void => {
      const playlist =
        this.getCurrentPlaylist();

      if (
        playlist === null ||
        playlist.length === 0
      ) {
        return;
      }

      this.currentTrackIndex =
        (
          this.currentTrackIndex + 1
        ) % playlist.length;

      this.playCurrentTrack();
    };

  public stop(): void {
    this.currentRuleId = null;
    this.currentPlaylistId = null;
    this.currentTrackIndex = 0;
    this.currentCycle = false;

    this.options.music.stop();
  }

  private findMatchingRule(
    context: MusicContext,
  ): MusicRule | null {
    return (
      this.options.data.rules.find(
        (rule) =>
          Object.entries(rule.when).every(
            ([key, value]) =>
              context[key] === value,
          ),
      ) ?? null
    );
  }

  private getCurrentPlaylist():
    string[] | null {
    if (this.currentPlaylistId === null) {
      return null;
    }

    return (
      this.options.data.playlists[
        this.currentPlaylistId
      ] ?? null
    );
  }

  private playCurrentTrack(): void {
    const playlist =
      this.getCurrentPlaylist();

    if (
      playlist === null ||
      playlist.length === 0
    ) {
      this.options.music.stop();
      return;
    }

    const trackId =
      playlist[
        this.currentTrackIndex
      ];

    const track =
      this.options.data.tracks[
        trackId
      ];

    if (track === undefined) {
      this.options.music.stop();
      return;
    }

    const shouldCycle =
      this.currentCycle &&
      playlist.length > 1;

    this.options.music.play(
      this.options.resolveAssetUrl(
        track.src,
      ),
      {
        loop: !shouldCycle,
        volume:
          track.volume ?? 0.35,
        onEnded:
          shouldCycle
            ? this.nextTrack
            : undefined,
      },
    );
  }
}
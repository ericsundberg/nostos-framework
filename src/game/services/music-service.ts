export interface MusicPlaybackOptions {
  volume?: number;
  loop?: boolean;
  onEnded?: () => void;
}

export class MusicService {
  private current:
    HTMLAudioElement | null = null;

  private unlockListenersAttached = false;

  public play(
    url: string,
    options: MusicPlaybackOptions = {},
  ): void {
    const volume =
      options.volume ?? 0.35;

    const loop =
      options.loop ?? true;

    if (this.current?.src === url) {
      this.current.volume = volume;
      this.current.loop = loop;
      this.current.onended =
        options.onEnded ?? null;

      void this.current.play().catch(
        (error: unknown) => {
          this.handlePlaybackFailure(
            error,
          );
        },
      );

      return;
    }

    this.stop();

    const audio = new Audio(url);

    audio.loop = loop;
    audio.volume = volume;
    audio.onended =
      options.onEnded ?? null;

    this.current = audio;

    void audio.play().catch(
      (error: unknown) => {
        this.handlePlaybackFailure(
          error,
        );
      },
    );
  }

  public playLoop(
    url: string,
    volume = 0.35,
  ): void {
    this.play(
      url,
      {
        volume,
        loop: true,
      },
    );
  }

  public stop(): void {
    this.detachUnlockListeners();

    if (this.current === null) {
      return;
    }

    this.current.onended = null;
    this.current.pause();
    this.current.currentTime = 0;
    this.current = null;
  }

  public destroy(): void {
    this.stop();
  }

  private handlePlaybackFailure(
    error: unknown,
  ): void {
    console.warn(
      'Music playback was blocked or failed:',
      error,
    );

    this.attachUnlockListeners();
  }

  private attachUnlockListeners():
    void {
    if (this.unlockListenersAttached) {
      return;
    }

    this.unlockListenersAttached = true;

    window.addEventListener(
      'keydown',
      this.handleUnlockInput,
      {
        once: true,
      },
    );

    window.addEventListener(
      'pointerdown',
      this.handleUnlockInput,
      {
        once: true,
      },
    );
  }

  private detachUnlockListeners():
    void {
    if (!this.unlockListenersAttached) {
      return;
    }

    this.unlockListenersAttached = false;

    window.removeEventListener(
      'keydown',
      this.handleUnlockInput,
    );

    window.removeEventListener(
      'pointerdown',
      this.handleUnlockInput,
    );
  }

  private readonly handleUnlockInput =
    (): void => {
      this.detachUnlockListeners();

      if (this.current === null) {
        return;
      }

      void this.current.play().catch(
        (error: unknown) => {
          this.handlePlaybackFailure(
            error,
          );
        },
      );
    };
}
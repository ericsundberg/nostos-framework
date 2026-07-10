export class MusicService {
  private current:
    HTMLAudioElement | null = null;

  private unlockListenersAttached = false;

  public playLoop(
    url: string,
    volume = 0.35,
  ): void {
    if (this.current?.src === url) {
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

    audio.loop = true;
    audio.volume = volume;

    this.current = audio;

    void audio.play().catch(
      (error: unknown) => {
        this.handlePlaybackFailure(
          error,
        );
      },
    );
  }

  public stop(): void {
    this.detachUnlockListeners();

    if (this.current === null) {
      return;
    }

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
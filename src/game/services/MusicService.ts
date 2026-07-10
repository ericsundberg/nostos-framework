export class MusicService {
  private current:
    HTMLAudioElement | null = null;

  public playLoop(
    url: string,
    volume = 0.35,
  ): void {
    if (this.current?.src === url) {
      return;
    }

    this.stop();

    const audio = new Audio(url);

    audio.loop = true;
    audio.volume = volume;

    this.current = audio;

    void audio.play().catch(
      (error: unknown) => {
        console.warn(
          'Music playback was blocked or failed:',
          error,
        );
      },
    );
  }

  public stop(): void {
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
}

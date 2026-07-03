export interface GamePlatform {
  assets: {
    url: (relativePath: string) => string;
  };

  settings: {
    load: () => Promise<unknown>;

    save: (
      settings: Record<string, unknown>,
    ) => Promise<void>;
  };
}

declare global {
  interface Window {
    gamePlatform: GamePlatform;
  }
}

export {};
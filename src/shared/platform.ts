export interface GamePlatform {
  assets: {
    url: (relativePath: string) => string;
  };

  config: {
    load: (
      filename: string,
    ) => Promise<unknown>;
  };

  settings: {
    load: () => Promise<unknown>;

    save: (
      settings: Record<string, unknown>,
    ) => Promise<void>;
  };

  app: {
    quit: () => Promise<void>;
  };
}

declare global {
  interface Window {
    gamePlatform: GamePlatform;
  }
}

export {};
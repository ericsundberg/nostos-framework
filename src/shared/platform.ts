export interface GamePlatform {
  assets: {
    url: (relativePath: string) => string;
  };
}

declare global {
  interface Window {
    gamePlatform: GamePlatform;
  }
}

export {};

declare global {
  interface FBInstantPlayer {
    getID(): string;
    getName(): string;
    getPhoto(): string;
  }

  interface FBInstantAPI {
    initializeAsync(): Promise<void>;
    setLoadingProgress(progress: number): void;
    startGameAsync(): Promise<void>;
    getLocale(): string;
    getPlatform(): string;
    getSDKVersion(): string;
    player: FBInstantPlayer;
  }

  const FBInstant: FBInstantAPI;
}

export interface PlatformPlayer {
  id: string;
  name: string;
  photo?: string;
}

declare global {
  interface FBInstantPlayer {
    getID(): string;
    getASIDAsync?(): Promise<string>;
    getAssociatedAppsASIDAsync?(): Promise<string>;
    getSignedAssociatedAppsASIDAsync?(): Promise<string>;
    getAgeCategoryAsync?(): Promise<string>;
    getSignedASIDAsync?(): Promise<string>;
    getSignedPlayerInfoAsync(
      nonce?: string,
    ): Promise<{
      getPlayerId(): string;
      getSignature(): string;
    }>;
    canSubscribeBotAsync?(): Promise<boolean>;
    isSubscribedToBotAsync?(): Promise<boolean>;
    subscribeBotAsync?(): Promise<void>;
  }

  interface FBInstantOverlayView {
    showAsync(): Promise<void>;
    hideAsync?(): Promise<void>;
    destroyAsync?(): Promise<void>;
  }

  interface FBInstantOverlayViews {
    createOverlayViewAsync(
      url: string,
      container: HTMLElement,
      style?: string,
      stylesheet?: string,
    ): Promise<FBInstantOverlayView>;
  }

  interface FBInstantAPI {
    initializeAsync(): Promise<void>;
    setLoadingProgress(progress: number): void;
    startGameAsync(): Promise<void>;
    getLocale(): string;
    getPlatform(): string;
    getSDKVersion(): string;
    player: FBInstantPlayer;
    overlayViews: FBInstantOverlayViews;
  }

  const FBInstant: FBInstantAPI;
}

export interface PlatformPlayer {
  id: string;
  name: string;
  photo?: string;
}

export {};

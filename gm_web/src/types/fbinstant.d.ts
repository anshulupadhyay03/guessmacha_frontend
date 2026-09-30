declare global {
  interface FBInstantPlayer {
    getID(): string;
    getName?(): string;
    getPhoto?(): string;
    getDataAsync?(keys?: string[]): Promise<Record<string, unknown>>;
    setDataAsync?(data: Record<string, unknown>): Promise<void>;
    getConnectedPlayersAsync?(): Promise<unknown[]>;
    getASIDAsync?(): Promise<string>;
    getAssociatedAppsASIDAsync?(): Promise<string>;
    getSignedAssociatedAppsASIDAsync?(): Promise<string>;
    getAgeCategoryAsync?(): Promise<string>;
    getSignedASIDAsync?(): Promise<string>;
    getSignedPlayerInfoAsync(
      nonce?: string,
    ): Promise<{
      getPlayerID(): string;
      getPlayerId?(): string;
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
      initialData?: Record<string, unknown>,
    ): Promise<FBInstantOverlayView>;
  }

  interface FBInstantContext {
    getID(): string | null;
    getType(): string;
  }

  interface FBInstantAPI {
    initializeAsync(): Promise<void>;
    setLoadingProgress(progress: number): void;
    startGameAsync(): Promise<void>;
    getLocale(): string;
    getPlatform(): string;
    getSDKVersion(): string;
    player: FBInstantPlayer;
    context?: FBInstantContext;
    overlayViews?: FBInstantOverlayViews;
    quit?(): void;
  }

  const FBInstant: FBInstantAPI;

  interface Window {
    FBInstant?: FBInstantAPI;
  }
}

export interface PlatformPlayer {
  id: string;
  name: string;
  photo?: string;
}

export {};

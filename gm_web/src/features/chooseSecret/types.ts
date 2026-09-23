export interface PuzzleItem {
  id: string;
  name: string;
}

export interface CategoryDetails {
  id: string;
  name: string;
  iconKey?: string;
}

export interface GetPuzzlesRequest {
  categoryId: string;
}

export interface GetPuzzlesResponse {
  success: boolean;
  data?: {
    category: CategoryDetails;
    puzzles: PuzzleItem[];
  };
  message?: string;
}

export interface SubmitSecretRequest {
  gameId: string;
  secretPuzzleId: string;
}

export interface SubmitSecretResult {
  gameStatus: string;
  waitingForOpponent: boolean;
}

export interface SubmitSecretResponse {
  success: boolean;
  data?: SubmitSecretResult;
  message?: string;
}


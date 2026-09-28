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

export interface GetPuzzlesData {
  category: CategoryDetails;
  puzzles: PuzzleItem[];
}

export interface GetPuzzlesResponse {
  success: boolean;
  data?: GetPuzzlesData;
  message?: string;
}


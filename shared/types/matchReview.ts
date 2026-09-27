export interface ReviewPlayer {
  playerId: string;
  playerName: string;
  playerImageUrl: string | null;
}

export interface ReviewQuestionItem {
  id: string;
  questionNumber: number;
  questionText: string;
  answerText: string | null;
  askedBy: ReviewPlayer;
  answeredBy: ReviewPlayer | null;
  createdAt: string;
}

export interface MatchReviewData {
  gameId: string;
  questions: ReviewQuestionItem[];
}

export interface GetQuestionsResponse {
  success: boolean;
  data: MatchReviewData;
  message?: string;
}


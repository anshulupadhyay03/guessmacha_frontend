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

export interface MatchReviewPlayer {
  playerId: string;
  playerName: string;
  playerImageUrl?: string | null;
  secret?: string | null;
  questionsAsked?: number;
}

export interface MatchReviewSummary {
  player: MatchReviewPlayer;
  opponent: MatchReviewPlayer;
  result?: string | null;
  status: string;
  winnerId?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  categoryId?: string;
  categoryName?: string;
  questionCount: number;
  durationSeconds: number;
  playerQuestionCount: number;
  opponentQuestionCount: number;
}

export interface MatchReviewData {
  gameId: string;
  match?: MatchReviewSummary | null;
  questions: ReviewQuestionItem[];
}

export interface GetQuestionsResponse {
  success: boolean;
  data: MatchReviewData;
  message?: string;
}


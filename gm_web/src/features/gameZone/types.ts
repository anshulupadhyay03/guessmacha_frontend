export interface GameStatePlayer {
  playerId: string;
  playerName: string;
  playerImageUrl?: string | null;
  questionsAsked: number;
  secret: string | null;
  finalGuessUsed: boolean;
  isCompleted: boolean;
  isMyTurn: boolean;
  isBonusTurn: boolean;
}

export interface GameStateQuestion {
  id: string;
  questionText: string;
  askedByPlayerId: string;
  answeredByPlayerId?: string | null;
  answerText?: string | null;
}

export interface GameStateData {
  gameId: string;
  status: string;
  questionLimit: number;
  currentPlayerId: string;
  players: {
    me: GameStatePlayer;
    opponent: GameStatePlayer;
  };
  question?: GameStateQuestion | null;
  questions?: GameStateQuestion[];
  gameResult?: string | null;
  endReason?: string | null;
  endedByPlayerId?: string | null;
}

export interface GetGameStateResponse {
  success: boolean;
  data?: GameStateData;
  message?: string;
}

export interface AskQuestionRequest {
  gameId: string;
  questionText: string;
  clientRequestId: string;
}

export interface AskQuestionResponse {
  success: boolean;
  data?: {
    question_id?: string;
    questionId?: string;
    game_id?: string;
    gameId?: string;
    question_text?: string;
    questionText?: string;
    asked_by_player_id?: string;
    askedByPlayerId?: string;
    answered_by_player_id?: string;
    answeredByPlayerId?: string;
  };
  message?: string;
}

export interface AnswerQuestionRequest {
  gameId: string;
  answerText: string;
  clientRequestId: string;
}

export interface AnswerQuestionResponse {
  success: boolean;
  data?: {
    questionId?: string;
    gameId?: string;
    questionText?: string;
    answerText?: string;
    askedByPlayerId?: string;
    answeredByPlayerId?: string;
  };
  message?: string;
}

export interface GuessSecretRequest {
  gameId: string;
  guessedPuzzleId: string;
  clientRequestId?: string;
}

export interface GuessSecretData {
  is_correct: boolean;
  winner_id?: string | null;
  game_status?: string;
  current_turn_player_id?: string | null;
  bonus_turn_player_id?: string | null;
  is_bonus_turn_active?: boolean;
  bonus_turn_consumed?: boolean;
}

export interface GuessSecretResponse {
  success: boolean;
  data?: GuessSecretData;
  message?: string;
}

export interface LeaveGameRequest {
  gameId: string;
  clientRequestId: string;
}

export interface LeaveGameResponse {
  success: boolean;
  message?: string;
}


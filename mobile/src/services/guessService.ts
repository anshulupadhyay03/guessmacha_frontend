import { supabase } from '../api/supabaseClient';

export interface GuessResult {
  correct: boolean;
  matchEnded: boolean;
}

export const guessService = {
  /**
   * Server-side evaluation only — the client never receives the opponent's
   * raw secret. See the frontend spec's flagged item on Guess Flow.
   */
  async submitGuess(matchId: string, guessedObject: string): Promise<GuessResult> {
    const { data, error } = await supabase.rpc('submit_guess', {
      match_id: matchId,
      guessed_object: guessedObject,
    });
    if (error) throw error;
    return data as GuessResult;
  },
};

export default guessService;
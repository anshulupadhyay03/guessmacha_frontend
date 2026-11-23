import { createApiClient } from '../api/client';
import type { Category, Dashboard, GameDetails, GameRef, GameState, HistoryMatch, Match, ProfileData, Puzzle, Question, Review } from '../types/domain';
import { config, functionsUrl } from './config';
import { accessToken, supabase } from './auth';

const api = createApiClient(functionsUrl, config.supabaseAnonKey, accessToken);
const unwrap = <T,>(value: T | { data: T }): T => (value && typeof value === 'object' && 'data' in value ? (value as { data: T }).data : value as T);
export const gameApi = {
  async categories(): Promise<Category[]> { if (!supabase) throw new Error('Supabase is not configured.'); const { data, error } = await supabase.from('categories').select('id,name,description,icon_key').eq('is_active', true).order('created_at', { ascending: true }); if (error) throw error; return (data ?? []).map(x => ({ id: x.id, name: x.name, description: x.description, iconKey: x.icon_key })); },
  createGame: async (categoryId: string, questionLimit: number) => unwrap<GameRef>(await api.post('create_game', { categoryId, questionLimit })),
  joinGame: async (roomCode: string) => unwrap<GameRef>(await api.post('join_game', { roomCode: roomCode.trim().toUpperCase() })),
  getGame: async (gameId: string) => unwrap<GameDetails>(await api.get('get_game', { gameId })),
  puzzles: async (gameId?: string, categoryId?: string) => unwrap<{ category: { id: string; name: string }; puzzles: Puzzle[] }>(await api.get('get_puzzles', gameId ? { gameId } : { categoryId })),
  submitSecret: async (gameId: string, secretPuzzleId: string) => unwrap<{ gameStatus: string; waitingForOpponent: boolean }>(await api.post('submit_secret', { gameId, secretPuzzleId })),
  matches: async () => unwrap<{ activeMatches: Match[]; expiredMatches: Match[] }>(await api.get('get_matches')),
  dashboard: async () => unwrap<Dashboard>(await api.get('dashboard')),
  profile: async () => unwrap<ProfileData>(await api.get('get_profile')),
  history: async (filter = 'all', cursor?: string | null) => unwrap<{ matches: HistoryMatch[]; hasMore: boolean; nextCursor: string | null }>(await api.get('history', { filter, limit: 20, cursor: cursor ?? undefined })),
  state: async (gameId: string) => unwrap<GameState>(await api.get('game_state', { gameId })),
  review: async (gameId: string) => unwrap<Review>(await api.get('match_review', { gameId })),
  ask: (gameId: string, questionText: string, clientRequestId: string) => api.post('ask_question', { gameId, questionText: questionText.trim(), clientRequestId }),
  answer: (gameId: string, answerText: string, clientRequestId: string) => api.post('answer_question', { gameId, answerText: answerText.trim(), clientRequestId }),
  guess: async (gameId: string, guessedPuzzleId: string, clientRequestId: string) => unwrap<{ is_correct: boolean }>(await api.post('guess_secret', { gameId, guessedPuzzleId, clientRequestId })),
  leave: (gameId: string, clientRequestId: string) => api.post('leave_game', { gameId, clientRequestId }),
};
export const requestId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

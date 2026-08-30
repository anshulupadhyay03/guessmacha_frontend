import { createApiClient } from '../../../../shared/api/client';
import { createGameRepository } from '../../../../shared/repositories/gameRepository';
import { createGameService } from '../../../../shared/services/gameService';
import { authProvider } from '../supabase/authProvider';

const apiClient = createApiClient(authProvider);
const gameRepository = createGameRepository(apiClient);

export const gameService = createGameService(gameRepository);

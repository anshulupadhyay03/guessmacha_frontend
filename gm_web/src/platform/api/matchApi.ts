import { apiClient } from './gameApi';
import { createMatchRepository } from '../../../../shared/repositories/matchRepository';
import { createMatchService } from '../../../../shared/services/matchService';

const matchRepository = createMatchRepository(apiClient);
export const matchService = createMatchService(matchRepository);


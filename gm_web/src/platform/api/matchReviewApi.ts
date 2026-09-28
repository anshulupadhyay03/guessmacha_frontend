import { apiClient } from './gameApi';
import { createMatchReviewRepository } from '../../../../shared/repositories/matchReviewRepository';
import { createMatchReviewService } from '../../../../shared/services/matchReviewService';

const matchReviewRepository = createMatchReviewRepository(apiClient);
export const matchReviewService = createMatchReviewService(matchReviewRepository);


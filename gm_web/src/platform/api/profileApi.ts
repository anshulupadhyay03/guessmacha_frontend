import { apiClient } from './gameApi';
import { createProfileRepository } from '../../../../shared/repositories/profileRepository';
import { createProfileService } from '../../../../shared/services/profileService';

export * from '../../../../shared/types/profile';

const profileRepository = createProfileRepository(apiClient);
export const profileService = createProfileService(profileRepository);

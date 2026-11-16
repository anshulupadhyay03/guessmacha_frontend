import type { ProfileRepository } from '../repositories/profileRepository';
import type { ProfileData } from '../types/profile';

export interface ProfileService {
  getProfile(): Promise<ProfileData>;
}

export function createProfileService(
  profileRepository: ProfileRepository,
): ProfileService {
  return {
    async getProfile(): Promise<ProfileData> {
      return profileRepository.getProfile();
    },
  };
}

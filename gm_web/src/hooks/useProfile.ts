import { useCallback, useEffect, useState } from 'react';
import type { ProfileData } from '../platform/api/profileApi';
import { profileService } from '../platform/api/profileApi';

export function useProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await profileService.getProfile();
      setData(profileData);
      setError(null);
    } catch (err) {
      const formattedError =
        err instanceof Error
          ? err
          : new Error(
              typeof err === 'string' && err.trim()
                ? err
                : 'Unable to connect to profile service. Please check your network and try again.',
            );
      setError(formattedError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchProfile);
  }, [fetchProfile]);

  return {
    data,
    loading,
    error,
    refresh: fetchProfile,
  };
}

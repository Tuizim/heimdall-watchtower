import { useQuery } from '@tanstack/react-query';
import { profiles as profilesApi } from '../lib/api';

const PROFILES_KEY = ['profiles'] as const;

export function useProfiles() {
  return useQuery({
    queryKey: PROFILES_KEY,
    queryFn: () => profilesApi.list(),
  });
}

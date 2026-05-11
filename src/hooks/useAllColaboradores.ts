import { useContext, useMemo } from 'react';
import { AuthContext } from '../App';
import { useProfiles } from './useProfiles';
import type { Profile } from '../lib/api';

/** Mescla a lista de perfis com o perfil logado, sem duplicatas. */
export function useAllColaboradores(): Profile[] {
  const { profile } = useContext(AuthContext);
  const { data: colaboradores = [] } = useProfiles();

  return useMemo(() => {
    const map = new Map(colaboradores.map(c => [c.id, c]));
    if (profile) map.set(profile.id, profile as Profile);
    return Array.from(map.values());
  }, [colaboradores, profile]);
}

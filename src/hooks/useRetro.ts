import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retro as retroApi, type RetroCardInput } from '../lib/api';

const RETRO_KEY = ['retro'] as const;

export function useRetroCards() {
  return useQuery({
    queryKey: RETRO_KEY,
    queryFn: () => retroApi.list(),
  });
}

export function useCreateRetroCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RetroCardInput) => retroApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RETRO_KEY }),
  });
}

export function useDeleteRetroCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retroApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RETRO_KEY }),
  });
}

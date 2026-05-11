import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branches as branchesApi, type BranchInput } from '../lib/api';

const BRANCHES_KEY = ['branches'] as const;

export function useBranches() {
  return useQuery({
    queryKey: BRANCHES_KEY,
    queryFn: () => branchesApi.list(),
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchInput) => branchesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BRANCHES_KEY }),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BranchInput> }) =>
      branchesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BRANCHES_KEY }),
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BRANCHES_KEY }),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admin as adminApi, type CreateUserInput } from '../lib/api';

const ADMIN_USERS_KEY = ['admin', 'users'] as const;

export function useAdminUsers() {
  return useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: () => adminApi.listUsers(),
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => adminApi.createUser(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserInput> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

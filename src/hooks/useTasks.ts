import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasks as tasksApi, type TaskInput } from '../lib/api';

const TASKS_KEY = ['tasks'] as const;

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: () => tasksApi.list(),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskInput) => tasksApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskInput> }) =>
      tasksApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteAllTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => tasksApi.deleteAll(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

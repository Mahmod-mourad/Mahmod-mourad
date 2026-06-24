import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { ApplicationResponseDto, CreateApplicationDto, UpdateApplicationStatusDto, ApplicationStatus } from '@nexahire/types';

export function useApplications() {
  const queryClient = useQueryClient();

  const listQuery = useInfiniteQuery({
    queryKey: ['applications'],
    queryFn: ({ pageParam }) => api.applications.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });

  const statsQuery = useQuery({
    queryKey: ['applications', 'stats'],
    queryFn: () => api.applications.stats(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateApplicationDto) => api.applications.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateApplicationStatusDto }) => api.applications.updateStatus(id, dto),
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      await queryClient.cancelQueries({ queryKey: ['applications', 'stats'] });

      // Snapshot the previous value
      const previousApps = queryClient.getQueryData(['applications']);
      const previousStats = queryClient.getQueryData(['applications', 'stats']);

      // Optimistically update applications list
      queryClient.setQueryData(['applications'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((app: ApplicationResponseDto) =>
              app.id === id ? { ...app, status: dto.status } : app
            ),
          })),
        };
      });

      return { previousApps, previousStats };
    },
    onError: (err, variables, context) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['applications'], context.previousApps);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(['applications', 'stats'], context.previousStats);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  return {
    list: listQuery,
    stats: statsQuery,
    create: createMutation,
    updateStatus: updateStatusMutation,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { CreateCvVersionDto, UpdateCvVersionDto } from '@nexahire/types';

export function useCvVersions() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['cvVersions'],
    queryFn: () => api.cvVersions.list(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateCvVersionDto) => api.cvVersions.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cvVersions'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCvVersionDto }) => api.cvVersions.update(id, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cvVersions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.cvVersions.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cvVersions'] }),
  });

  return {
    list: listQuery,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { AtsRequestDto } from '@nexahire/types';

export function useAtsJob(jobId: string | null) {
  return useQuery({
    queryKey: ['atsJob', jobId],
    queryFn: () => api.ats.jobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling if completed or failed
      if (status === 'completed' || status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
}

export function useAts() {
  const scoreMutation = useMutation({
    mutationFn: (dto: AtsRequestDto) => api.ats.score(dto),
  });

  const tailorMutation = useMutation({
    mutationFn: (dto: AtsRequestDto) => api.ats.tailor(dto),
  });

  return {
    score: scoreMutation,
    tailor: tailorMutation,
  };
}

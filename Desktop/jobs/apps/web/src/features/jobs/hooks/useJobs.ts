import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export function useJobs(filters: { remote?: boolean; visaTag?: string }) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.jobs.list(filters),
  });
}

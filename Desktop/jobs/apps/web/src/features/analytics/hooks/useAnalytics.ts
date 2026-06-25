import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { AnalyticsDashboardResponse } from '@nexahire/types';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics');
      return res.data as AnalyticsDashboardResponse;
    },
  });
}

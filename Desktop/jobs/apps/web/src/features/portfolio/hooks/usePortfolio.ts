import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { PortfolioUpdateDto } from '@nexahire/types';

export function useUpdatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PortfolioUpdateDto) => {
      const res = await api.post('/portfolio/settings', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth-me'] }); // Ensure auth user state is updated
    }
  });
}

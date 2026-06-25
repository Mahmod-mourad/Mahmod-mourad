import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { NegotiationRequestDto, NegotiationResponse } from '@nexahire/types';

export function useSimulateNegotiation() {
  return useMutation({
    mutationFn: async (data: NegotiationRequestDto) => {
      const res = await api.post('/negotiation/simulate', data);
      return res.data as NegotiationResponse;
    },
  });
}

export function useNetPay(gross: string, country: 'NL' | 'DE' | 'GULF', ruling: boolean = false) {
  return useQuery({
    queryKey: ['net-pay', gross, country, ruling],
    queryFn: async () => {
      if (!gross || isNaN(parseFloat(gross))) return null;
      const res = await api.get('/negotiation/net-pay', {
        params: { gross, country, ruling: ruling ? 'true' : 'false' }
      });
      return res.data as { gross: number; net: number; country: string };
    },
    enabled: !!gross && !isNaN(parseFloat(gross)),
  });
}

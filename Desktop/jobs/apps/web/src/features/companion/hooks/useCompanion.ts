import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { PushSubscriptionDto } from '@nexahire/types';

export function useVapidPublicKey() {
  return useQuery({
    queryKey: ['vapidPublicKey'],
    queryFn: async () => {
      const res = await api.get('/companion/vapid-public-key');
      return (res.data as { publicKey: string }).publicKey;
    },
  });
}

export function useSubscribeToPush() {
  return useMutation({
    mutationFn: async (subscription: PushSubscriptionDto) => {
      const res = await api.post('/companion/push-subscribe', subscription);
      return res.data;
    },
  });
}

export function useDailyFocus() {
  return useQuery({
    queryKey: ['dailyFocus'],
    queryFn: async () => {
      const res = await api.get('/companion/daily-focus');
      return res.data as { tasks: string[]; streak: number };
    },
  });
}

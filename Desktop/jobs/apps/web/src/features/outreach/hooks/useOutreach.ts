import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { GenerateOutreachDto, CreateSnippetDto, Snippet, OutreachMessage } from '@nexahire/types';

export function useSnippets() {
  return useQuery({
    queryKey: ['snippets'],
    queryFn: async () => {
      const res = await api.get('/outreach/snippets');
      return res.data as Snippet[];
    },
  });
}

export function useCreateSnippet() {
  return useMutation({
    mutationFn: async (data: CreateSnippetDto) => {
      const res = await api.post('/outreach/snippets', data);
      return res.data as Snippet;
    },
  });
}

export function useGenerateOutreach() {
  return useMutation({
    mutationFn: async (data: GenerateOutreachDto) => {
      const res = await api.post('/outreach/generate', data);
      return res.data as OutreachMessage;
    },
  });
}

export function useApplicationMessages(applicationId: string | null) {
  return useQuery({
    queryKey: ['outreach-messages', applicationId],
    queryFn: async () => {
      if (!applicationId) return [];
      const res = await api.get(`/outreach/applications/${applicationId}/messages`);
      return res.data as OutreachMessage[];
    },
    enabled: !!applicationId,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import type { CreateStarStoryDto, StarStory, CreateInterviewLogDto, InterviewLog, MockInterviewRequestDto } from '@nexahire/types';

export function useStarStories() {
  return useQuery({
    queryKey: ['star-stories'],
    queryFn: async () => {
      const res = await api.get('/prep/star');
      return res.data as StarStory[];
    },
  });
}

export function useCreateStarStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStarStoryDto) => {
      const res = await api.post('/prep/star', data);
      return res.data as StarStory;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['star-stories'] });
    }
  });
}

export function useSimulateMockInterview() {
  return useMutation({
    mutationFn: async (data: MockInterviewRequestDto) => {
      const res = await api.post('/prep/mock', data);
      return res.data as { interviewerMessage: string; coachingNote: string };
    },
  });
}

export function useInterviewLogs(applicationId: string) {
  return useQuery({
    queryKey: ['interview-logs', applicationId],
    queryFn: async () => {
      const res = await api.get(`/prep/logs/${applicationId}`);
      return res.data as InterviewLog[];
    },
    enabled: !!applicationId,
  });
}

export function useLogInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInterviewLogDto) => {
      const res = await api.post('/prep/logs', data);
      return res.data as InterviewLog;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['interview-logs', variables.applicationId] });
    }
  });
}

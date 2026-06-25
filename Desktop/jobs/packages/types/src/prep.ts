import { z } from 'zod';
import { NegotiationTurnSchema } from './negotiation';

export const StarStorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1),
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
  skills: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StarStory = z.infer<typeof StarStorySchema>;

export const CreateStarStoryDtoSchema = StarStorySchema.pick({
  title: true,
  situation: true,
  task: true,
  action: true,
  result: true,
  skills: true,
});

export type CreateStarStoryDto = z.infer<typeof CreateStarStoryDtoSchema>;

export const InterviewLogSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  date: z.date(),
  type: z.string(),
  notes: z.string().nullable(),
  debrief: z.string().nullable(),
  rating: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InterviewLog = z.infer<typeof InterviewLogSchema>;

export const CreateInterviewLogDtoSchema = z.object({
  applicationId: z.string().uuid(),
  date: z.string().transform(str => new Date(str)),
  type: z.string(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type CreateInterviewLogDto = z.infer<typeof CreateInterviewLogDtoSchema>;

export const MockInterviewRequestDtoSchema = z.object({
  history: z.array(NegotiationTurnSchema),
  role: z.string(),
  questionType: z.enum(['behavioral', 'technical', 'system_design']),
});

export type MockInterviewRequestDto = z.infer<typeof MockInterviewRequestDtoSchema>;

export const DebriefResponseSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvements: z.array(z.string()),
  summary: z.string(),
});

export type DebriefResponse = z.infer<typeof DebriefResponseSchema>;

export const PortfolioUpdateDtoSchema = z.object({
  portfolioSlug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  isPortfolioPublic: z.boolean().optional(),
});

export type PortfolioUpdateDto = z.infer<typeof PortfolioUpdateDtoSchema>;

import { z } from 'zod';

export const AtsScoreResultSchema = z.object({
  score: z.number().min(0).max(100),
  missingKeywords: z.array(z.string()),
});
export type AtsScoreResult = z.infer<typeof AtsScoreResultSchema>;

export const TailorCvResultSchema = z.object({
  tailoredBullets: z.array(z.string()),
});
export type TailorCvResult = z.infer<typeof TailorCvResultSchema>;

// Shared ATS Request DTO
export const AtsRequestSchema = z.object({
  cvVersionId: z.string().uuid(),
  jobDescription: z.string().min(10),
});
export type AtsRequestDto = z.infer<typeof AtsRequestSchema>;

export const AtsJobResponseSchema = z.object({
  jobId: z.string(),
});
export type AtsJobResponseDto = z.infer<typeof AtsJobResponseSchema>;

export const AtsJobResultSchema = z.object({
  score: z.number().optional(),
  missingKeywords: z.array(z.string()).optional(),
  tailoredBullets: z.array(z.string()).optional(),
});
export type AtsJobResult = z.infer<typeof AtsJobResultSchema>;

export const AtsJobStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.number().optional(),
  result: AtsJobResultSchema.optional(),
  error: z.string().optional(),
});
export type AtsJobStatusDto = z.infer<typeof AtsJobStatusSchema>;

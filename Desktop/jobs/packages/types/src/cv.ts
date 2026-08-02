import { z } from 'zod';

export const CreateCvVersionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
});
export type CreateCvVersionDto = z.infer<typeof CreateCvVersionSchema>;

export const UpdateCvVersionSchema = CreateCvVersionSchema.partial();
export type UpdateCvVersionDto = z.infer<typeof UpdateCvVersionSchema>;

export const CvVersionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  createdAt: z.union([z.string().datetime(), z.date()]),
  updatedAt: z.union([z.string().datetime(), z.date()]),
});
export type CvVersionResponseDto = z.infer<typeof CvVersionResponseSchema>;

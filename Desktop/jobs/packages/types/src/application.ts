import { z } from 'zod';

export const ApplicationStatusEnum = z.enum([
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
]);

export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;

export const CreateApplicationSchema = z.object({
  company: z.string().trim().min(1, 'Company name is required'),
  role: z.string().trim().min(1, 'Role is required'),
  location: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  source: z.string().optional(),
  notes: z.string().optional(),
  status: ApplicationStatusEnum.default('applied'),
});

export type CreateApplicationDto = z.infer<typeof CreateApplicationSchema>;

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusEnum,
});

export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusSchema>;

export interface ApplicationResponseDto {
  id: string;
  userId: string;
  company: string;
  role: string;
  location: string | null;
  url: string | null;
  source: string | null;
  notes: string | null;
  status: ApplicationStatus;
  atsScore: number | null;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedApplications {
  data: ApplicationResponseDto[];
  nextCursor?: string | null;
}

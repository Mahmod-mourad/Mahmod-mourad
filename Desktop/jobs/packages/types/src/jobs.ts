import { z } from 'zod';

export const JobQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
});
export type JobQuery = z.infer<typeof JobQuerySchema>;

// Internal shapes for Adapters
export type RawJob = Record<string, any>;

export interface NormalizedJob {
  source: string;
  externalId: string;
  dedupeHash: string;
  title: string;
  companyName: string;
  location: string | null;
  remote: boolean;
  applyUrl: string;
  postedAt: Date;
  visaTags: string[];
  raw: RawJob;
}

// API Responses
export const CompanyResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});
export type CompanyResponseDto = z.infer<typeof CompanyResponseSchema>;

export const JobResponseSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  company: CompanyResponseSchema.optional(),
  source: z.string(),
  externalId: z.string(),
  dedupeHash: z.string(),
  title: z.string(),
  location: z.string().nullable(),
  remote: z.boolean(),
  applyUrl: z.string(),
  postedAt: z.union([z.string().datetime(), z.date()]),
  visaTags: z.array(z.string()),
  createdAt: z.union([z.string().datetime(), z.date()]),
});
export type JobResponseDto = z.infer<typeof JobResponseSchema>;

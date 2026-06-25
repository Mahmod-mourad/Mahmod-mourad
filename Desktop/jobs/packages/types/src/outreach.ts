import { z } from 'zod';

export const SnippetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Snippet = z.infer<typeof SnippetSchema>;

export const CreateSnippetDtoSchema = SnippetSchema.pick({
  name: true,
  content: true,
});

export type CreateSnippetDto = z.infer<typeof CreateSnippetDtoSchema>;

export const OutreachMessageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  applicationId: z.string().uuid().nullable(),
  type: z.enum(['email', 'linkedin']),
  content: z.string(),
  status: z.enum(['draft', 'sent']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OutreachMessage = z.infer<typeof OutreachMessageSchema>;

export const GenerateOutreachDtoSchema = z.object({
  applicationId: z.string().uuid().optional(),
  companyName: z.string().min(1),
  role: z.string().min(1),
  targetName: z.string().optional(),
  type: z.enum(['email', 'linkedin']).default('linkedin'),
  snippetIds: z.array(z.string().uuid()).optional(),
  customNote: z.string().optional(),
});

export type GenerateOutreachDto = z.infer<typeof GenerateOutreachDtoSchema>;

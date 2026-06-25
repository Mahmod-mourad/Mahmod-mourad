import { z } from 'zod';

export const NegotiationTurnSchema = z.object({
  role: z.enum(['user', 'recruiter']),
  message: z.string(),
});

export type NegotiationTurn = z.infer<typeof NegotiationTurnSchema>;

export const NegotiationRequestDtoSchema = z.object({
  history: z.array(NegotiationTurnSchema),
  companyName: z.string(),
  role: z.string(),
  userCurrentSalary: z.number().optional(),
  userTargetSalary: z.number(),
  recruiterInitialOffer: z.number(),
});

export type NegotiationRequestDto = z.infer<typeof NegotiationRequestDtoSchema>;

export const NegotiationResponseSchema = z.object({
  recruiterMessage: z.string(),
  coachingNote: z.string(),
});

export type NegotiationResponse = z.infer<typeof NegotiationResponseSchema>;

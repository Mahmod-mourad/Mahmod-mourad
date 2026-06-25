import { z } from 'zod';

export const PushSubscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
export type PushSubscriptionDto = z.infer<typeof PushSubscriptionSchema>;

export const DailyFocusSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.union([z.string().datetime(), z.date()]),
  tasks: z.array(z.string()),
  streak: z.number(),
});
export type DailyFocusDto = z.infer<typeof DailyFocusSchema>;

export const FollowUpStatusSchema = z.enum(['pending', 'drafted', 'sent', 'dismissed']);
export type FollowUpStatus = z.infer<typeof FollowUpStatusSchema>;

export const FollowUpSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  scheduledDate: z.union([z.string().datetime(), z.date()]),
  status: FollowUpStatusSchema,
  draftedMessage: z.string().nullable(),
});
export type FollowUpDto = z.infer<typeof FollowUpSchema>;

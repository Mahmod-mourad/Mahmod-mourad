import { z } from 'zod';

export const AnalyticsConversionSchema = z.object({
  category: z.string(), // e.g., 'cv-v1', 'LinkedIn', 'Email'
  totalApplications: z.number(),
  interviews: z.number(),
  offers: z.number(),
  conversionRate: z.number(), // (interviews / total) * 100
});

export type AnalyticsConversion = z.infer<typeof AnalyticsConversionSchema>;

export const AnalyticsDashboardResponseSchema = z.object({
  byCvVersion: z.array(AnalyticsConversionSchema),
  bySource: z.array(AnalyticsConversionSchema),
  overallConversionRate: z.number(),
});

export type AnalyticsDashboardResponse = z.infer<typeof AnalyticsDashboardResponseSchema>;

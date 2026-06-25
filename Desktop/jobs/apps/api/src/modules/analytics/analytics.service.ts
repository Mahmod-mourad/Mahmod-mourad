import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AnalyticsDashboardResponse } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../core/result';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string): Promise<Result<AnalyticsDashboardResponse, AppError>> {
    try {
      const applications = await this.prisma.application.findMany({
        where: { userId },
        include: { cvVersion: true },
      });

      if (applications.length === 0) {
        return ok({
          byCvVersion: [],
          bySource: [],
          overallConversionRate: 0,
        });
      }

      // Helper to determine if app reached interview stage
      const hasInterviewed = (status: string) => ['interview', 'offer'].includes(status);

      const byCvMap = new Map<string, { total: number; interviews: number; offers: number }>();
      const bySourceMap = new Map<string, { total: number; interviews: number; offers: number }>();

      let totalInterviews = 0;

      for (const app of applications) {
        const cvName = app.cvVersion?.title || 'No CV Version';
        const sourceName = app.source || 'Direct/Unknown';
        const isInterview = hasInterviewed(app.status);
        const isOffer = app.status === 'offer';

        if (isInterview) totalInterviews++;

        // Track by CV
        const cvStats = byCvMap.get(cvName) || { total: 0, interviews: 0, offers: 0 };
        cvStats.total++;
        if (isInterview) cvStats.interviews++;
        if (isOffer) cvStats.offers++;
        byCvMap.set(cvName, cvStats);

        // Track by Source
        const sourceStats = bySourceMap.get(sourceName) || { total: 0, interviews: 0, offers: 0 };
        sourceStats.total++;
        if (isInterview) sourceStats.interviews++;
        if (isOffer) sourceStats.offers++;
        bySourceMap.set(sourceName, sourceStats);
      }

      const byCvVersion = Array.from(byCvMap.entries()).map(([category, stats]) => ({
        category,
        totalApplications: stats.total,
        interviews: stats.interviews,
        offers: stats.offers,
        conversionRate: Math.round((stats.interviews / stats.total) * 100),
      })).sort((a, b) => b.conversionRate - a.conversionRate);

      const bySource = Array.from(bySourceMap.entries()).map(([category, stats]) => ({
        category,
        totalApplications: stats.total,
        interviews: stats.interviews,
        offers: stats.offers,
        conversionRate: Math.round((stats.interviews / stats.total) * 100),
      })).sort((a, b) => b.conversionRate - a.conversionRate);

      const overallConversionRate = Math.round((totalInterviews / applications.length) * 100);

      return ok({
        byCvVersion,
        bySource,
        overallConversionRate,
      });
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to generate analytics'));
    }
  }
}

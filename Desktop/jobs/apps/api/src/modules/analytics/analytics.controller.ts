import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getDashboard(@Req() req: any) {
    const res = await this.analyticsService.getDashboard(req.user.id);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }
}

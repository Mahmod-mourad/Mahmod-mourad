import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { QueueModule } from './core/queue/queue.module';
import { AiModule } from './core/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { CvModule } from './modules/cv/cv.module';
import { AtsModule } from './modules/ats/ats.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CompanionModule } from './modules/companion/companion.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { OutreachModule } from './modules/outreach/outreach.module';
import { NegotiationModule } from './modules/negotiation/negotiation.module';
import { PrepModule } from './modules/prep/prep.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    QueueModule,
    AiModule,
    AuthModule,
    ApplicationsModule,
    CvModule,
    AtsModule,
    JobsModule,
    CompanionModule,
    FollowUpsModule,
    OutreachModule,
    NegotiationModule,
    PrepModule,
    AnalyticsModule,
    PortfolioModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

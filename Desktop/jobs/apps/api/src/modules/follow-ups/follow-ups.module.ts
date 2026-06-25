import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FollowUpProcessor } from './processors/follow-up.processor';
import { NotifyProcessor } from './processors/notify.processor';
import { FollowUpsRepository } from './follow-ups.repository';
import { PrismaService } from '../../core/database/prisma.service';
import { AiModule } from '../../core/ai/ai.module';
import { CompanionModule } from '../companion/companion.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'follow-ups-queue' }),
    BullModule.registerQueue({ name: 'notifications-queue' }),
    AiModule,
    CompanionModule,
  ],
  providers: [FollowUpProcessor, NotifyProcessor, FollowUpsRepository, PrismaService],
})
export class FollowUpsModule {}

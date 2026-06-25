import { Module } from '@nestjs/common';
import { OutreachController } from './outreach.controller';
import { OutreachService } from './outreach.service';
import { OutreachRepository } from './outreach.repository';
import { PrismaService } from '../../core/database/prisma.service';
import { AiModule } from '../../core/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [OutreachController],
  providers: [OutreachService, OutreachRepository, PrismaService],
})
export class OutreachModule {}

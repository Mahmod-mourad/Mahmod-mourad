import { Module } from '@nestjs/common';
import { PrepController } from './prep.controller';
import { PrepService } from './prep.service';
import { PrepRepository } from './prep.repository';
import { PrismaService } from '../../core/database/prisma.service';
import { AiModule } from '../../core/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [PrepController],
  providers: [PrepService, PrepRepository, PrismaService],
})
export class PrepModule {}

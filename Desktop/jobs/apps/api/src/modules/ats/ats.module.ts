import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AtsController } from './ats.controller';
import { AtsService } from './ats.service';
import { AtsProcessor } from './processors/ats.processor';
import { CvModule } from '../cv/cv.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ats-queue',
    }),
    CvModule,
  ],
  controllers: [AtsController],
  providers: [AtsService, AtsProcessor],
})
export class AtsModule {}

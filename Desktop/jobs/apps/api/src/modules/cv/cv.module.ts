import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CvRepository } from './cv.repository';

@Module({
  controllers: [CvController],
  providers: [CvService, CvRepository],
  exports: [CvService, CvRepository],
})
export class CvModule {}

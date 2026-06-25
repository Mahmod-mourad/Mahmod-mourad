import { Module } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { TelegramService } from './telegram.service';
import { CompanionController } from './companion.controller';
import { CompanionRepository } from './companion.repository';
import { PrismaService } from '../../core/database/prisma.service';

@Module({
  controllers: [CompanionController],
  providers: [PushNotificationsService, TelegramService, CompanionRepository, PrismaService],
  exports: [PushNotificationsService, TelegramService, CompanionRepository],
})
export class CompanionModule {}

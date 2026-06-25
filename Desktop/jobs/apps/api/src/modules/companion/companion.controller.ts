import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PushSubscriptionDto } from '@nexahire/types';
import { CompanionRepository } from './companion.repository';

@Controller('companion')
export class CompanionController {
  constructor(
    private readonly pushService: PushNotificationsService,
    private readonly repo: CompanionRepository,
  ) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: this.pushService.getPublicKey() };
  }

  @UseGuards(JwtAuthGuard)
  @Post('push-subscribe')
  async subscribe(@Req() req: any, @Body() subscription: PushSubscriptionDto) {
    const result = await this.pushService.saveSubscription(req.user.id, subscription);
    if (result.ok) {
      return { success: true };
    }
    throw new Error(result.error.message);
  }

  @UseGuards(JwtAuthGuard)
  @Get('daily-focus')
  async getDailyFocus(@Req() req: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const focus = await this.repo.getDailyFocus(req.user.id, today);

    return focus || { tasks: [], streak: 0 };
  }
}

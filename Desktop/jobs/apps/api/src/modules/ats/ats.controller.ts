import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AtsService } from './ats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { unwrapOrThrow } from '../../core/result/http-mapper';
import { AtsRequestDto } from '@nexahire/types';

@Controller('ats')
@UseGuards(JwtAuthGuard)
export class AtsController {
  constructor(private readonly service: AtsService) {}

  @Post('score')
  async score(@CurrentUser() user: { id: string }, @Body() dto: AtsRequestDto) {
    const result = await this.service.submitScoreJob(user.id, dto);
    return unwrapOrThrow(result);
  }

  @Post('tailor')
  async tailor(@CurrentUser() user: { id: string }, @Body() dto: AtsRequestDto) {
    const result = await this.service.submitTailorJob(user.id, dto);
    return unwrapOrThrow(result);
  }

  @Get('job/:id')
  async getJobStatus(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const result = await this.service.getJobStatus(id, user.id);
    return unwrapOrThrow(result);
  }
}

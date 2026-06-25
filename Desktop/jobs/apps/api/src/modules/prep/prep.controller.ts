import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PrepService } from './prep.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStarStoryDto, CreateInterviewLogDto, MockInterviewRequestDto } from '@nexahire/types';

@Controller('prep')
@UseGuards(JwtAuthGuard)
export class PrepController {
  constructor(private readonly prepService: PrepService) {}

  @Post('star')
  async createStarStory(@Req() req: any, @Body() data: CreateStarStoryDto) {
    const res = await this.prepService.createStarStory(req.user.id, data);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Get('star')
  async getStarStories(@Req() req: any) {
    const res = await this.prepService.getStarStories(req.user.id);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Post('mock')
  async simulateMockInterview(@Body() data: MockInterviewRequestDto) {
    const res = await this.prepService.simulateMockInterview(data);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Post('logs')
  async logInterview(@Body() data: CreateInterviewLogDto) {
    const res = await this.prepService.createInterviewLog(data);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Get('logs/:applicationId')
  async getLogs(@Param('applicationId') applicationId: string) {
    const res = await this.prepService.getInterviewLogs(applicationId);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }
}

import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OutreachService } from './outreach.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateOutreachDto, CreateSnippetDto } from '@nexahire/types';

@Controller('outreach')
@UseGuards(JwtAuthGuard)
export class OutreachController {
  constructor(private readonly outreachService: OutreachService) {}

  @Post('snippets')
  async createSnippet(@Req() req: any, @Body() data: CreateSnippetDto) {
    const res = await this.outreachService.createSnippet(req.user.id, data);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Get('snippets')
  async getSnippets(@Req() req: any) {
    const res = await this.outreachService.getSnippets(req.user.id);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Post('generate')
  async generateOutreach(@Req() req: any, @Body() data: GenerateOutreachDto) {
    const res = await this.outreachService.generateOutreach(req.user.id, data);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Get('applications/:id/messages')
  async getMessagesByApplication(@Param('id') id: string) {
    const res = await this.outreachService.getMessagesForApplication(id);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }
}

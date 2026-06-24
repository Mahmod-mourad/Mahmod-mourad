import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { unwrapOrThrow } from '../../core/result/http-mapper';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateApplicationDto) {
    const result = await this.service.create(user.id, dto);
    return unwrapOrThrow(result);
  }

  @Get()
  async list(
    @CurrentUser() user: { id: string },
    @Query('limit') limitStr?: string,
    @Query('cursor') cursor?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const result = await this.service.findPage(user.id, limit, cursor);
    return unwrapOrThrow(result);
  }

  @Get('stats')
  async getStats(@CurrentUser() user: { id: string }) {
    const result = await this.service.getStats(user.id);
    return unwrapOrThrow(result);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    const result = await this.service.updateStatus(id, user.id, dto);
    return unwrapOrThrow(result);
  }
}

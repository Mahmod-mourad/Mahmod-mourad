import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CvService } from './cv.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { unwrapOrThrow } from '../../core/result/http-mapper';
import { CreateCvVersionDto, UpdateCvVersionDto } from '@nexahire/types';

@Controller('cv-versions')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private readonly service: CvService) {}

  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateCvVersionDto) {
    const result = await this.service.create(user.id, dto);
    return unwrapOrThrow(result);
  }

  @Get()
  async list(@CurrentUser() user: { id: string }) {
    const result = await this.service.findMany(user.id);
    return unwrapOrThrow(result);
  }

  @Get(':id')
  async get(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const result = await this.service.findById(id, user.id);
    return unwrapOrThrow(result);
  }

  @Patch(':id')
  async update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdateCvVersionDto) {
    const result = await this.service.update(id, user.id, dto);
    return unwrapOrThrow(result);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const result = await this.service.delete(id, user.id);
    return unwrapOrThrow(result);
  }
}

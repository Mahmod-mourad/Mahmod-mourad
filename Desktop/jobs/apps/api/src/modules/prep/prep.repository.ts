import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateStarStoryDto, CreateInterviewLogDto } from '@nexahire/types';

@Injectable()
export class PrepRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createStarStory(userId: string, data: CreateStarStoryDto) {
    return this.prisma.starStory.create({
      data: {
        userId,
        title: data.title,
        situation: data.situation,
        task: data.task,
        action: data.action,
        result: data.result,
        skills: data.skills,
      },
    });
  }

  async getStarStories(userId: string) {
    return this.prisma.starStory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInterviewLog(data: CreateInterviewLogDto & { debrief?: string }) {
    return this.prisma.interviewLog.create({
      data: {
        applicationId: data.applicationId,
        date: data.date,
        type: data.type,
        notes: data.notes,
        rating: data.rating,
        debrief: data.debrief,
      },
    });
  }

  async getInterviewLogsForApplication(applicationId: string) {
    return this.prisma.interviewLog.findMany({
      where: { applicationId },
      orderBy: { date: 'desc' },
    });
  }
}

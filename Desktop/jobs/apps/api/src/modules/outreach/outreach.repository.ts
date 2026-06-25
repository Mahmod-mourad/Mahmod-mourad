import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateSnippetDto } from '@nexahire/types';

@Injectable()
export class OutreachRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSnippet(userId: string, data: CreateSnippetDto) {
    return this.prisma.snippet.create({
      data: {
        userId,
        name: data.name,
        content: data.content,
      },
    });
  }

  async findSnippetsByUser(userId: string) {
    return this.prisma.snippet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSnippetsByIds(userId: string, ids: string[]) {
    return this.prisma.snippet.findMany({
      where: { userId, id: { in: ids } },
    });
  }

  async saveOutreachMessage(
    userId: string,
    applicationId: string | undefined,
    type: 'email' | 'linkedin',
    content: string
  ) {
    return this.prisma.outreachMessage.create({
      data: {
        userId,
        applicationId,
        type,
        content,
      },
    });
  }

  async findOutreachMessagesByApplication(applicationId: string) {
    return this.prisma.outreachMessage.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

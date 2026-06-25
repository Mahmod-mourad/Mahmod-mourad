import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class FollowUpsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDuePendingFollowUps() {
    return this.prisma.followUp.findMany({
      where: {
        status: 'pending',
        scheduledDate: { lte: new Date() },
      },
      include: {
        application: {
          include: { user: true },
        },
      },
    });
  }

  async updateStatusAndMessage(id: string, status: string, draftedMessage: string) {
    return this.prisma.followUp.update({
      where: { id },
      data: { status, draftedMessage },
    });
  }

  async markAsSent(id: string) {
    return this.prisma.followUp.update({
      where: { id },
      data: { status: 'sent' },
    });
  }
}

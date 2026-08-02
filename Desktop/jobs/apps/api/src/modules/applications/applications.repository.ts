import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AppError, err, ok, Result } from '../../core/result';
import { Application, ApplicationStatus, Prisma } from '@prisma/client';

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: Prisma.ApplicationCreateWithoutUserInput): Promise<Result<Application, AppError>> {
    try {
      const app = await this.prisma.application.create({
        data: {
          ...data,
          user: { connect: { id: userId } },
        },
      });
      return ok(app);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to create application'));
    }
  }

  async findPage(userId: string, limit: number, cursor?: string): Promise<Result<{ data: Application[]; nextCursor?: string }, AppError>> {
    try {
      const apps = await this.prisma.application.findMany({
        take: limit + 1, // Fetch one extra to determine if there's a next page
        where: { userId },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined = undefined;
      if (apps.length > limit) {
        const nextItem = apps.pop();
        nextCursor = nextItem?.id;
      }

      return ok({ data: apps, nextCursor });
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to fetch applications'));
    }
  }

  async updateStatus(id: string, userId: string, status: ApplicationStatus): Promise<Result<Application, AppError>> {
    try {
      const app = await this.prisma.application.update({
        where: { id, userId }, // Ensure user owns the application
        data: { status },
      });
      return ok(app);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return err(new AppError('NotFound', 'Application not found or unauthorized'));
      }
      return err(new AppError('Unexpected', 'Failed to update application status'));
    }
  }

  async getStats(userId: string): Promise<Result<{ stageCounts: Record<string, number>; responseRate: number }, AppError>> {
    try {
      const groups = await this.prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      });

      const stageCounts: Record<string, number> = {
        applied: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
      };

      let total = 0;
      let nonApplied = 0; // Everything except 'applied' and 'rejected' ? 
      // Actually, let's say "responded" means screening, interview, offer, or rejected.

      for (const group of groups) {
        stageCounts[group.status] = group._count.status;
        total += group._count.status;
        if (group.status !== 'applied') {
          nonApplied += group._count.status;
        }
      }

      const responseRate = total > 0 ? (nonApplied / total) * 100 : 0;

      return ok({ stageCounts, responseRate });
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to fetch statistics'));
    }
  }
}

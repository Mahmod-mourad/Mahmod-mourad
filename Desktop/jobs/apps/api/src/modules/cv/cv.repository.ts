import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AppError, err, ok, Result } from '@nexahire/types';
import { CvVersion } from '@prisma/client';

@Injectable()
export class CvRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, title: string, content: string): Promise<Result<CvVersion, AppError>> {
    try {
      const cv = await this.prisma.cvVersion.create({
        data: { userId, title, content },
      });
      return ok(cv);
    } catch (error) {
      return err(new AppError('Internal', 'Failed to create CV version'));
    }
  }

  async findMany(userId: string): Promise<Result<CvVersion[], AppError>> {
    try {
      const cvs = await this.prisma.cvVersion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return ok(cvs);
    } catch (error) {
      return err(new AppError('Internal', 'Failed to fetch CV versions'));
    }
  }

  async findById(id: string, userId: string): Promise<Result<CvVersion, AppError>> {
    try {
      const cv = await this.prisma.cvVersion.findUnique({
        where: { id, userId },
      });
      if (!cv) return err(new AppError('NotFound', 'CV version not found'));
      return ok(cv);
    } catch (error) {
      return err(new AppError('Internal', 'Failed to fetch CV version'));
    }
  }

  async update(id: string, userId: string, data: { title?: string; content?: string }): Promise<Result<CvVersion, AppError>> {
    try {
      const cv = await this.prisma.cvVersion.update({
        where: { id, userId },
        data,
      });
      return ok(cv);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return err(new AppError('NotFound', 'CV version not found'));
      }
      return err(new AppError('Internal', 'Failed to update CV version'));
    }
  }

  async delete(id: string, userId: string): Promise<Result<void, AppError>> {
    try {
      await this.prisma.cvVersion.delete({
        where: { id, userId },
      });
      return ok(undefined);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return err(new AppError('NotFound', 'CV version not found'));
      }
      return err(new AppError('Internal', 'Failed to delete CV version'));
    }
  }
}

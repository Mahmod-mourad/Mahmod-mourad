import { Injectable } from '@nestjs/common';
import { ApplicationsRepository } from './applications.repository';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationStatus } from '@prisma/client';
import { AppError, Result } from '../../core/result';
import { Application } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly repo: ApplicationsRepository) {}

  create(userId: string, dto: CreateApplicationDto): Promise<Result<Application, AppError>> {
    // We could add business rules here
    return this.repo.create(userId, dto as any);
  }

  findPage(userId: string, limit: number, cursor?: string): Promise<Result<{ data: Application[]; nextCursor?: string }, AppError>> {
    const fetchLimit = limit > 50 ? 50 : limit;
    return this.repo.findPage(userId, fetchLimit, cursor);
  }

  updateStatus(id: string, userId: string, dto: UpdateApplicationStatusDto): Promise<Result<Application, AppError>> {
    return this.repo.updateStatus(id, userId, dto.status);
  }

  getStats(userId: string) {
    return this.repo.getStats(userId);
  }
}

import { Injectable } from '@nestjs/common';
import { CvRepository } from './cv.repository';
import { CreateCvVersionDto, UpdateCvVersionDto } from '@nexahire/types';
import { AppError, Result } from '../../core/result';
import { CvVersion } from '@prisma/client';

@Injectable()
export class CvService {
  constructor(private readonly repo: CvRepository) {}

  create(userId: string, dto: CreateCvVersionDto): Promise<Result<CvVersion, AppError>> {
    return this.repo.create(userId, dto.title, dto.content);
  }

  findMany(userId: string): Promise<Result<CvVersion[], AppError>> {
    return this.repo.findMany(userId);
  }

  findById(id: string, userId: string): Promise<Result<CvVersion, AppError>> {
    return this.repo.findById(id, userId);
  }

  update(id: string, userId: string, dto: UpdateCvVersionDto): Promise<Result<CvVersion, AppError>> {
    return this.repo.update(id, userId, dto);
  }

  delete(id: string, userId: string): Promise<Result<void, AppError>> {
    return this.repo.delete(id, userId);
  }
}

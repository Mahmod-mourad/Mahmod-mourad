import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AppError, err, ok, Result } from '@nexahire/types';
import { User } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Result<User | null, AppError>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      return ok(user);
    } catch (error) {
      return err(new AppError('Internal', 'Database error finding user'));
    }
  }

  async findById(id: string): Promise<Result<User | null, AppError>> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      return ok(user);
    } catch (error) {
      return err(new AppError('Internal', 'Database error finding user by id'));
    }
  }

  async createUser(email: string, passwordHash: string): Promise<Result<User, AppError>> {
    try {
      const user = await this.prisma.user.create({
        data: { email, passwordHash },
      });
      return ok(user);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return err(new AppError('Validation', 'Email already exists'));
      }
      return err(new AppError('Internal', 'Database error creating user'));
    }
  }
}

import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { AppError, err, ok, Result } from '@nexahire/types';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

export type AuthUser = { id: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: LoginDto): Promise<Result<{ user: AuthUser }, AppError>> {
    const existing = await this.repo.findByEmail(dto.email);
    if (!existing.ok) return err(existing.error);
    if (existing.value) return err(new AppError('Validation', 'Email already in use'));

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const created = await this.repo.createUser(dto.email, passwordHash);
    if (!created.ok) return err(created.error);

    const user = { id: created.value.id, email: created.value.email };
    return ok({ user });
  }

  async login(dto: LoginDto): Promise<Result<{ user: AuthUser; token: string }, AppError>> {
    const found = await this.repo.findByEmail(dto.email);
    if (!found.ok) return err(found.error);

    const user = found.value;
    if (!user) {
      return err(new AppError('Unauthorized', 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      return err(new AppError('Unauthorized', 'Invalid credentials'));
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return ok({
      user: { id: user.id, email: user.email },
      token,
    });
  }

  async getMe(id: string): Promise<Result<AuthUser, AppError>> {
    const found = await this.repo.findById(id);
    if (!found.ok) return err(found.error);

    const user = found.value;
    if (!user) return err(new AppError('NotFound', 'User not found'));

    return ok({ id: user.id, email: user.email });
  }
}

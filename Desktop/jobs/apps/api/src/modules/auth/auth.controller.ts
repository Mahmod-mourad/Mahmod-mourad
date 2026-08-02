import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ServerEnv } from '@nexahire/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { unwrapOrThrow } from '../../core/result/http-mapper';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly config: ConfigService<ServerEnv, true>,
  ) {}

  @Post('register')
  async register(@Body() dto: LoginDto) {
    const result = await this.service.register(dto);
    return unwrapOrThrow(result);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.login(dto);
    const data = unwrapOrThrow(result);

    const isSecure = this.config.get('COOKIE_SECURE', { infer: true });

    res.cookie('token', data.token, {
      httpOnly: true,
      secure: isSecure,
      // In production the web and API live on different subdomains (cross-site),
      // so the cookie must be SameSite=None; Secure to be sent on credentialed
      // requests. Locally (same-site localhost, no TLS) Lax is correct.
      sameSite: isSecure ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user: data.user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const isSecure = this.config.get('COOKIE_SECURE', { infer: true });
    // Clear with the same attributes the cookie was set with, or the browser
    // won't match and remove it.
    res.clearCookie('token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      path: '/',
    });
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: { id: string; email: string }) {
    const result = await this.service.getMe(user.id);
    return unwrapOrThrow(result);
  }
}

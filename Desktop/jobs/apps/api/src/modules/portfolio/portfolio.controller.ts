import { Controller, Get, Post, Body, Param, Res, UseGuards, Req } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortfolioUpdateDto } from '@nexahire/types';
import { Response } from 'express';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':slug')
  async getPublicPortfolio(@Param('slug') slug: string, @Res() res: Response) {
    const result = await this.portfolioService.renderPublicPortfolio(slug);
    if (!result.ok) {
      return res.status(404).send('<h1>404 - Portfolio Not Found</h1><p>This portfolio does not exist or is set to private.</p>');
    }
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(result.value);
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Req() req: any, @Body() data: PortfolioUpdateDto) {
    const res = await this.portfolioService.updateSettings(req.user.id, data);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }
}

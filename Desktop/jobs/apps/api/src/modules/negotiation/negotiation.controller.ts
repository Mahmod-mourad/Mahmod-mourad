import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { NegotiationService } from './negotiation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NegotiationRequestDto } from '@nexahire/types';
import { calculateNetPay } from './net-pay.helper';

@Controller('negotiation')
@UseGuards(JwtAuthGuard)
export class NegotiationController {
  constructor(private readonly negotiationService: NegotiationService) {}

  @Post('simulate')
  async simulateTurn(@Body() data: NegotiationRequestDto) {
    const res = await this.negotiationService.simulateTurn(data);
    if (!res.ok) throw new Error(res.error.message);
    return res.value;
  }

  @Get('net-pay')
  getNetPay(
    @Query('gross') gross: string,
    @Query('country') country: 'NL' | 'DE' | 'GULF',
    @Query('ruling') ruling?: string
  ) {
    const grossNum = parseFloat(gross);
    if (isNaN(grossNum)) throw new Error('Invalid gross amount');

    const net = calculateNetPay(grossNum, country, ruling === 'true');
    return { gross: grossNum, net, country };
  }
}

import { Injectable } from '@nestjs/common';
import { AiService } from '../../core/ai/ai.service';
import { NegotiationRequestDto, NegotiationResponse } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../core/result';

@Injectable()
export class NegotiationService {
  constructor(private readonly aiService: AiService) {}

  async simulateTurn(data: NegotiationRequestDto): Promise<Result<NegotiationResponse, AppError>> {
    try {
      const res = await this.aiService.simulateNegotiationTurn(
        data.companyName,
        data.role,
        data.userTargetSalary,
        data.recruiterInitialOffer,
        data.history
      );
      
      return res;
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to process negotiation turn'));
    }
  }
}

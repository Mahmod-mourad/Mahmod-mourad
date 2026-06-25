import { Module } from '@nestjs/common';
import { NegotiationController } from './negotiation.controller';
import { NegotiationService } from './negotiation.service';
import { AiModule } from '../../core/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [NegotiationController],
  providers: [NegotiationService],
})
export class NegotiationModule {}

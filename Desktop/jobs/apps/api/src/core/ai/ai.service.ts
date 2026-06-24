import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '@nexahire/config';
import Anthropic from '@anthropic-ai/sdk';
import { AppError, err, ok, Result, AtsScoreResultSchema, AtsScoreResult, TailorCvResultSchema, TailorCvResult } from '@nexahire/types';
import { SCORE_ATS_PROMPT, TAILOR_CV_PROMPT } from './prompts/ats.prompts';

@Injectable()
export class AiService {
  private anthropic: Anthropic | null = null;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService<Env, true>) {
    const apiKey = this.config.get('ANTHROPIC_API_KEY', { infer: true });
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY is missing. AI features will be disabled.');
    }
  }

  async getAiResponse(prompt: string): Promise<Result<string, AppError>> {
    if (!this.anthropic) {
      return err(new AppError('Internal', 'AI features are disabled'));
    }

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content[0].type === 'text') {
        return ok(response.content[0].text);
      }
      return err(new AppError('Internal', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error(error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async scoreAts(cvContent: string, jobDescription: string): Promise<Result<AtsScoreResult, AppError>> {
    if (!this.anthropic) {
      return err(new AppError('Internal', 'AI features are disabled'));
    }
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: SCORE_ATS_PROMPT,
        messages: [{ role: 'user', content: `CV:\n${cvContent}\n\nJob Description:\n${jobDescription}` }],
      });

      if (response.content[0].type === 'text') {
        let text = response.content[0].text.trim();
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        const parsed = JSON.parse(text);
        const result = AtsScoreResultSchema.safeParse(parsed);
        if (result.success) {
          return ok(result.data);
        }
        return err(new AppError('Internal', 'Failed to parse AI score result'));
      }
      return err(new AppError('Internal', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to score ATS:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async tailorCv(cvContent: string, jobDescription: string): Promise<Result<TailorCvResult, AppError>> {
    if (!this.anthropic) {
      return err(new AppError('Internal', 'AI features are disabled'));
    }
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: TAILOR_CV_PROMPT,
        messages: [{ role: 'user', content: `CV:\n${cvContent}\n\nJob Description:\n${jobDescription}` }],
      });

      if (response.content[0].type === 'text') {
        let text = response.content[0].text.trim();
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        const parsed = JSON.parse(text);
        const result = TailorCvResultSchema.safeParse(parsed);
        if (result.success) {
          return ok(result.data);
        }
        return err(new AppError('Internal', 'Failed to parse AI tailor result'));
      }
      return err(new AppError('Internal', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to tailor CV:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerEnv } from '@nexahire/config';
import Anthropic from '@anthropic-ai/sdk';
import { AtsScoreResultSchema, AtsScoreResult, TailorCvResultSchema, TailorCvResult } from '@nexahire/types';
import { AppError, err, ok, Result } from '../result';
import { SCORE_ATS_PROMPT, TAILOR_CV_PROMPT } from './prompts/ats.prompts';
import { DRAFT_FOLLOW_UP_PROMPT } from './prompts/follow-up.prompt';
import { DRAFT_OUTREACH_PROMPT } from './prompts/outreach.prompt';
import { SIMULATE_NEGOTIATION_PROMPT } from './prompts/negotiation.prompt';
import { SIMULATE_MOCK_INTERVIEW_PROMPT, GENERATE_DEBRIEF_PROMPT } from './prompts/prep.prompt';
import { NegotiationTurn, NegotiationResponse, NegotiationResponseSchema, DebriefResponse, DebriefResponseSchema } from '@nexahire/types';

@Injectable()
export class AiService {
  private anthropic: Anthropic | null = null;
  private readonly logger = new Logger(AiService.name);
  /** The model id, sourced once from config (ANTHROPIC_MODEL) — never a literal per call. */
  private readonly model: string;

  constructor(private readonly config: ConfigService<ServerEnv, true>) {
    this.model = this.config.get('ANTHROPIC_MODEL', { infer: true });
    const apiKey = this.config.get('ANTHROPIC_API_KEY', { infer: true });
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY is missing. AI features will be disabled.');
    }
  }

  async getAiResponse(prompt: string): Promise<Result<string, AppError>> {
    if (!this.anthropic) {
      return err(new AppError('Unexpected', 'AI features are disabled'));
    }

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content[0].type === 'text') {
        return ok(response.content[0].text);
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error(error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async scoreAts(cvContent: string, jobDescription: string): Promise<Result<AtsScoreResult, AppError>> {
    if (!this.anthropic) {
      return err(new AppError('Unexpected', 'AI features are disabled'));
    }
    
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
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
        return err(new AppError('Unexpected', 'Failed to parse AI score result'));
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to score ATS:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async tailorCv(cvContent: string, jobDescription: string): Promise<Result<TailorCvResult, AppError>> {
    if (!this.anthropic) {
      return err(new AppError('Unexpected', 'AI features are disabled'));
    }
    
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
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
        return err(new AppError('Unexpected', 'Failed to parse AI tailor result'));
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to tailor CV:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async draftFollowUp(company: string, role: string, date: string): Promise<Result<string, AppError>> {
    if (!this.anthropic) {
      return err(new AppError('Unexpected', 'AI features are disabled'));
    }
    
    try {
      const prompt = DRAFT_FOLLOW_UP_PROMPT
        .replace('{{company}}', company)
        .replace('{{role}}', role)
        .replace('{{date}}', date);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content[0].type === 'text') {
        return ok(response.content[0].text.trim());
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to draft follow up:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async draftOutreach(
    company: string,
    role: string,
    targetName: string,
    type: 'email' | 'linkedin',
    snippets: string,
    customNote: string,
  ): Promise<Result<string, AppError>> {
    if (!this.anthropic) return err(new AppError('Unexpected', 'AI features disabled'));

    try {
      const prompt = DRAFT_OUTREACH_PROMPT
        .replace('{{company}}', company)
        .replace('{{role}}', role)
        .replace('{{targetName}}', targetName || 'Hiring Manager')
        .replace('{{type}}', type)
        .replace('{{snippets}}', snippets || 'None provided')
        .replace('{{customNote}}', customNote || 'None provided');

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content[0].type === 'text') {
        return ok(response.content[0].text.trim());
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to draft outreach:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async simulateNegotiationTurn(
    company: string,
    role: string,
    targetSalary: number,
    initialOffer: number,
    history: NegotiationTurn[],
  ): Promise<Result<NegotiationResponse, AppError>> {
    if (!this.anthropic) return err(new AppError('Unexpected', 'AI features disabled'));

    try {
      const formattedHistory = history.map(t => `${t.role.toUpperCase()}: ${t.message}`).join('\n');
      
      const prompt = SIMULATE_NEGOTIATION_PROMPT
        .replace('{{company}}', company)
        .replace('{{role}}', role)
        .replace('{{targetSalary}}', String(targetSalary))
        .replace('{{initialOffer}}', String(initialOffer))
        .replace('{{history}}', formattedHistory);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content[0].type === 'text') {
        let text = response.content[0].text.trim();
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        const parsed = JSON.parse(text);
        const result = NegotiationResponseSchema.safeParse(parsed);
        if (result.success) {
          return ok(result.data);
        }
        return err(new AppError('Unexpected', 'Failed to parse AI negotiation response'));
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to simulate negotiation turn:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async simulateMockInterviewTurn(
    role: string,
    questionType: string,
    history: NegotiationTurn[]
  ): Promise<Result<{ interviewerMessage: string; coachingNote: string }, AppError>> {
    if (!this.anthropic) return err(new AppError('Unexpected', 'AI features disabled'));

    try {
      const formattedHistory = history.map(t => `${t.role.toUpperCase()}: ${t.message}`).join('\n');
      
      const prompt = SIMULATE_MOCK_INTERVIEW_PROMPT
        .replace('{{role}}', role)
        .replace('{{questionType}}', questionType)
        .replace('{{history}}', formattedHistory);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content[0].type === 'text') {
        let text = response.content[0].text.trim();
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        const parsed = JSON.parse(text);
        // Note: Reusing the same structure as NegotiationResponse for simplicity.
        if (parsed.interviewerMessage && parsed.coachingNote) {
          return ok(parsed as { interviewerMessage: string; coachingNote: string });
        }
        return err(new AppError('Unexpected', 'Failed to parse AI mock interview response'));
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to simulate mock interview turn:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }

  async generateDebrief(type: string, notes: string): Promise<Result<DebriefResponse, AppError>> {
    if (!this.anthropic) return err(new AppError('Unexpected', 'AI features disabled'));

    try {
      const prompt = GENERATE_DEBRIEF_PROMPT
        .replace('{{type}}', type)
        .replace('{{notes}}', notes);

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      });

      if (response.content[0].type === 'text') {
        let text = response.content[0].text.trim();
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        const parsed = JSON.parse(text);
        const result = DebriefResponseSchema.safeParse(parsed);
        if (result.success) {
          return ok(result.data);
        }
        return err(new AppError('Unexpected', 'Failed to parse AI debrief response'));
      }
      return err(new AppError('Unexpected', 'Unexpected response format from AI'));
    } catch (error) {
      this.logger.error('Failed to generate debrief:', error);
      return err(new AppError('ExternalFailure', 'Failed to communicate with Anthropic API'));
    }
  }
}

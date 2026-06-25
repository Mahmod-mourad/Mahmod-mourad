import { Injectable } from '@nestjs/common';
import { OutreachRepository } from './outreach.repository';
import { AiService } from '../../core/ai/ai.service';
import { GenerateOutreachDto, CreateSnippetDto, Snippet, OutreachMessage } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../core/result';

@Injectable()
export class OutreachService {
  constructor(
    private readonly repo: OutreachRepository,
    private readonly aiService: AiService,
  ) {}

  async createSnippet(userId: string, data: CreateSnippetDto): Promise<Result<Snippet, AppError>> {
    try {
      const snippet = await this.repo.createSnippet(userId, data);
      return ok(snippet);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to create snippet'));
    }
  }

  async getSnippets(userId: string): Promise<Result<Snippet[], AppError>> {
    try {
      const snippets = await this.repo.findSnippetsByUser(userId);
      return ok(snippets);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to fetch snippets'));
    }
  }

  async generateOutreach(userId: string, data: GenerateOutreachDto): Promise<Result<OutreachMessage, AppError>> {
    try {
      let combinedSnippets = '';
      if (data.snippetIds && data.snippetIds.length > 0) {
        const snippets = await this.repo.getSnippetsByIds(userId, data.snippetIds);
        combinedSnippets = snippets.map(s => s.content).join('\n\n');
      }

      const draftRes = await this.aiService.draftOutreach(
        data.companyName,
        data.role,
        data.targetName || '',
        data.type,
        combinedSnippets,
        data.customNote || ''
      );

      if (!draftRes.ok) return draftRes;

      const savedMessage = await this.repo.saveOutreachMessage(
        userId,
        data.applicationId,
        data.type,
        draftRes.value
      );

      return ok(savedMessage as OutreachMessage);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to generate outreach'));
    }
  }

  async getMessagesForApplication(applicationId: string): Promise<Result<OutreachMessage[], AppError>> {
    try {
      const messages = await this.repo.findOutreachMessagesByApplication(applicationId);
      return ok(messages as OutreachMessage[]);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to fetch outreach messages'));
    }
  }
}

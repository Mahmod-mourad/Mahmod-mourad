import { Injectable } from '@nestjs/common';
import { PrepRepository } from './prep.repository';
import { AiService } from '../../core/ai/ai.service';
import { CreateStarStoryDto, StarStory, CreateInterviewLogDto, InterviewLog, MockInterviewRequestDto, DebriefResponse } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../core/result';

@Injectable()
export class PrepService {
  constructor(
    private readonly repo: PrepRepository,
    private readonly aiService: AiService,
  ) {}

  async createStarStory(userId: string, data: CreateStarStoryDto): Promise<Result<StarStory, AppError>> {
    try {
      const story = await this.repo.createStarStory(userId, data);
      return ok(story);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to create STAR story'));
    }
  }

  async getStarStories(userId: string): Promise<Result<StarStory[], AppError>> {
    try {
      const stories = await this.repo.getStarStories(userId);
      return ok(stories);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to fetch STAR stories'));
    }
  }

  async simulateMockInterview(data: MockInterviewRequestDto): Promise<Result<{ interviewerMessage: string; coachingNote: string }, AppError>> {
    return this.aiService.simulateMockInterviewTurn(data.role, data.questionType, data.history);
  }

  async createInterviewLog(data: CreateInterviewLogDto): Promise<Result<InterviewLog, AppError>> {
    try {
      let debriefStr: string | undefined;

      // Automatically generate debrief if notes are provided
      if (data.notes && data.notes.length > 20) {
        const debriefRes = await this.aiService.generateDebrief(data.type, data.notes);
        if (debriefRes.ok) {
          debriefStr = JSON.stringify(debriefRes.value);
        }
      }

      const log = await this.repo.createInterviewLog({ ...data, debrief: debriefStr });
      return ok(log);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to log interview'));
    }
  }

  async getInterviewLogs(applicationId: string): Promise<Result<InterviewLog[], AppError>> {
    try {
      const logs = await this.repo.getInterviewLogsForApplication(applicationId);
      return ok(logs);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to fetch interview logs'));
    }
  }
}

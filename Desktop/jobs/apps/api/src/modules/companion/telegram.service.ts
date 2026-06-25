import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { CompanionRepository } from './companion.repository';

@Injectable()
export class TelegramService {
  private bot: Telegraf | null = null;
  private isConfigured = false;

  constructor(
    private readonly config: ConfigService,
    private readonly repo: CompanionRepository,
  ) {}

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (token) {
      this.bot = new Telegraf(token);
      this.isConfigured = true;
      this.setupBot();
      
      // Use polling for local dev instead of webhook to avoid ngrok hassle
      this.bot.launch().catch(err => console.error('Telegram bot failed to launch:', err));
    } else {
      console.warn('TELEGRAM_BOT_TOKEN not set. Telegram bot will be disabled.');
    }
  }

  private setupBot() {
    if (!this.bot) return;

    this.bot.command('start', async (ctx: Context) => {
      // Basic /start to link account. In a real app we'd ask for an auth token or deep link
      // For now, if there's only one user (the owner), link them automatically
      const user = await this.repo.getFirstUser();
      if (!user) {
        return ctx.reply('No users found in the database. Please register on the web app first.');
      }

      await this.repo.upsertTelegramChat(user.id, String(ctx.chat?.id));

      await ctx.reply('Welcome! Your Telegram is now linked to NexaHire. You will receive follow-up reminders here.');
    });

    this.bot.command('today', async (ctx: Context) => {
      const chat = await this.repo.findTelegramChat(String(ctx.chat?.id));

      if (!chat) return ctx.reply('Please run /start to link your account first.');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const focus = await this.repo.getDailyFocus(chat.userId, today);

      if (!focus || focus.tasks.length === 0) {
        return ctx.reply('You have no tasks set for today. Go to the web app to set your Daily Focus!');
      }

      const taskList = focus.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n');
      return ctx.reply(`🎯 Your Daily Focus:\n\n${taskList}\n\n🔥 Streak: ${focus.streak} days`);
    });

    this.bot.command('applied', async (ctx: Context) => {
      // e.g. /applied <url> or /applied <company>
      return ctx.reply('To add an application quickly, please use the Web App for now.');
    });
  }

  async sendMessageToUser(userId: string, message: string) {
    if (!this.bot || !this.isConfigured) return;

    const chat = await this.repo.findTelegramChatByUserId(userId);

    if (chat) {
      try {
        await this.bot.telegram.sendMessage(chat.chatId, message);
      } catch (error) {
        console.error(`Failed to send telegram message to user ${userId}:`, error);
      }
    }
  }

  onModuleDestroy() {
    if (this.bot) {
      this.bot.stop('SIGTERM');
    }
  }
}

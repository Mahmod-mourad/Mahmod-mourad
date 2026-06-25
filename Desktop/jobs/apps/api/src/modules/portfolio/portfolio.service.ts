import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { PortfolioUpdateDto } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../core/result';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async updateSettings(userId: string, data: PortfolioUpdateDto): Promise<Result<any, AppError>> {
    try {
      if (data.portfolioSlug) {
        // Ensure slug uniqueness
        const existing = await this.prisma.user.findFirst({
          where: { portfolioSlug: data.portfolioSlug, id: { not: userId } },
        });
        if (existing) return err(new AppError('Conflict', 'Portfolio slug already taken'));
      }

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          portfolioSlug: data.portfolioSlug,
          isPortfolioPublic: data.isPortfolioPublic,
        },
        select: { portfolioSlug: true, isPortfolioPublic: true },
      });

      return ok(updated);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to update portfolio settings'));
    }
  }

  async renderPublicPortfolio(slug: string): Promise<Result<string, AppError>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { portfolioSlug: slug },
        include: { cvVersions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });

      if (!user || !user.isPortfolioPublic) {
        return err(new AppError('NotFound', 'Portfolio not found or private'));
      }

      const defaultCv = user.cvVersions[0];
      const cvHtml = defaultCv ? defaultCv.content.replace(/\n/g, '<br/>') : 'No CV uploaded yet.';

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio - ${slug}</title>
  <style>
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; }
    .container { max-width: 800px; margin: 40px auto; padding: 20px; }
    header { text-align: center; margin-bottom: 40px; }
    h1 { font-size: 2.5rem; margin-bottom: 8px; color: #0f172a; }
    .subtitle { color: #64748b; font-size: 1.1rem; }
    .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .cv-content { white-space: pre-wrap; font-family: monospace; font-size: 0.95rem; }
    footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${slug}'s Portfolio</h1>
      <div class="subtitle">Software Engineer</div>
    </header>
    
    <div class="card">
      <h2 style="margin-top:0; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">Curriculum Vitae</h2>
      <div class="cv-content">${cvHtml}</div>
    </div>

    <footer>
      Powered by NexaHire AI Copilot
    </footer>
  </div>
</body>
</html>
      `.trim();

      return ok(html);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to render portfolio'));
    }
  }
}

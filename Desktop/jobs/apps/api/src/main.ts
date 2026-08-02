import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import type { ServerEnv } from '@nexahire/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All config comes from the validated env (never process.env directly).
  const config = app.get<ConfigService<ServerEnv, true>>(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Prefer the platform-assigned PORT (Railway/Render/Fly); fall back to API_PORT,
  // then the schema default. The trailing literal also satisfies the listen() type.
  const port =
    config.get('PORT', { infer: true }) ??
    config.get('API_PORT', { infer: true }) ??
    3001;
  await app.listen(port);
  Logger.log(`API running on port ${port}`, 'Bootstrap');
}
bootstrap();

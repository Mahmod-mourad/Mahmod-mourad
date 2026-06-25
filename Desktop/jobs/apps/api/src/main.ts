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

  const port = config.get('API_PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API running on port ${port}`, 'Bootstrap');
}
bootstrap();

import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { loadServerEnv } from '@nexahire/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: loadServerEnv,
      isGlobal: true,
      // The monorepo keeps a single .env at the repo root. Resolve it whether the
      // process is launched from the repo root or from apps/api (nest start).
      // Real environment variables always win over the file, so production is
      // unaffected.
      envFilePath: ['.env', '../../.env'],
    }),
  ],
})
export class ConfigModule {}

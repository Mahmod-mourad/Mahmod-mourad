import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { loadServerEnv } from '@nexahire/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: loadServerEnv,
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}

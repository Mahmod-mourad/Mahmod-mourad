import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerEnv } from '@nexahire/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<ServerEnv, true>) => ({
        connection: {
          url: config.get('REDIS_URL'),
        },
      }),
    }),
  ],
})
export class QueueModule {}

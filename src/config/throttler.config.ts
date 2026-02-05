import { ConfigService } from '@nestjs/config';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';

export function buildThrottlerOptions(configService: ConfigService): ThrottlerModuleOptions {
  return {
    throttlers: [
      {
        ttl: Number(configService.get<string>('RATE_LIMIT_TTL') ?? 60),
        limit: Number(configService.get<string>('RATE_LIMIT_LIMIT') ?? 60),
      },
    ],
  };
}

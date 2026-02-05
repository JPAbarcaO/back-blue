import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export function buildCorsOptions(configService: ConfigService): CorsOptions {
  const corsOriginsRaw = configService.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000';
  const corsOrigins =
    corsOriginsRaw === '*'
      ? true
      : corsOriginsRaw
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);

  return {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  };
}

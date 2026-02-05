import { ConfigService } from '@nestjs/config';

export function buildMongoUri(configService: ConfigService): string {
  const mongoUser = configService.get<string>('MONGO_USER');
  const mongoPass = configService.get<string>('MONGO_PASS');
  const mongoUrl = configService.get<string>('MONGO_URL');
  const mongoDb = configService.get<string>('MONGO_DB');

  const missing: string[] = [];
  if (!mongoUser) missing.push('MONGO_USER');
  if (!mongoPass) missing.push('MONGO_PASS');
  if (!mongoUrl) missing.push('MONGO_URL');
  if (!mongoDb) missing.push('MONGO_DB');

  if (missing.length > 0) {
    throw new Error(`Faltan variables de MongoDB: ${missing.join(', ')}.`);
  }

  const credentials = `${encodeURIComponent(mongoUser ?? '')}:${encodeURIComponent(
    mongoPass ?? '',
  )}`;
  const host = mongoUrl ?? '';
  const database = encodeURIComponent(mongoDb ?? '');
  return `mongodb+srv://${credentials}@${host}/${database}?appName=Cluster0`;
}

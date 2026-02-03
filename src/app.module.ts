import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './modules/app/app.controller';
import { AppService } from './modules/app/app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CharactersModule } from './modules/characters/characters.module';

function buildMongoUri(configService: ConfigService): string {
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: buildMongoUri(configService),
      }),
    }),
    AuthModule,
    CharactersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

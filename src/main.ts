import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { pingMongo } from './database/mongo.client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  await pingMongo();
  logger.log('MongoDB conectado correctamente.');
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  logger.log(`App escuchando en el puerto ${port}.`);
}
bootstrap();

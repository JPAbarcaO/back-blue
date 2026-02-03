import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ms-blue')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const mongooseConnection = app.get<Connection>(getConnectionToken());
  if (mongooseConnection.readyState === 1) {
    logger.log('MongoDB conectado correctamente.');
  } else {
    mongooseConnection.once('connected', () => logger.log('MongoDB conectado correctamente.'));
    mongooseConnection.on('error', (error) =>
      logger.error(`Error de MongoDB: ${error.message}`),
    );
  }
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  app.setGlobalPrefix('api/v1/');
  logger.log(`App escuchando en el puerto ${port}.`);
}
bootstrap();

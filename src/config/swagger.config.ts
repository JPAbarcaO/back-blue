import { DocumentBuilder } from '@nestjs/swagger';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('ms-blue')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}

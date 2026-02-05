import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule } from "@nestjs/swagger";
import { getConnectionToken } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import { AppModule } from "./app.module";
import { MongooseReadyState } from "./common/constants/mongoose.constants";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { GLOBAL_PREFIX } from "./config/app.constants";
import { buildCorsOptions } from "./config/cors.config";
import { buildSwaggerConfig } from "./config/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");
  const configService = app.get(ConfigService);

  const swaggerDocument = SwaggerModule.createDocument(app, buildSwaggerConfig());
  SwaggerModule.setup("docs", app, swaggerDocument);

  app.enableCors(buildCorsOptions(configService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  const mongooseConnection = app.get<Connection>(getConnectionToken());
  if (mongooseConnection.readyState === MongooseReadyState.connected) {
    logger.log("MongoDB conectado correctamente.");
  } else {
    mongooseConnection.once("connected", () =>
      logger.log("MongoDB conectado correctamente."),
    );
    mongooseConnection.on("error", (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Error de MongoDB: ${message}`);
    });
  }
  const port = Number(process.env.PORT ?? 3000);

  app.setGlobalPrefix(GLOBAL_PREFIX);
  await app.listen(port);

  logger.log(`App escuchando en el puerto ${port}.`);
}
void bootstrap().catch((error) => {
   
  console.error('Bootstrap error', error);
  process.exit(1);
});

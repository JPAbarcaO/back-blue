import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { getConnectionToken } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import { AppModule } from "./app.module";
import { MongooseReadyState } from "./common/constants/mongoose.constants";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  const swaggerConfig = new DocumentBuilder()
    .setTitle("ms-blue")
    .setDescription("API docs")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, swaggerDocument);

  const corsOriginsRaw = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  const corsOrigins =
    corsOriginsRaw === "*"
      ? true
      : corsOriginsRaw
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

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

  app.setGlobalPrefix("api/v1/");
  await app.listen(port);

  logger.log(`App escuchando en el puerto ${port}.`);
}
void bootstrap().catch((error) => {
   
  console.error('Bootstrap error', error);
  process.exit(1);
});

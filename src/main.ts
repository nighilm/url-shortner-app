import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from "helmet"
import * as dotenv from 'dotenv';

const logger = new Logger()
async function bootstrap() {

  const NODE_ENV: string = process.env.NODE_ENV || 'local';
  const PORT: string = process.env.PORT || "3000"
  dotenv.config({ path: `config/env/${NODE_ENV}.env` });
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle("URL shortening app")
    .setDescription("URL shortening app")
    .setVersion("1.0.0")
    .addServer(`http://localhost:${PORT}/`, 'Local environment')
    .addTag("url-shorter-app")
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)

  app.use(helmet())
  SwaggerModule.setup("api-docs", app, documentFactory)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors();
  await app.listen(PORT);
}

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error?.message || 'Unknown error');
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error?.message || 'Unknown error');
});

bootstrap();

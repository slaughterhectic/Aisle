import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Application Bootstrap
 * Initializes and starts the NestJS application.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create the application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';

  // Enable CORS
  app.enableCors({
    origin: true, // Configure properly for production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix for API
  app.setGlobalPrefix('api', {
    exclude: ['health', '/'],
  });

  // Start the server
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📡 Environment: ${nodeEnv}`);
  logger.log(`✅ Health check: http://localhost:${port}/health`);
  logger.log(`📚 API Base: http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});

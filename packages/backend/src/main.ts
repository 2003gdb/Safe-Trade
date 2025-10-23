import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvValidationService } from './common/config/env-validation.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import 'dotenv/config';

async function bootstrap() {
  // Validate required environment variables before starting the app
  EnvValidationService.validateRequiredEnvVars();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  // Set request size limits to prevent DoS attacks
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Enable CORS with specific origins (no wildcard in production)
  const corsOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.ADMIN_PORTAL_URL, process.env.IOS_APP_URL].filter((url): url is string => Boolean(url))
    : true;

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Global validation pipe with Spanish error messages
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

  // No global prefix - routes at root level

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('SafeTrade API')
    .setDescription('API de Reportes de Ciberseguridad - SafeTrade')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Autenticación', 'Endpoints de registro y login de usuarios')
    .addTag('Módulo de Usuarios', 'Gestión de perfiles de usuario')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`SafeTrade API running on port ${port}`);
  console.log(`Swagger Documentation available at http://localhost:${port}/docs`);
}

bootstrap();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Aceptar ambos frontends (participantes y manager)
  const corsOrigins = [
    process.env.FRONTEND_PARTICIPANTS_URL || 'http://localhost:3000',
    process.env.FRONTEND_MANAGER_URL || 'http://localhost:3002',
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('Farmatour5 API')
    .setDescription('API REST para la plataforma de gamificación Farmatour5')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Autenticación')
    .addTag('participants', 'Gestión de participantes')
    .addTag('groups', 'Grupos de participantes')
    .addTag('worlds', 'Mundos del juego')
    .addTag('levels', 'Niveles del juego')
    .addTag('missions', 'Misiones')
    .addTag('questions', 'Preguntas y evaluaciones')
    .addTag('progress', 'Progreso de participantes')
    .addTag('reports', 'Reportería y KPIs')
    .addTag('media', 'Biblioteca de medios')
    .addTag('config', 'Configuración del sistema')
    .addTag('users', 'Usuarios del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Farmatour5 API corriendo en: http://localhost:${port}/api`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();

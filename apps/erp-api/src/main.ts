import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cors
  app.enableCors({ origin: ['http://localhost:3001', 'http://localhost:3002'], credentials: true });

  // Validação global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('ERP Joalheria API')
    .setDescription('API do sistema ERP para joalheria - Fase 1')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API rodando em: http://localhost:${port}`);
  console.log(`📖 Swagger:        http://localhost:${port}/api/docs`);
}
bootstrap();

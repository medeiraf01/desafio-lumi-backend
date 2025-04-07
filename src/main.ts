import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HeadersValidationMiddleware } from './common/middleware/headers-validation.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração de CORS
  app.enableCors();

  // Aplicar middleware global
  app.use(function (req, res, next) {
    const middleware = new HeadersValidationMiddleware();
    middleware.use(req, res, next);
  });

  // Configuração do ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Lumi API')
    .setDescription('API para o projeto Lumi')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Iniciar o servidor
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

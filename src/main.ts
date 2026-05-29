import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
config()

const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
  .setTitle('Nebourhood Waitlist API')
  .setDescription('API documentation for Nebourhood Waitlist used for integration')
  .setVersion('1.0')
  .build();

  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: 'api-docs/json'
  });

  app.getHttpAdapter().get('/api-docs-json', (req, res) => {
    res.json(document);
  });

  app.use(
    bodyParser.urlencoded({
      limit: '10mb',
      extended: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'https://waitlist.nebourhood.org'], // allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,               // allow cookies/auth headers if needed
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in the DTO
      forbidNonWhitelisted: true, // throws error if extra properties
      transform: true, // transforms plain JSON into class instances
    }),
  );

  await app.listen(port);
}
bootstrap();

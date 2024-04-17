import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set Route Prefix to begin with /api/. E.g. localhost:3000/api
  app.setGlobalPrefix('api');

  // Enable API Version route prefix. E.g. localhost:3000/api/v1/route
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(3000);
}
bootstrap();

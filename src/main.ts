import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { validateCli } from '@1password/op-js';

// Set development configs here.
if (process.env.NODE_ENV === 'development') {
  console.log('Server starting for Development.');
}

// Validate 1Password when using start:dev_op.
if (process.env.ONEPASS === 'true') {
  console.log('1Password CLI support enabled.');
  validateCli().catch((error) => {
    throw new Error('1Password CLI is not valid:' + error.message);
  });
}

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

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { validateCli } from '@1password/op-js';
import * as session from 'express-session';
import { UnauthorizedExceptionFilter } from './filters/unauthorized-exception/unauthorized-exception.filter';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorExceptionFilter } from './filters/internalServerError-exception/internalServerError-exception.filter';
import { ExceptionFilter } from '@nestjs/common';

// Session Management - Using HTTPS?
let isSessionSecure = true;

// Set development configs here.
if (process.env.NODE_ENV === 'development') {
  console.log('Server starting for Development.');
  isSessionSecure = false;
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
  const configService = app.get(ConfigService);

  // Set Route Prefix to begin with /api/. E.g. localhost:3000/api
  app.setGlobalPrefix('api');
  // Enable API Version route prefix. E.g. localhost:3000/api/v1/route
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Session Management - This is not safe for Production.
  app.use(
    session({
      // Generate a random session secret if not provided.
      secret:
        configService.get<string>('SESSION_SECRET_KEY') ||
        crypto.randomBytes(32).toString('hex'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isSessionSecure,
        maxAge: 60 * 60 * 1000, // 1 hour
      },
    }),
  );

  const filters: ExceptionFilter<any>[] = [
    new UnauthorizedExceptionFilter(),
    new InternalServerErrorExceptionFilter(),
  ];

  filters.forEach((filter) => app.useGlobalFilters(filter));

  await app.listen(3000);
}
bootstrap();

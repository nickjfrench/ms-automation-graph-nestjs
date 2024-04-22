import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Environment
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('production'),
        PORT: Joi.number().default(3000),

        // Azure Authentication
        AZURE_TENANT_ID: Joi.string().required(),
        AZURE_CLIENT_ID: Joi.string().required(),
        AZURE_CLIENT_SECRET: Joi.string().required(),
        AZURE_REDIRECT_URI: Joi.string().required(),

        // Session Management
        SESSION_SECRET_KEY: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
      },
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService, AuthService, UserService],
})
export class AppModule {}

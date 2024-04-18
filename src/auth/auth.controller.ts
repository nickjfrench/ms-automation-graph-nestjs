import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  async login(@Res() res: Response): Promise<void> {
    const loginUrl = await this.authService.signIn();
    res.redirect(loginUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.handleRedirect(code);
    // res.json(authResponse);

    const userProfile = await this.authService.getUserProfile(
      authResponse.accessToken,
    );
    res.json({ token: authResponse, profile: userProfile });
  }
}

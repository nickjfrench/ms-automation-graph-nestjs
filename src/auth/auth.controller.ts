import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

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
    @Req() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const authResponse = await this.authService.handleRedirect(req, code);
    // res.json(authResponse);

    // const userProfile = await this.authService.getUserProfile(
    //   authResponse.accessToken,
    // );
    const redirectUrl = req.session.afterLoginRedirect || '/';
    delete req.session.afterLoginRedirect;
    res.redirect(redirectUrl);

    res.json({ token: authResponse, profile: userProfile });
  }
}

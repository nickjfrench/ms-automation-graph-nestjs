import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
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

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
    req.session.destroy((err) => {
      if (err) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send({ message: 'Error logging out: ' + err.message });
      }
    });

    res.status(HttpStatus.OK).send({ message: 'Logged out successfully.' });
  }

  @Get('callback')
  async callback(
    @Req() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.handleRedirect(req, code);

    const redirectUrl = req.session.afterLoginRedirect || '/';
    delete req.session.afterLoginRedirect;
    res.redirect(redirectUrl);
  }
}

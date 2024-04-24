import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Query,
  Req,
  Res,
} from '@nestjs/common';
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
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.authService
      .signOut(req)
      .then((status) => {
        let message = 'Logged out successfully.';

        // If the user token wasn't found, we consider the user not logged in.
        if (status === HttpStatus.BAD_REQUEST) {
          message = 'User not logged in.';
        }

        res.status(status).send({ message: message });
      })
      .catch((error) => {
        const errMessage = 'Error logging out: ' + error.message;
        throw new InternalServerErrorException(errMessage);
      });
  }

  @Get('callback')
  async callback(
    @Req() req: Request,
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.handleRedirect(req, code);

    // Get the original destination URL from the session or return '/'.
    const redirectUrl = await this.authService.getAfterLoginRedirect(req);

    // Delete AfterLoginRedirect from Session. Awaiting for Async function not required.
    this.authService.deleteAfterLoginRedirect(req);

    // Redirect user back to their original destination.
    res.redirect(redirectUrl);
  }
}

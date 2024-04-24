import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request, Response } from 'express';
import { HttpStatus } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getUserProfile(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const response = await this.userService.getUserProfile(
        req.session.token!, // Can I get this from AuthGuard
      );
      res.status(HttpStatus.OK).send(response.data);
    } catch (error) {
      const errMessage = 'Error getting user profile: ' + error.message;
      throw new InternalServerErrorException(errMessage);
    }
  }
}

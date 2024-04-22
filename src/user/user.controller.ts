import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getUserProfile(@Req() req: Request): Promise<any> {
    if (!req.session.token) {
      throw new Error('No access token found in session. Please try again.');
    }
    return this.userService.getUserProfile(req.session.token);
  }
}

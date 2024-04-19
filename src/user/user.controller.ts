import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private authService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getUserProfile(@Req() req: Request): Promise<any> {
    return this.authService.getUserProfile(req.session.token);
  }
}

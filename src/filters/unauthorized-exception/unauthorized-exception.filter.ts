import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(_exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // TODO: This needs to be moved to it's own function.
    // Validate and sanitize the afterLoginRedirect URL
    const afterLoginRedirect = request.url;
    try {
      const url = new URL(afterLoginRedirect, `http://${request.headers.host}`);
      if (url.hostname === request.hostname) {
        request.session.afterLoginRedirect = afterLoginRedirect;
      } else {
        throw new BadRequestException('Invalid redirect URL');
      }
    } catch (err) {
      request.session.afterLoginRedirect = '/';
      throw new BadRequestException('Invalid redirect URL');
    }

    // Log the error message.
    console.error(
      '401 Unauthorized: User not logged in, redirecting to login.',
    );

    // Redirect to get authorization.
    response.redirect('auth/login');
  }
}
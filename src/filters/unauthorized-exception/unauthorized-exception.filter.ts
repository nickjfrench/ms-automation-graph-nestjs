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

    // Validate and sanitize the afterLoginRedirect URL
    const afterLoginRedirect = request.url;

    // Validate the redirect URL before storing it in the session.
    if (!this.validateRedirectHostname(afterLoginRedirect, request)) {
      console.error(
        '400 Bad Request: Invalid request hostname: ' + request.hostname,
      );
      throw new BadRequestException(
        'Invalid request hostname: ' + request.hostname,
      );
    }

    request.session.afterLoginRedirect = afterLoginRedirect;

    // Log the error message.
    console.error(
      '401 Unauthorized: User not logged in, redirecting to login.',
    );

    // Redirect to get authorization.
    response.redirect('auth/login');
  }

  private validateRedirectHostname(
    afterLoginRedirectUrl: string,
    req: Request,
  ): boolean {
    // Ensure redirect URL is on the same site as the request.
    const url = new URL(afterLoginRedirectUrl, `http://${req.headers.host}`);

    if (url.hostname !== req.hostname) {
      return false;
    }

    return true;
  }
}

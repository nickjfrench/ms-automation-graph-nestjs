import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ConfidentialClientApplication,
  Configuration,
  AuthenticationResult,
} from '@azure/msal-node';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as appConfig from 'appConfig.json';

@Injectable()
export class AuthService {
  // ConfidentialClientApplication is used for WebApp and WebAPI scenarios. See MSAL-Node docs for more info.
  private msalClient: ConfidentialClientApplication;

  constructor(
    // Setting ConfigService to infer environment variables types to prevent TypeScript errors.
    private configService: ConfigService<
      {
        AZURE_CLIENT_ID: string;
        AZURE_TENANT_ID: string;
        AZURE_CLIENT_SECRET: string;
        AZURE_REDIRECT_URI: string;
      },
      true
    >,
  ) {
    const msalConfig: Configuration = {
      auth: {
        clientId: this.configService.get<string>('AZURE_CLIENT_ID', {
          // Infer the type of the environment variable from the types set in constructor. Prevents TypeScript error.
          infer: true,
        }),
        authority: `https://login.microsoftonline.com/${this.configService.get<string>('AZURE_TENANT_ID')}`,
        clientSecret: this.configService.get<string>('AZURE_CLIENT_SECRET', {
          infer: true,
        }),
      },
    };
    this.msalClient = new ConfidentialClientApplication(msalConfig);
  }

  async signIn(): Promise<string> {
    const authUrlParameters = {
      scopes: appConfig.AZURE_SCOPES,
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI', {
        infer: true,
      }),
    };

    return await this.msalClient.getAuthCodeUrl(authUrlParameters);
  }

  async handleRedirect(
    req: Request,
    code: string,
  ): Promise<AuthenticationResult> {
    const tokenRequest = {
      code: code,
      scopes: appConfig.AZURE_SCOPES,
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI', {
        infer: true,
      }),
    };

    // Code is received in the URL from Redirection URI. MSAL then handles the exchange of code for token.
    const response = await this.msalClient.acquireTokenByCode(tokenRequest);

    req.session.token = response.accessToken;

    // Log user sign in.
    if (response.account)
      console.log(response.account.username + ' sign in successful.');
    else console.log('Unknown User sign in successful.');

    return response;
  }

  async signOut(req: Request): Promise<HttpStatus> {
    return new Promise((resolve, reject) => {
      // If no token, user is not signed in.
      if (!req.session.token) resolve(HttpStatus.BAD_REQUEST);

      // Destroy user session to log out.
      req.session.destroy((err) => {
        if (err) {
          reject(new Error(err.message));
        }
      });

      resolve(HttpStatus.OK);
    });
  }

  async getAfterLoginRedirect(req: Request): Promise<string> {
    return req.session.afterLoginRedirect || '/';
  }

  async deleteAfterLoginRedirect(req: Request): Promise<void> {
    delete req.session.afterLoginRedirect;
  }
}

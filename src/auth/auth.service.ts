import { Injectable } from '@nestjs/common';
import {
  ConfidentialClientApplication,
  Configuration,
  AuthenticationResult,
} from '@azure/msal-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private msalClient: ConfidentialClientApplication;

  constructor(private configService: ConfigService) {
    const msalConfig: Configuration = {
      auth: {
        clientId: this.configService.get<string>('AZURE_CLIENT_ID'),
        authority: `https://login.microsoftonline.com/${this.configService.get<string>('AZURE_TENANT_ID')}`,
        clientSecret: this.configService.get<string>('AZURE_CLIENT_SECRET'),
      },
    };
    this.msalClient = new ConfidentialClientApplication(msalConfig);
  }

  async signIn(): Promise<string> {
    const authUrlParameters = {
      scopes: ['user.read'],
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI'),
    };

    return await this.msalClient.getAuthCodeUrl(authUrlParameters);
  }

  async handleRedirect(callbackUrl: string): Promise<AuthenticationResult> {
    const tokenRequest = {
      code: callbackUrl,
      scopes: ['user.read'],
      redirectUri: this.configService.get<string>('AZURE_REDIRECT_URI'),
    };

    return await this.msalClient.acquireTokenByCode(tokenRequest);
  }
}

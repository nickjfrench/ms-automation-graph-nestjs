import { Injectable } from '@nestjs/common';
import {
  ConfidentialClientApplication,
  Configuration,
  AuthenticationResult,
} from '@azure/msal-node';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

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

  async getUserProfile(accessToken: string): Promise<any> {
    try {
      const url = 'https://graph.microsoft.com/v1.0/me';
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response: AxiosResponse = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}

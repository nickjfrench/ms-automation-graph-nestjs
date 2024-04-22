import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class UserService {
  constructor() {}

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

import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as appConfig from 'appConfig.json';

@Injectable()
export class UserService {
  constructor() {}

  async getUserProfile(accessToken: string): Promise<AxiosResponse> {
    const url = appConfig.GRAPH_API_ROOT_URL + '/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    return axios.get(url, { headers });
  }
}

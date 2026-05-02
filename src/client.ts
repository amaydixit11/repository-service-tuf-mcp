import axios, { AxiosInstance } from 'axios';

export interface RstufClientConfig {
  baseUrl: string;
  apiToken: string;
}

export class RstufClient {
  private http: AxiosInstance;

  constructor(config: RstufClientConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any): Promise<T> {
    const response = await this.http.request<T>({
      method,
      url,
      data,
    });
    return response.data;
  }

  async getBootstrapStatus() {
    return this.request('GET', '/api/v1/bootstrap/');
  }

  async postBootstrap(payload: any) {
    return this.request('POST', '/api/v1/bootstrap/', payload);
  }

  async getTaskStatus(taskId: string) {
    return this.request('GET', `/api/v1/task/${taskId}`);
  }

  async postArtifacts(payload: any) {
    return this.request('POST', '/api/v1/artifacts/', payload);
  }

  async postMetadata(payload: any) {
    return this.request('POST', '/api/v1/metadata/', payload);
  }

  async postMetadataOnline(payload: any) {
    return this.request('POST', '/api/v1/metadata/online', payload);
  }

  async getMetadataSign() {
    return this.request('GET', '/api/v1/metadata/sign');
  }

  async postMetadataSign(payload: any) {
    return this.request('POST', '/api/v1/metadata/sign', payload);
  }

  async postMetadataSignDelete(payload: any) {
    return this.request('POST', '/api/v1/metadata/sign/delete', payload);
  }

  async putConfig(payload: any) {
    return this.request('PUT', '/api/v1/config/', payload);
  }

  async getConfig() {
    return this.request('GET', '/api/v1/config/');
  }

  async postDelegation(payload: any) {
    return this.request('POST', '/api/v1/delegations/', payload);
  }

  async putDelegation(payload: any) {
    return this.request('PUT', '/api/v1/delegations/', payload);
  }

  async postDelegationDelete(payload: any) {
    return this.request('POST', '/api/v1/delegations/delete', payload);
  }

  async postArtifactsPublish(payload: any) {
    return this.request('POST', '/api/v1/artifacts/publish', payload);
  }

  async waitForTask(taskId: string, timeout = 60000, interval = 2000): Promise<any> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await this.getTaskStatus(taskId) as any;
      if (status.state === 'SUCCESS') {
        return status.result;
      }
      if (status.state === 'FAILED') {
        throw new Error(`Task ${taskId} failed: ${status.error || 'Unknown error'}`);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(`Task ${taskId} timed out after ${timeout}ms`);
  }
}

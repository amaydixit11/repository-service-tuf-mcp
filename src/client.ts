import axios, { AxiosInstance, AxiosError } from 'axios';

export interface RstufClientConfig {
  baseUrl: string;
  apiToken: string;
}

export interface TaskResponse {
  taskId: string;
}

export interface TaskStatus {
  state: 'SUCCESS' | 'FAILED' | 'PENDING';
  result?: any;
  error?: string;
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
    try {
      const response = await this.http.request<T>({
        method,
        url,
        data,
      });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        throw new Error(detail || err.message);
      }
      throw err;
    }
  }

  async getBootstrapStatus() {
    return this.request('GET', '/api/v1/bootstrap/');
  }

  async postBootstrap(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/bootstrap/', payload);
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return this.request('GET', `/api/v1/task/${taskId}`);
  }

  async postArtifacts(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/artifacts/', payload);
  }

  async postMetadata(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/metadata/', payload);
  }

  async postMetadataOnline(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/metadata/online', payload);
  }

  async getMetadataSign() {
    return this.request('GET', '/api/v1/metadata/sign');
  }

  async postMetadataSign(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/metadata/sign', payload);
  }

  async postMetadataSignDelete(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/metadata/sign/delete', payload);
  }

  async putConfig(payload: any): Promise<TaskResponse | any> {
    return this.request('PUT', '/api/v1/config/', payload);
  }

  async getConfig() {
    return this.request('GET', '/api/v1/config/');
  }

  async postDelegation(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/delegations/', payload);
  }

  async putDelegation(payload: any): Promise<TaskResponse | any> {
    return this.request('PUT', '/api/v1/delegations/', payload);
  }

  async postDelegationDelete(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/delegations/delete', payload);
  }

  async postArtifactsPublish(payload: any): Promise<TaskResponse | any> {
    return this.request('POST', '/api/v1/artifacts/publish', payload);
  }

  async waitForTask(taskId: string, timeout = 60000, interval = 2000): Promise<any> {
    if (!taskId) {
      throw new Error('taskId is required for polling');
    }
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const status = await this.getTaskStatus(taskId);
      if (status.state === 'SUCCESS') {
        return status.result;
      }
      if (status.state === 'FAILED') {
        throw new Error(`Task ${taskId} failed: ${status.error || 'Unknown error'}`);
      }
      if (!['SUCCESS', 'FAILED', 'PENDING'].includes(status.state)) {
        throw new Error(`Task ${taskId} entered unexpected state: ${status.state}`);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(`Task ${taskId} timed out after ${timeout}ms`);
  }
}

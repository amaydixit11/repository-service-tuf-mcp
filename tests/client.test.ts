import { jest } from '@jest/globals';
import { RstufClient } from '../src/client';
import axios from 'axios';

// Complete axios mock
const mockRequest = jest.fn();
const mockAxiosInstance = {
  request: mockRequest,
};
const mockCreate = jest.fn().mockReturnValue(mockAxiosInstance);

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: mockCreate,
  },
  create: mockCreate,
}));

describe('RstufClient', () => {
  const config = { baseUrl: 'http://api.example.com', apiToken: 'test-token' };
  let client: RstufClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new RstufClient(config);
  });

  it('should call getBootstrapStatus correctly', async () => {
    const mockData = { status: 'initialized' };
    mockRequest.mockResolvedValueOnce({ data: mockData });
    
    const result = await client.getBootstrapStatus();
    expect(result).toEqual(mockData);
    expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: '/api/v1/bootstrap/',
    }));
  });

  it('should call postBootstrap with payload', async () => {
    const mockResponse = { taskId: 'task-123' };
    const payload = { repoName: 'test-repo' };
    
    mockRequest.mockResolvedValueOnce({ data: mockResponse });
    
    const result = await client.postBootstrap(payload);
    
    expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/v1/bootstrap/',
      data: payload,
    }));
    expect(result).toEqual(mockResponse);
  });
});

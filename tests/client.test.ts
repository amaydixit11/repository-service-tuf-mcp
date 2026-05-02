import { RstufClient } from '../src/client';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RstufClient', () => {
  const config = { baseUrl: 'http://api.example.com', apiToken: 'test-token' };
  let client: RstufClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new RstufClient(config);
  });

  it('should call getBootstrapStatus correctly', async () => {
    const mockData = { status: 'initialized' };
    mockedAxios.create.mockReturnValue({
      request: jest.fn().mockResolvedValue({ data: mockData }),
    } as any);

    // Need to re-instantiate because axios.create is mocked
    client = new RstufClient(config);

    const result = await client.getBootstrapStatus();
    expect(result).toEqual(mockData);
  });

  it('should call postBootstrap with payload', async () => {
    const mockResponse = { taskId: 'task-123' };
    const payload = { repoName: 'test-repo' };
    
    const mockRequest = jest.fn().mockResolvedValue({ data: mockResponse });
    mockedAxios.create.mockReturnValue({ request: mockRequest } as any);
    
    client = new RstufClient(config);
    const result = await client.postBootstrap(payload);
    
    expect(mockRequest).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/bootstrap',
      data: payload,
    }));
    expect(result).toEqual(mockResponse);
  });
});

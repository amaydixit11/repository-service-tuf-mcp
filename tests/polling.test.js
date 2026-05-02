import { jest } from '@jest/globals';
import { RstufClient } from '../src/client';
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
describe('RstufClient waitForTask', () => {
    const config = { baseUrl: 'http://api.example.com', apiToken: 'test-token' };
    let client;
    beforeEach(() => {
        jest.clearAllMocks();
        client = new RstufClient(config);
    });
    it('should resolve when task state is SUCCESS', async () => {
        mockRequest
            .mockResolvedValueOnce({ data: { state: 'PENDING' } })
            .mockResolvedValueOnce({ data: { state: 'PENDING' } })
            .mockResolvedValueOnce({ data: { state: 'SUCCESS', result: { success: true } } });
        const result = await client.waitForTask('task-123', 10000, 10);
        expect(result).toEqual({ success: true });
        expect(mockRequest).toHaveBeenCalledTimes(3);
    }, 15000);
    it('should throw when task state is FAILED', async () => {
        mockRequest.mockResolvedValueOnce({ data: { state: 'FAILED', error: 'Something went wrong' } });
        await expect(client.waitForTask('task-123', 10000, 10)).rejects.toThrow('Task task-123 failed: Something went wrong');
    });
    it('should throw when task times out', async () => {
        mockRequest.mockResolvedValue({ data: { state: 'PENDING' } });
        await expect(client.waitForTask('task-123', 100, 10)).rejects.toThrow('Task task-123 timed out after 100ms');
    });
});

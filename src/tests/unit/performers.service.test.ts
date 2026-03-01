import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../app/services/api/axios/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

import PerformersService from '../../app/services/performers.service';
import ApiClient from '../../app/services/api/axios/apiClient';
import type { Mock } from 'vitest';

const mockApiClient = ApiClient as unknown as { get: Mock };

describe('Performers Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  });

  it('should call API with default params', async () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: 1,
            firstName: 'Ana',
            lastName: 'Ramírez',
            email: 'ana@example.com',
            avatar: null,
            rating: 4.2,
            shows: 10,
            studioId: 1,
            status: 0,
            appUserId: '58bd88e9-783c-4d39-b44a-9260a70f4570',
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      },
    };
    mockApiClient.get.mockResolvedValueOnce(mockResponse as unknown);

    const res = await PerformersService.getPerformers();

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/performers', {
      params: { page: 1, limit: 10 },
    });
    expect(res).toEqual({
      items: [
        expect.objectContaining({
          id: '1',
          email: 'luis@example.com',
          rating: 4.2,
          total_shows: 10,
          studio_id: 1,
          app_user_id: '58bd88e9-783c-4d39-b44a-9260a70f4570',
        }),
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it('should pass all provided params', async () => {
    const mockResponse = {
      data: {
        data: [],
        meta: { total: 0, page: 2, limit: 5, totalPages: 0 },
      },
    };
    mockApiClient.get.mockResolvedValueOnce(mockResponse as unknown);

    const res = await PerformersService.getPerformers({
      page: 2,
      limit: 5,
      orderBy: 'rating:desc',
      where: 'alice',
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/performers', {
      params: {
        page: 2,
        limit: 5,
        order: 'desc',
        orderBy: 'rating',
        where: 'alice',
        status: 'active',
      },
    });
    expect(res).toEqual({ items: [], total: 0, page: 2, limit: 5 });
  });

  it('should propagate errors from the API client', async () => {
    const mockError = new Error('Network Error');
    mockApiClient.get.mockRejectedValueOnce(mockError);

    await expect(PerformersService.getPerformers()).rejects.toThrow('Network Error');
  });
});

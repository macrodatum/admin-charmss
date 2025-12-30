import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api/axios/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import GiftService from './gift.service';
import ApiClient from './api/axios/apiClient';
import type { Mock } from 'vitest';
import type { Gift } from '../types/gifts.types';

const mockApiClient = ApiClient as unknown as {
  get: Mock;
  post: Mock;
  patch: Mock;
  delete: Mock;
};

describe('Gift Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  });

  it('should create gift via POST with FormData', async () => {
    const file = new File(['img'], 'img.png', { type: 'image/png' });
    const fileSound = new File(['snd'], 'snd.mp3', { type: 'audio/mpeg' });
    const payload: Parameters<typeof GiftService.createGift>[0] = { name: 'Rose Bouquet', description: 'Roses', price: 100, file, fileSound };
    const resp = { data: { id: 1, ...payload, createdAt: '2025-01-01', updatedAt: '2025-01-01' } };
    mockApiClient.post.mockResolvedValueOnce(resp as unknown);

    const res = await GiftService.createGift(payload);


    // Verifica que se use FormData
    const call = mockApiClient.post.mock.calls[0];
    expect(call[0]).toBe('/api/gifts');
    expect(call[1]).toBeInstanceOf(FormData);
    expect(call[2]).toMatchObject({ headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res).toEqual(resp.data);
  });

  it('should get gifts via GET', async () => {
    const gifts: Gift[] = [{ id: 1, name: 'Rose', price: 50 }];
    mockApiClient.get.mockResolvedValueOnce({ data: gifts } as unknown);

    const res = await GiftService.getGifts();

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/gifts');
    expect(res).toEqual(gifts);
  });

  it('should get gift by name', async () => {
    const name = 'Rose';
    const gift: Gift = { id: 1, name, price: 50 };
    mockApiClient.get.mockResolvedValueOnce({ data: gift } as unknown);

    const res = await GiftService.getGiftByName(name);

    expect(mockApiClient.get).toHaveBeenCalledWith(`/api/gifts/name/${encodeURIComponent(name)}`);
    expect(res).toEqual(gift);
  });

  it('should get gift by id', async () => {
    const gift: Gift = { id: 1, name: 'Rose', price: 50 };
    mockApiClient.get.mockResolvedValueOnce({ data: gift } as unknown);

    const res = await GiftService.getGift(1);

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/gifts/1');
    expect(res).toEqual(gift);
  });

  it('should update gift via PATCH with FormData', async () => {
    const id = 1;
    const file = new File(['img'], 'img.png', { type: 'image/png' });
    const payload: Parameters<typeof GiftService.updateGift>[1] = { price: 80, file };
    const updated: Gift = { id, name: 'Rose', price: 80 };
    mockApiClient.patch.mockResolvedValueOnce({ data: updated } as unknown);

    const res = await GiftService.updateGift(id, payload);


    const call = mockApiClient.patch.mock.calls[0];
    expect(call[0]).toBe(`/api/gifts/${id}`);
    expect(call[1]).toBeInstanceOf(FormData);
    expect(call[2]).toMatchObject({ headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res).toEqual(updated);
  });

  it('should delete gift via DELETE', async () => {
    const id = 2;
    mockApiClient.delete.mockResolvedValueOnce({ status: 204 } as unknown);

    await GiftService.deleteGift(id);

    expect(mockApiClient.delete).toHaveBeenCalledWith(`/api/gifts/${id}`);
  });

  it('should fetch gifts with params', async () => {
    const gifts: Gift[] = [{ id: 1, name: 'A', price: 1 }];
    mockApiClient.get.mockResolvedValueOnce({ data: gifts } as unknown);

    const res = await GiftService.getGifts({ page: 1, perPage: 10, name: 'A' });

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/gifts', {
      params: { page: 1, perPage: 10, name: 'A' },
    });
    expect(res).toEqual(gifts);
  });

  it('should propagate errors', async () => {
    const error = new Error('Network');
    mockApiClient.get.mockRejectedValueOnce(error);

    await expect(GiftService.getGifts()).rejects.toThrow('Network');
  });
});

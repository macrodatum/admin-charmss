import ApiClient from './api/axios/apiClient';
import type {
  Gift,
  CreateGiftPayload,
  UpdateGiftPayload,
  GiftsQueryParams,
} from '../types/gifts.types';

const BASE = '/api/gifts';

class GiftService {
  async createGift(payload: CreateGiftPayload & { file?: File; fileSound?: File }): Promise<Gift> {
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      formData.append('price', String(payload.price));
      if (payload.file) formData.append('file', payload.file);
      if (payload.fileSound) formData.append('fileSound', payload.fileSound);
      const resp = await ApiClient.post<Gift>(BASE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return resp.data;
    } catch (err) {
      console.error('Error creating gift:', err);
      throw err;
    }
  }

  async getGifts(params?: GiftsQueryParams): Promise<Gift[]> {
    try {
      const query: Record<string, unknown> = {};
      if (!params) {
        const resp = await ApiClient.get<Gift[]>(BASE);
        return resp.data;
      }

      if (params.page != null) query.page = params.page;
      if (params.perPage != null) query.perPage = params.perPage;
      if (params.name != null) query.name = params.name;
      if (params.minPrice != null) query.minPrice = params.minPrice;
      if (params.maxPrice != null) query.maxPrice = params.maxPrice;

      const resp = await ApiClient.get<Gift[]>(BASE, { params: query });
      return resp.data;
    } catch (err) {
      console.error('Error fetching gifts:', err);
      throw err;
    }
  }

  async getGiftByName(name: string): Promise<Gift> {
    try {
      const resp = await ApiClient.get<Gift>(`${BASE}/name/${encodeURIComponent(name)}`);
      return resp.data;
    } catch (err) {
      console.error(`Error fetching gift by name (${name}):`, err);
      throw err;
    }
  }

  async getPriceRange(min: number, max: number): Promise<Gift[]> {
    try {
      const resp = await ApiClient.get<Gift>(`${BASE}/price-range`, { params: { min, max } });
      return resp.data as unknown as Gift[];
    } catch (err) {
      console.error(`Error fetching gifts by price-range ${min}-${max}:`, err);
      throw err;
    }
  }

  async getGift(id: number | string): Promise<Gift> {
    try {
      const resp = await ApiClient.get<Gift>(`${BASE}/${id}`);
      return resp.data;
    } catch (err) {
      console.error(`Error fetching gift ${id}:`, err);
      throw err;
    }
  }

  async updateGift(
    id: number | string,
    payload: UpdateGiftPayload & { file?: File; fileSound?: File }
  ): Promise<Gift> {
    try {
      const formData = new FormData();
      if (payload.name) formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.price !== undefined) formData.append('price', String(payload.price));
      if (payload.file) formData.append('file', payload.file);
      if (payload.fileSound) formData.append('fileSound', payload.fileSound);
      const resp = await ApiClient.patch<Gift>(`${BASE}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return resp.data;
    } catch (err) {
      console.error(`Error updating gift ${id}:`, err);
      throw err;
    }
  }

  async deleteGift(id: number | string): Promise<void> {
    try {
      await ApiClient.delete(`${BASE}/${id}`);
    } catch (err) {
      console.error(`Error deleting gift ${id}:`, err);
      throw err;
    }
  }
}

export default new GiftService();

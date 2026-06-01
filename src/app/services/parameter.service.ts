import ApiClient from './api/axios/apiClient';
import type {
  Parameter,
  CreateParameterPayload,
  UpdateParameterPayload,
} from '../types/parameter.types';

const BASE = '/api/parameter';

class ParameterService {
  private normalize(raw: unknown): Parameter {
    if (
      raw &&
      typeof raw === 'object' &&
      'data' in raw &&
      raw.data &&
      typeof raw.data === 'object'
    ) {
      return (raw as { data: Parameter }).data;
    }
    return raw as Parameter;
  }

  async createParameter(payload: CreateParameterPayload): Promise<Parameter> {
    try {
      const resp = await ApiClient.post<unknown>(BASE, payload);
      return this.normalize(resp.data);
    } catch (err) {
      console.error('Error creating parameter:', err);
      throw err;
    }
  }

  async getParameters(): Promise<Parameter[]> {
    try {
      const resp = await ApiClient.get<unknown>(`${BASE}`);
      const raw = resp.data;
      // Normaliza respuesta: array directo o { data: [...] }
      if (Array.isArray(raw)) return raw as Parameter[];
      if (raw && Array.isArray((raw as { data?: unknown }).data)) {
        return (raw as { data: Parameter[] }).data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching parameters:', err);
      throw err;
    }
  }

  async getParameterById(id: number): Promise<Parameter> {
    try {
      const resp = await ApiClient.get<Parameter>(`${BASE}/${id}`);
      return resp.data;
    } catch (err) {
      console.error(`Error fetching parameter ${id}:`, err);
      throw err;
    }
  }

  async updateParameter(id: number, payload: UpdateParameterPayload): Promise<Parameter> {
    try {
      const resp = await ApiClient.patch<unknown>(`${BASE}/${id}`, payload);
      return this.normalize(resp.data);
    } catch (err) {
      console.error(`Error updating parameter ${id}:`, err);
      throw err;
    }
  }

  async getParameterByName(name: string): Promise<Parameter | null> {
    try {
      const all = await this.getParameters();
      return all.find((p) => p.name === name) ?? null;
    } catch (err) {
      console.error(`Error fetching parameter by name "${name}":`, err);
      return null;
    }
  }

  async deleteParameter(id: number): Promise<void> {
    try {
      await ApiClient.delete(`${BASE}/${id}`);
    } catch (err) {
      console.error(`Error deleting parameter ${id}:`, err);
      throw err;
    }
  }
}

export default new ParameterService();

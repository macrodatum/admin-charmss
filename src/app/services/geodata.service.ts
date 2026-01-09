import ApiClient from './api/axios/apiClient';

export interface Country {
  isoCode: string; // e.g. 'CO'
  name: string; // e.g. 'Colombia'
  dialCode?: string | null; // e.g. '+57'
}

const BASE = '/api/geodata';

const GeodataService = {
  async listCountries(): Promise<Country[]> {
    const resp = await ApiClient.get(`${BASE}/countries?limit=250`);
    // ApiClient typically returns an axios response with a `data` payload.
    // Different APIs may wrap the array in various shapes, so normalize here.
    const payload = (resp as any).data ?? resp;

    if (Array.isArray(payload)) {
      return payload;
    }

    // Some APIs return { data: [...] } or { data: { data: [...] } }
    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }

    if (payload && payload.data && Array.isArray(payload.data.data)) {
      return payload.data.data;
    }

    // Last attempt: items
    if (payload && Array.isArray(payload.items)) {
      return payload.items;
    }

    return [];
  },
};

export default GeodataService;

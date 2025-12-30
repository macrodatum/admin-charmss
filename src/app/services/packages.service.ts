import ApiClient from './api/axios/apiClient';
import type {
  Package,
  CreatePackagePayload,
  UpdatePackagePayload,
  PackagesQueryParams,
} from '../types/packages.types';

const BASE = '/api/packages';

class PackageService {
  async createPackage(payload: CreatePackagePayload): Promise<Package> {
    try {
      const resp = await ApiClient.post<Package>(BASE, payload);
      return resp.data;
    } catch (err) {
      console.error('Error creating package:', err);
      throw err;
    }
  }

  async getPackages(params?: PackagesQueryParams): Promise<Package[]> {
    try {
      const query: Record<string, unknown> = {};
      if (!params) {
        const resp = await ApiClient.get<Package[]>(BASE);
        return resp.data;
      }

      if (params.page != null) query.page = params.page;
      if (params.perPage != null) query.perPage = params.perPage;
      if (params.name != null) query.name = params.name;
      if (params.status != null) query.status = params.status;
      if (params.minPrice != null) query.minPrice = params.minPrice;
      if (params.maxPrice != null) query.maxPrice = params.maxPrice;

      const resp = await ApiClient.get<Package[]>(BASE, { params: query });
      return resp.data;
    } catch (err) {
      console.error('Error fetching packages:', err);
      throw err;
    }
  }

  async getActivePackages(): Promise<Package[]> {
    try {
      const resp = await ApiClient.get<Package[]>(`${BASE}/active`);
      return resp.data;
    } catch (err) {
      console.error('Error fetching active packages:', err);
      throw err;
    }
  }

  async getPackagesByStatus(status: boolean): Promise<Package[]> {
    try {
      const resp = await ApiClient.get<Package[]>(`${BASE}/status/${status}`);
      return resp.data;
    } catch (err) {
      console.error(`Error fetching packages by status (${status}):`, err);
      throw err;
    }
  }

  async getPriceRange(min: number, max: number): Promise<Package[]> {
    try {
      const resp = await ApiClient.get<Package[]>(`${BASE}/price-range`, {
        params: { min, max },
      });
      return resp.data;
    } catch (err) {
      console.error(`Error fetching packages by price-range ${min}-${max}:`, err);
      throw err;
    }
  }

  async getPackagesWithBonus(): Promise<Package[]> {
    try {
      const resp = await ApiClient.get<Package[]>(`${BASE}/with-bonus`);
      return resp.data;
    } catch (err) {
      console.error('Error fetching packages with bonus:', err);
      throw err;
    }
  }

  async getPackage(id: number | string): Promise<Package> {
    try {
      const resp = await ApiClient.get<Package>(`${BASE}/${id}`);
      return resp.data;
    } catch (err) {
      console.error(`Error fetching package ${id}:`, err);
      throw err;
    }
  }

  async updatePackage(id: number | string, payload: UpdatePackagePayload): Promise<Package> {
    try {
      const resp = await ApiClient.patch<Package>(`${BASE}/${id}`, payload);
      return resp.data;
    } catch (err) {
      console.error(`Error updating package ${id}:`, err);
      throw err;
    }
  }

  async deletePackage(id: number | string): Promise<void> {
    try {
      await ApiClient.delete(`${BASE}/${id}`);
    } catch (err) {
      console.error(`Error deleting package ${id}:`, err);
      throw err;
    }
  }
}

export default new PackageService();

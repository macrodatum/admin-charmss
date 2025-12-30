import { describe, it, expect, vi, beforeEach } from 'vitest';
import PackageService from './packages.service';
import ApiClient from './api/axios/apiClient';
import type { Package } from '../types/packages.types';

vi.mock('./api/axios/apiClient');

describe('PackageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPackage: Package = {
    id: 1,
    name: 'Premium Package',
    lifeTime: 30,
    price: 99.99,
    status: true,
    bonus: 100,
    totalCredit: 1000,
    logoImage: 'https://example.com/logo.png',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('createPackage', () => {
    it('should create a package successfully', async () => {
      const payload = {
        name: 'Premium Package',
        lifeTime: 30,
        price: 99.99,
        status: true,
        bonus: 100,
        totalCredit: 1000,
        logoImage: 'https://example.com/logo.png',
      };

      vi.mocked(ApiClient.post).mockResolvedValue({ data: mockPackage } as never);

      const result = await PackageService.createPackage(payload);

      expect(ApiClient.post).toHaveBeenCalledWith('/api/packages', payload);
      expect(result).toEqual(mockPackage);
    });

    it('should throw error on create failure', async () => {
      const payload = {
        name: 'Premium Package',
        lifeTime: 30,
        price: 99.99,
        status: true,
        bonus: 100,
        totalCredit: 1000,
        logoImage: 'https://example.com/logo.png',
      };

      vi.mocked(ApiClient.post).mockRejectedValue(new Error('Network error'));

      await expect(PackageService.createPackage(payload)).rejects.toThrow('Network error');
    });
  });

  describe('getPackages', () => {
    it('should fetch all packages without params', async () => {
      const packages = [mockPackage];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: packages } as never);

      const result = await PackageService.getPackages();

      expect(ApiClient.get).toHaveBeenCalledWith('/api/packages');
      expect(result).toEqual(packages);
    });

    it('should fetch packages with query params', async () => {
      const packages = [mockPackage];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: packages } as never);

      const params = { page: 1, perPage: 10, minPrice: 50 };
      const result = await PackageService.getPackages(params);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/packages', { params });
      expect(result).toEqual(packages);
    });
  });

  describe('getActivePackages', () => {
    it('should fetch active packages', async () => {
      const packages = [mockPackage];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: packages } as never);

      const result = await PackageService.getActivePackages();

      expect(ApiClient.get).toHaveBeenCalledWith('/api/packages/active');
      expect(result).toEqual(packages);
    });
  });

  describe('getPackagesByStatus', () => {
    it('should fetch packages by status', async () => {
      const packages = [mockPackage];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: packages } as never);

      const result = await PackageService.getPackagesByStatus(true);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/packages/status/true');
      expect(result).toEqual(packages);
    });
  });

  describe('getPriceRange', () => {
    it('should fetch packages by price range', async () => {
      const packages = [mockPackage];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: packages } as never);

      const result = await PackageService.getPriceRange(50, 150);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/packages/price-range', {
        params: { min: 50, max: 150 },
      });
      expect(result).toEqual(packages);
    });
  });

  describe('getPackagesWithBonus', () => {
    it('should fetch packages with bonus', async () => {
      const packages = [mockPackage];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: packages } as never);

      const result = await PackageService.getPackagesWithBonus();

      expect(ApiClient.get).toHaveBeenCalledWith('/api/packages/with-bonus');
      expect(result).toEqual(packages);
    });
  });

  describe('getPackage', () => {
    it('should fetch a single package by ID', async () => {
      vi.mocked(ApiClient.get).mockResolvedValue({ data: mockPackage } as never);

      const result = await PackageService.getPackage(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/packages/1');
      expect(result).toEqual(mockPackage);
    });
  });

  describe('updatePackage', () => {
    it('should update a package successfully', async () => {
      const payload = { name: 'Updated Premium Package', price: 149.99 };
      const updatedPackage = { ...mockPackage, ...payload };
      vi.mocked(ApiClient.patch).mockResolvedValue({ data: updatedPackage } as never);

      const result = await PackageService.updatePackage(1, payload);

      expect(ApiClient.patch).toHaveBeenCalledWith('/api/packages/1', payload);
      expect(result).toEqual(updatedPackage);
    });
  });

  describe('deletePackage', () => {
    it('should delete a package successfully', async () => {
      vi.mocked(ApiClient.delete).mockResolvedValue({} as never);

      await PackageService.deletePackage(1);

      expect(ApiClient.delete).toHaveBeenCalledWith('/api/packages/1');
    });

    it('should throw error on delete failure', async () => {
      vi.mocked(ApiClient.delete).mockRejectedValue(new Error('Delete failed'));

      await expect(PackageService.deletePackage(1)).rejects.toThrow('Delete failed');
    });
  });
});

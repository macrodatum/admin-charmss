import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductService from './products.service';
import ApiClient from './api/axios/apiClient';
import { ProductType } from '../types/products.types';
import type { Product } from '../types/products.types';

vi.mock('./api/axios/apiClient');

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct: Product = {
    id: 1,
    name: 'Private Show',
    productType: ProductType.PRIVATE_SHOW,
    durationDays: 30,
    minPrice: 100,
    maxPrice: 500,
    defaultPrice: 150,
    editPriceInProfile: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const payload = {
        name: 'Private Show',
        productType: ProductType.PRIVATE_SHOW,
        durationDays: 30,
        minPrice: 100,
        maxPrice: 500,
        defaultPrice: 150,
        editPriceInProfile: true,
      };

      vi.mocked(ApiClient.post).mockResolvedValue({ data: mockProduct } as never);

      const result = await ProductService.createProduct(payload);

      expect(ApiClient.post).toHaveBeenCalledWith('/api/products', payload);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error on create failure', async () => {
      const payload = {
        name: 'Private Show',
        productType: ProductType.PRIVATE_SHOW,
        durationDays: 30,
        minPrice: 100,
        maxPrice: 500,
        defaultPrice: 150,
        editPriceInProfile: true,
      };

      vi.mocked(ApiClient.post).mockRejectedValue(new Error('Network error'));

      await expect(ProductService.createProduct(payload)).rejects.toThrow('Network error');
    });
  });

  describe('getProducts', () => {
    it('should fetch all products without params', async () => {
      const products = [mockProduct];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: products } as never);

      const result = await ProductService.getProducts();

      expect(ApiClient.get).toHaveBeenCalledWith('/api/products');
      expect(result).toEqual(products);
    });

    it('should fetch products with query params', async () => {
      const products = [mockProduct];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: products } as never);

      const params = { page: 1, perPage: 10, minPrice: 100 };
      const result = await ProductService.getProducts(params);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/products', { params });
      expect(result).toEqual(products);
    });
  });

  describe('getProductsByType', () => {
    it('should fetch products by type', async () => {
      const products = [mockProduct];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: products } as never);

      const result = await ProductService.getProductsByType(ProductType.PRIVATE_SHOW);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/products/type/1');
      expect(result).toEqual(products);
    });
  });

  describe('getPriceRange', () => {
    it('should fetch products by price range', async () => {
      const products = [mockProduct];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: products } as never);

      const result = await ProductService.getPriceRange(100, 500);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/products/price-range', {
        params: { min: 100, max: 500 },
      });
      expect(result).toEqual(products);
    });
  });

  describe('getEditablePriceProducts', () => {
    it('should fetch products with editable prices', async () => {
      const products = [mockProduct];
      vi.mocked(ApiClient.get).mockResolvedValue({ data: products } as never);

      const result = await ProductService.getEditablePriceProducts();

      expect(ApiClient.get).toHaveBeenCalledWith('/api/products/editable-price');
      expect(result).toEqual(products);
    });
  });

  describe('getProduct', () => {
    it('should fetch a single product by ID', async () => {
      vi.mocked(ApiClient.get).mockResolvedValue({ data: mockProduct } as never);

      const result = await ProductService.getProduct(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/products/1');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const payload = { name: 'Updated Private Show', defaultPrice: 200 };
      const updatedProduct = { ...mockProduct, ...payload };
      vi.mocked(ApiClient.patch).mockResolvedValue({ data: updatedProduct } as never);

      const result = await ProductService.updateProduct(1, payload);

      expect(ApiClient.patch).toHaveBeenCalledWith('/api/products/1', payload);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      vi.mocked(ApiClient.delete).mockResolvedValue({} as never);

      await ProductService.deleteProduct(1);

      expect(ApiClient.delete).toHaveBeenCalledWith('/api/products/1');
    });

    it('should throw error on delete failure', async () => {
      vi.mocked(ApiClient.delete).mockRejectedValue(new Error('Delete failed'));

      await expect(ProductService.deleteProduct(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('getPerformerProductByPerformerId', () => {
    it('should return performer products when endpoint returns data', async () => {
      const performerProducts = [
        { id: 1, productId: 3, performerProfileId: 1, price: 1, lastUpdate: '2025-12-31T21:28:02.721Z', state: true, productName: 'Streaming minute' },
      ];
      vi.mocked(ApiClient.get).mockImplementation((url: string) => {
        if ((url as string).includes('/performers/2/products')) {
          return Promise.resolve({ data: performerProducts } as never);
        }
        return Promise.resolve({ data: [] } as never);
      });

      const res = await ProductService.getPerformerProductByPerformerId(2);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/performers/2/products');
      expect(res).toEqual(performerProducts);
    });

    it('should fallback to configured products when performer endpoint returns empty', async () => {
      const configured = [mockProduct];
      // performer endpoint returns empty array
      vi.mocked(ApiClient.get).mockImplementation((url: string) => {
        if ((url as string).includes('/performers/3/products')) {
          return Promise.resolve({ data: [] } as never);
        }
        // /api/products
        return Promise.resolve({ data: configured } as never);
      });

      const res = await ProductService.getPerformerProductByPerformerId(3);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/performers/3/products');
      expect(ApiClient.get).toHaveBeenCalledWith('/api/products');
      expect(res).toEqual([
        {
          id: mockProduct.id,
          productId: mockProduct.id,
          performerProfileId: null,
          price: mockProduct.defaultPrice,
          lastUpdate: mockProduct.updatedAt,
          state: true,
          productName: mockProduct.name,
        },
      ]);
    });

    it('should fallback to configured products when performer endpoint errors', async () => {
      const configured = [mockProduct];
      vi.mocked(ApiClient.get).mockImplementation((url: string) => {
        if ((url as string).includes('/performers/4/products')) {
          return Promise.reject(new Error('Network error')) as never;
        }
        return Promise.resolve({ data: configured } as never);
      });

      const res = await ProductService.getPerformerProductByPerformerId(4);

      expect(ApiClient.get).toHaveBeenCalledWith('/api/performers/4/products');
      expect(ApiClient.get).toHaveBeenCalledWith('/api/products');
      expect(res.length).toBe(1);
      expect(res[0].productId).toBe(mockProduct.id);
    });
  });
});

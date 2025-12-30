import ApiClient from './api/axios/apiClient';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductsQueryParams,
} from '../types/products.types';

const BASE = '/api/products';

class ProductService {
  async createProduct(payload: CreateProductPayload): Promise<Product> {
    try {
      const resp = await ApiClient.post<Product>(BASE, payload);
      return resp.data;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  }

  async getProducts(params?: ProductsQueryParams): Promise<Product[]> {
    try {
      const query: Record<string, unknown> = {};
      if (!params) {
        const resp = await ApiClient.get<Product[]>(BASE);
        return resp.data;
      }

      if (params.page != null) query.page = params.page;
      if (params.perPage != null) query.perPage = params.perPage;
      if (params.name != null) query.name = params.name;
      if (params.productType != null) query.productType = params.productType;
      if (params.minPrice != null) query.minPrice = params.minPrice;
      if (params.maxPrice != null) query.maxPrice = params.maxPrice;
      if (params.editablePrice != null) query.editablePrice = params.editablePrice;

      const resp = await ApiClient.get<Product[]>(BASE, { params: query });
      return resp.data;
    } catch (err) {
      console.error('Error fetching products:', err);
      throw err;
    }
  }

  async getProductsByType(productType: number): Promise<Product[]> {
    try {
      const resp = await ApiClient.get<Product[]>(`${BASE}/type/${productType}`);
      return resp.data;
    } catch (err) {
      console.error(`Error fetching products by type (${productType}):`, err);
      throw err;
    }
  }

  async getPriceRange(min: number, max: number): Promise<Product[]> {
    try {
      const resp = await ApiClient.get<Product[]>(`${BASE}/price-range`, {
        params: { min, max },
      });
      return resp.data;
    } catch (err) {
      console.error(`Error fetching products by price-range ${min}-${max}:`, err);
      throw err;
    }
  }

  async getEditablePriceProducts(): Promise<Product[]> {
    try {
      const resp = await ApiClient.get<Product[]>(`${BASE}/editable-price`);
      return resp.data;
    } catch (err) {
      console.error('Error fetching editable price products:', err);
      throw err;
    }
  }

  async getProduct(id: number | string): Promise<Product> {
    try {
      const resp = await ApiClient.get<Product>(`${BASE}/${id}`);
      return resp.data;
    } catch (err) {
      console.error(`Error fetching product ${id}:`, err);
      throw err;
    }
  }

  async updateProduct(id: number | string, payload: UpdateProductPayload): Promise<Product> {
    try {
      const resp = await ApiClient.patch<Product>(`${BASE}/${id}`, payload);
      return resp.data;
    } catch (err) {
      console.error(`Error updating product ${id}:`, err);
      throw err;
    }
  }

  async deleteProduct(id: number | string): Promise<void> {
    try {
      await ApiClient.delete(`${BASE}/${id}`);
    } catch (err) {
      console.error(`Error deleting product ${id}:`, err);
      throw err;
    }
  }
}

export default new ProductService();

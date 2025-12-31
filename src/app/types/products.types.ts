export enum ProductType {
  PRIVATE_SHOW = 1,
  EXCLUSIVE_CONTENT = 2,
  CUSTOM_REQUEST = 3,
  SUBSCRIPTION = 4,
}

export interface Product {
  id: number;
  name: string;
  productType: ProductType;
  durationDays: number;
  minPrice: number;
  maxPrice: number;
  defaultPrice: number;
  editPriceInProfile: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface ProductsQueryParams {
  page?: number;
  perPage?: number;
  name?: string;
  productType?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  editablePrice?: boolean;
}

export interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PerformerProduct {
  id: number;
  productId: number;
  performerProfileId?: number | null;
  price: number;
  minPrice: number;
  maxPrice: number;
  lastUpdate?: string;
  state: boolean;
  productName?: string;
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.PRIVATE_SHOW]: 'Show Privado',
  [ProductType.EXCLUSIVE_CONTENT]: 'Contenido Exclusivo',
  [ProductType.CUSTOM_REQUEST]: 'Solicitud Personalizada',
  [ProductType.SUBSCRIPTION]: 'Suscripción',
};

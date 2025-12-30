export interface Package {
  id: number;
  name: string;
  lifeTime: number; // días
  price: number;
  status: boolean;
  bonus: number;
  totalCredit: number;
  logoImage: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePackagePayload = Omit<Package, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePackagePayload = Partial<CreatePackagePayload>;

export interface PackagesQueryParams {
  page?: number;
  perPage?: number;
  name?: string;
  status?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedPackagesResponse {
  data: Package[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const PACKAGE_STATUS_LABELS: Record<string, string> = {
  true: 'Activo',
  false: 'Inactivo',
};

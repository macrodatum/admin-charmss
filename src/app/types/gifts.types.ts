export interface Gift {
  id: number;
  name: string;
  description?: string;
  url?: string; // image url
  price: number; // in tokens
  urlSound?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateGiftPayload = Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateGiftPayload = Partial<CreateGiftPayload>;

export interface GiftsQueryParams {
  page?: number;
  perPage?: number;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
}

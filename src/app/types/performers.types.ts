export enum PerformerStatusEnum {
  Pending = 0,
  Active = 1,
  Inactive = 2,
  Suspended = 3,
}

export type PerformerStatus = PerformerStatusEnum | 'online' | 'offline';

export interface Performer {
  id: string;
  full_name: string;
  stage_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  video?: string;
  bio?: string;
  status: PerformerStatus;
  rating?: number;
  total_shows?: number;
  joined_date?: string;
  last_active?: string;
  country?: string;
  languages?: string[];
  categories?: string[];
  hourly_rate?: number;
  studio_id?: number;
  app_user_id?: string;
  performerProfile?: PerformerProfile | null;
}

// DTO returned by backend
export interface PerformerDto {
  id: number | string;
  documentId?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  gender?: number | null;
  birthDate?: string | null;
  countryCode?: string | null;
  address?: string | null;
  bankId?: number | null;
  bankAccount?: string | null;
  email?: string | null;
  phone?: string | null;
  studioId?: number | null;
  status?: number | null; // numeric status from backend
  enableWhatsAppNotifications?: boolean | null;
  telegram?: string | null;
  commissionRate?: number | null;
  appUserId?: string | null;
  avatar?: string | null;
  video?: string | null;
  rating?: number | null;
  shows?: number | null;
  performerProfile?: PerformerProfile | null;
}

export interface ApiPerformersResponse {
  data: PerformerDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetPerformersParams {
  page?: number; // Page number (1-indexed)
  limit?: number; // Items per page
  orderBy?: string | object | object[]; // Sort order: JSON like {"stage_name": "desc"} or array [{"stage_name": "desc"}, {"id": "asc"}], or short string like "stage_name:desc"
  where?: string | object; // Filter conditions (prefer JSON encoded). Examples: {"status": 1} or combined: {"OR": [{"firstName": {"contains": "john"}}, {"lastName": {"contains": "john"}}]}
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number; // número total de elementos
  page: number;
  limit: number;
}

export type GetPerformersResponse = PaginatedResponse<Performer>;

// Tipo para el perfil del performer según el JSON del endpoint
export interface PerformerProfile {
  id: number;
  performerId: number;
  countryId?: number | null;
  languages?: string | null;
  headLines?: string | null;
  showDescription?: string | null;
  turnOns?: string | null;
  expertise?: string | null;
  nickName?: string | null;
  age?: number | null;
  ethnicity?: number | null;
  sexualPreference?: number | null;
  zodiac?: number | null;
  height?: number | null;
  weight?: number | null;
  hairColor?: number | null;
  eyeColor?: number | null;
  pubicHair?: number | null;
  waist?: number | null;
  build?: number | null;
  bust?: number | null;
  bustName?: number | null;
  hips?: number | null;
  countryCode?: string | null;
  coverAssetId?: number | null;
  profileAssetId?: number | null;
  homeAssetId?: number | null;
  homeSliderOrder?: number | null;
  streamName?: string | null;
  streamId?: string | null;
  appStatus?: number | null;
  chatPhrases?: string | null;

  blockCountryOrigin?: boolean | null;
  mac?: string | null;
  mobilePhone?: string | null;
  videoAssetId?: number | null;
  videoAlbumId?: number | null;
  faceBookLink?: string | null;
  twitterLink?: string | null;
  instagramLink?: string | null;
  whatsAppNumber?: string | null;
  enableWhatsAppNotifications?: boolean | null;
  favoriteColor?: string | null;
  favoriteCandies?: string | null;
  favoriteBeverages?: string | null;
  favoriteFood?: string | null;
  favoriteMusic?: string | null;
  favoritePerfumes?: string | null;
  favoriteFashion?: string | null;
  favoriteJewells?: string | null;
  favoritePlaces?: string | null;
  hobbies?: string | null;
  favoriteMovies?: string | null;
  favoriteBooks?: string | null;
  isStreamingEnabled?: boolean | null;
  streamingSetup?: Record<string, unknown> | null;
  streamingStats?: Record<string, unknown> | null;
  followerCount?: number | null;
  totalEarnings?: string | number | null;
}

export default Performer;

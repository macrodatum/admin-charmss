export enum SupportStatusEnum {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  // Mantenemos estados legacy para compatibilidad
  IN_PROGRESS = 'IN_PROGRESS',
}

export type SupportStatus = SupportStatusEnum;

export enum RequirementTypeEnum {
  COPYRIGHT = 'Copyright',
  CONTENT_VIOLATION = 'Content Violation',
  TECHNICAL_ISSUE = 'Technical Issue',
  ACCOUNT_ISSUE = 'Account Issue',
  PAYMENT_ISSUE = 'Payment Issue',
  OTHER = 'Other',
}

export type RequirementType = RequirementTypeEnum;

export interface SupportRequest {
  id: number;
  fullName: string;
  email: string;
  requestDate: string; // ISO date string
  requirementType: RequirementType;
  notes: string;
  documentUrl?: string;
  documentKey?: string;
  status: SupportStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// DTO returned by backend
export interface SupportRequestDto {
  id: number;
  fullName: string;
  email: string;
  requestDate: string;
  requirementType: string;
  notes: string;
  documentUrl?: string | null;
  documentKey?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSupportResponse {
  data: SupportRequestDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetSupportRequestsParams {
  skip?: number; // Number of records to skip (offset)
  take?: number; // Maximum number of records to return (limit)
  orderBy?: string | object | object[]; // Sort order
  where?: string | object; // Filter conditions
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  take: number;
}

export type GetSupportRequestsResponse = PaginatedResponse<SupportRequest>;

// Interfaces for updating support requests
export interface UpdateSupportRequestData {
  fullName?: string;
  email?: string;
  requestDate?: string; // YYYY-MM-DD format
  requirementType?: RequirementType;
  status?: SupportStatus;
  notes?: string;
  file?: File; // For file upload
}

export interface UpdateSupportRequestFormData extends FormData {
  append(name: keyof UpdateSupportRequestData, value: string | Blob, fileName?: string): void;
}

export default SupportRequest;

export const AssetStatusType = {
  Pending: 0,
  UnderReview: 1,
  Approved: 2,
  Rejected: 3,
} as const;

export type AssetStatusType = (typeof AssetStatusType)[keyof typeof AssetStatusType];

export interface OnboardingData {
  notes: string | undefined;
  id: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  emailAddress: string;
  nickName: string;
  birthDate: string;
  countryCode: string;
  gender: number;
  requestDate: string;
  performerId: number;
  studioId: number;
  identificationNumber?: string | null;
  identificationType?: string | null;
  statusCardFrontFile: AssetStatusType;
  statusCardBackFile: AssetStatusType;
  statusCardFrontFaceFile: AssetStatusType;
  statusCardBackFaceFile: AssetStatusType;
  statusProfileImageFile: AssetStatusType;
  sign?: string | null;
  securityRequest?: string | null;
  requestDocuments: RequestDocument[];
  contractAcceptedByPerformer?: boolean;
  status?: RequestStatusType;
  processMessage?: string;
  sentDocuments?: boolean;
  signedContract?: boolean;
}

/**
 * Request document from backend
 */
export interface RequestDocument {
  id: number;
  requestPerformerId: number;
  fileName: string;
  documentType: DocumentType;
  documentName: string;
  loadDate: string;
}

/**
 * Request status types
 */
export const RequestStatusType = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;

export type RequestStatusType = (typeof RequestStatusType)[keyof typeof RequestStatusType];

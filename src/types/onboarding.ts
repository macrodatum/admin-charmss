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
  statusProfileVideoFile?: AssetStatusType;
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

/**
 * KYC / SecurityRequest states (normalized from backend string)
 */
export const SecurityRequestStatus = {
  Pending: 0,
  InReview: 1,
  Approved: 2,
  Declined: 3,
} as const;

export type SecurityRequestStatus = (typeof SecurityRequestStatus)[keyof typeof SecurityRequestStatus];

export type SecurityRequestState = 'Approved' | 'InReview' | 'Declined' | 'Pending' | 'Unknown';

/**
 * Normalize the backend `securityRequest` string to a known state.
 * Accepts variations in casing and common synonyms.
 */
export const normalizeSecurityRequest = (raw: string | null | undefined): SecurityRequestState => {
  if (!raw) return 'Unknown';
  const value = String(raw).trim().toLowerCase();
  if (!value) return 'Unknown';
  if (
    value === 'approved' ||
    value === 'approve' ||
    value === 'kyc_approved' ||
    value === 'verified' ||
    value === 'kycapproved'
  ) {
    return 'Approved';
  }
  if (
    value === 'inreview' ||
    value === 'in_review' ||
    value === 'in review' ||
    value === 'inprogress' ||
    value === 'in_progress' ||
    value === 'in progress' ||
    value === 'pending' ||
    value === 'underreview' ||
    value === 'under_review'
  ) {
    return 'InReview';
  }
  if (
    value === 'declined' ||
    value === 'decline' ||
    value === 'rejected' ||
    value === 'reject' ||
    value === 'kyc_declined' ||
    value === 'kycrejected' ||
    value === 'failed'
  ) {
    return 'Declined';
  }
  return 'Unknown';
};

import { AssetStatusType, OnboardingData } from '../../types/onboarding';
import apiClient from './api/axios/apiClient';

export const getOnboardingData = async (id: string | number): Promise<OnboardingData> => {
  try {
    const url = `/api/performer/onboarding/request/${id}`;
    const response = await apiClient.get<OnboardingData>(url);

    // Calculate derived fields
    const data = response.data;
    data.sentDocuments = calculateSentDocuments(data);
    data.signedContract = calculateSignedContract(data);

    return data;
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    throw error;
  }
};

/**
 * Approve or reject onboarding request by id
 */
export const decideOnboarding = async (
  id: string | number,
  statusOnboarding: number,
  notes?: string,
  documentStatuses?: Record<number, number>,
  documentNotes?: Record<number, string>,
  // New explicit per-document status fields (preferred)
  documentStatusFields?: Partial<{
    statusCardFrontFile: number;
    statusCardBackFile: number;
    statusCardFrontFaceFile: number;
    statusCardBackFaceFile: number;
    statusProfileImageFile: number;
  }>
): Promise<OnboardingData> => {
  try {
    const url = `/api/performer/onboarding/${id}/decision`;
    // Build payload and support both old map-style and new explicit fields
    const payload: Record<string, unknown> = { statusOnboarding };

    if (notes) payload.notes = notes;

    // If caller provided the explicit fields, prefer them
    if (documentStatusFields) {
      Object.assign(payload, documentStatusFields);
    } else if (documentStatuses) {
      // Map numeric documentTypes to the explicit field names expected by the API
      const map: Record<number, string> = {
        1: 'statusCardFrontFile',
        2: 'statusCardBackFile',
        3: 'statusCardFrontFaceFile',
        4: 'statusCardBackFaceFile',
        5: 'statusProfileImageFile',
      };
      Object.entries(documentStatuses).forEach(([k, v]) => {
        const key = map[Number(k)];
        if (key) payload[key] = v;
      });
    }

    if (documentNotes) payload.documentNotes = documentNotes;

    const response = await apiClient.patch<OnboardingData>(url, payload as any);

    const data = response.data;
    // Recalculate derived fields
    data.sentDocuments = calculateSentDocuments(data);
    data.signedContract = calculateSignedContract(data);

    return data;
  } catch (error) {
    console.error('Error deciding onboarding:', error);
    throw error;
  }
};

/**
 * Update the status of a specific document in an onboarding request
 */
export const updateDocumentStatus = async (
  id: string | number,
  documentType: number,
  status: number,
  notes?: string
): Promise<OnboardingData> => {
  try {
    const url = `/api/performer/onboarding/${id}/document`;
    const payload: { documentType: number; status: number; notes?: string } = {
      documentType,
      status,
    };
    if (notes) payload.notes = notes;

    const response = await apiClient.patch<OnboardingData>(url, payload);

    const data = response.data;

    // Recalculate derived fields
    data.sentDocuments = calculateSentDocuments(data);
    data.signedContract = calculateSignedContract(data);

    return data;
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

/**
 * Calculate if all documents are sent and approved
 */
export const calculateSentDocuments = (data: Partial<OnboardingData>): boolean => {
  return (
    (data.statusCardFrontFile ?? AssetStatusType.Pending) === AssetStatusType.Approved &&
    (data.statusCardBackFile ?? AssetStatusType.Pending) === AssetStatusType.Approved &&
    (data.statusCardFrontFaceFile ?? AssetStatusType.Pending) === AssetStatusType.Approved &&
    (data.statusCardBackFaceFile ?? AssetStatusType.Pending) === AssetStatusType.Approved &&
    (data.statusProfileImageFile ?? AssetStatusType.Pending) === AssetStatusType.Approved
  );
};

/**
 * Calculate if contract is signed
 */
export const calculateSignedContract = (data: Partial<OnboardingData>): boolean => {
  return !!(
    data.contractAcceptedByPerformer &&
    data.identificationNumber &&
    data.identificationNumber.trim() !== '' &&
    data.sign &&
    data.sign.trim() !== ''
  );
};

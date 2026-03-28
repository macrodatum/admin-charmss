import ApiClient from './api/axios/apiClient';
import {
  GetSupportRequestsParams,
  GetSupportRequestsResponse,
  SupportRequestDto,
  SupportRequest,
  SupportStatusEnum,
  RequirementTypeEnum,
  UpdateSupportRequestData,
} from '../types/support.types';

const BASE = '/api/service/support';

/**
 * Map backend DTO to frontend interface
 */
const mapDto = (dto: SupportRequestDto): SupportRequest => {
  // Map requirement type by value
  const requirementTypeMap: Record<string, RequirementTypeEnum> = {
    Copyright: RequirementTypeEnum.COPYRIGHT,
    'Content Violation': RequirementTypeEnum.CONTENT_VIOLATION,
    'Technical Issue': RequirementTypeEnum.TECHNICAL_ISSUE,
    'Account Issue': RequirementTypeEnum.ACCOUNT_ISSUE,
    'Payment Issue': RequirementTypeEnum.PAYMENT_ISSUE,
    Other: RequirementTypeEnum.OTHER,
  };

  // Map status by value
  const statusMap: Record<string, SupportStatusEnum> = {
    PENDING: SupportStatusEnum.PENDING,
    IN_REVIEW: SupportStatusEnum.IN_REVIEW,
    RESOLVED: SupportStatusEnum.RESOLVED,
    REJECTED: SupportStatusEnum.REJECTED,
    // Legacy states for compatibility
    IN_PROGRESS: SupportStatusEnum.IN_PROGRESS,
    CLOSED: SupportStatusEnum.CLOSED,
  };

  return {
    id: dto.id,
    fullName: dto.fullName,
    email: dto.email,
    requestDate: dto.requestDate,
    requirementType: requirementTypeMap[dto.requirementType] || RequirementTypeEnum.OTHER,
    notes: dto.notes,
    documentUrl: dto.documentUrl || undefined,
    documentKey: dto.documentKey || undefined,
    status: statusMap[dto.status] || SupportStatusEnum.PENDING,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

/**
 * Get all support requests with pagination
 */
const getSupportRequests = async (
  params: GetSupportRequestsParams = { skip: 0, take: 20 }
): Promise<GetSupportRequestsResponse> => {
  const { skip = 0, take = 20, orderBy, where } = params;

  const query: Record<string, unknown> = {
    skip,
    take,
  };

  // orderBy can be string, JSON object or array of objects
  if (orderBy) {
    if (typeof orderBy === 'string' && orderBy.includes(':')) {
      const [field, dir] = orderBy.split(':');
      query.orderBy = field;
      query.order = dir;
    } else {
      query.orderBy = typeof orderBy === 'string' ? orderBy : JSON.stringify(orderBy);
    }
  }

  // where can be string or JSON object
  if (where) {
    query.where = typeof where === 'string' ? where : JSON.stringify(where);
  }

  const response = await ApiClient.get(BASE, { params: query });

  // API devuelve un array directamente según la documentación
  const items = Array.isArray(response.data) ? response.data : [];
  const mappedItems = items.map(mapDto);

  // Como la API no devuelve meta info, calculamos los valores
  return {
    items: mappedItems,
    total: mappedItems.length, // This is a limitation - we don't get total count from API
    skip,
    take,
  } as GetSupportRequestsResponse;
};

/**
 * Get support request by ID
 */
const getSupportRequest = async (supportId: string | number): Promise<SupportRequest> => {
  if (!supportId) throw new Error('supportId required');
  const response = await ApiClient.get(`${BASE}/${supportId}`);
  const dto = response.data as SupportRequestDto;
  return mapDto(dto);
};

/**
 * Get status label for display
 */
const getStatusLabel = (status: SupportStatusEnum): string => {
  switch (status) {
    case SupportStatusEnum.PENDING:
      return 'Pendiente';
    case SupportStatusEnum.IN_REVIEW:
      return 'En Revisión';
    case SupportStatusEnum.RESOLVED:
      return 'Resuelto';
    case SupportStatusEnum.REJECTED:
      return 'Rechazado';
    // Legacy states
    case SupportStatusEnum.IN_PROGRESS:
      return 'En Progreso';
    case SupportStatusEnum.CLOSED:
      return 'Cerrado';
    default:
      return 'Desconocido';
  }
};

/**
 * Get status color for display
 */
const getStatusColor = (status: SupportStatusEnum): string => {
  switch (status) {
    case SupportStatusEnum.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case SupportStatusEnum.IN_REVIEW:
      return 'bg-blue-100 text-blue-800';
    case SupportStatusEnum.RESOLVED:
      return 'bg-green-100 text-green-800';
    case SupportStatusEnum.REJECTED:
      return 'bg-red-100 text-red-800';
    // Legacy states
    case SupportStatusEnum.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case SupportStatusEnum.CLOSED:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get requirement type label for display
 */
const getRequirementTypeLabel = (type: RequirementTypeEnum): string => {
  switch (type) {
    case RequirementTypeEnum.COPYRIGHT:
      return 'Derechos de Autor';
    case RequirementTypeEnum.CONTENT_VIOLATION:
      return 'Violación de Contenido';
    case RequirementTypeEnum.TECHNICAL_ISSUE:
      return 'Problema Técnico';
    case RequirementTypeEnum.ACCOUNT_ISSUE:
      return 'Problema de Cuenta';
    case RequirementTypeEnum.PAYMENT_ISSUE:
      return 'Problema de Pago';
    case RequirementTypeEnum.OTHER:
      return 'Otro';
    default:
      return 'Desconocido';
  }
};

/**
 * Update support request by ID
 */
const updateSupportRequest = async (
  supportId: string | number,
  data: UpdateSupportRequestData
): Promise<SupportRequest> => {
  if (!supportId) throw new Error('supportId required');

  // Create FormData for multipart/form-data
  const formData = new FormData();

  // Add only non-undefined fields to FormData
  if (data.fullName !== undefined) {
    formData.append('fullName', data.fullName);
  }
  if (data.email !== undefined) {
    formData.append('email', data.email);
  }
  if (data.requestDate !== undefined) {
    formData.append('requestDate', data.requestDate);
  }
  if (data.requirementType !== undefined) {
    formData.append('requirementType', data.requirementType);
  }
  if (data.status !== undefined) {
    formData.append('status', data.status);
  }
  if (data.notes !== undefined) {
    formData.append('notes', data.notes);
  }
  if (data.file !== undefined) {
    formData.append('file', data.file);
  }

  const response = await ApiClient.patch(`${BASE}/${supportId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const dto = response.data as SupportRequestDto;
  return mapDto(dto);
};

export default {
  getSupportRequests,
  getSupportRequest,
  updateSupportRequest,
  getStatusLabel,
  getStatusColor,
  getRequirementTypeLabel,
};

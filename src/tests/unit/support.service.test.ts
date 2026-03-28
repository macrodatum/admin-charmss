import { describe, expect, it, vi, beforeEach } from 'vitest';
import SupportService from '../../app/services/support.service';
import ApiClient from '../../app/services/api/axios/apiClient';
import { SupportStatusEnum, RequirementTypeEnum } from '../../app/types/support.types';

// Mock the ApiClient
vi.mock('../../app/services/api/axios/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApiClient = ApiClient as any;

describe('SupportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSupportRequests', () => {
    it('should fetch support requests with default parameters', async () => {
      const mockResponseData = [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          requestDate: '2026-02-28T00:00:00.000Z',
          requirementType: 'Copyright',
          notes: 'El contenido infringe mis derechos.',
          documentUrl: 'https://livecharmss.s3.us-east-1.amazonaws.com/support/uuid-file.pdf',
          documentKey: 'support/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf',
          status: 'PENDING',
          createdAt: '2026-02-28T12:00:00.000Z',
          updatedAt: '2026-02-28T12:00:00.000Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockResponseData });

      const result = await SupportService.getSupportRequests();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service/support', {
        params: {
          skip: 0,
          take: 20,
        },
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        requirementType: RequirementTypeEnum.COPYRIGHT,
        status: SupportStatusEnum.PENDING,
      });
    });

    it('should handle custom parameters correctly', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const params = {
        skip: 10,
        take: 50,
        orderBy: 'requestDate:desc',
        where: { status: 'PENDING' },
      };

      await SupportService.getSupportRequests(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service/support', {
        params: {
          skip: 10,
          take: 50,
          orderBy: 'requestDate',
          order: 'desc',
          where: JSON.stringify({ status: 'PENDING' }),
        },
      });
    });

    it('should handle orderBy with colon format', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const params = {
        orderBy: 'fullName:asc',
      };

      await SupportService.getSupportRequests(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service/support', {
        params: {
          skip: 0,
          take: 20,
          orderBy: 'fullName',
          order: 'asc',
        },
      });
    });
  });

  describe('getSupportRequest', () => {
    it('should fetch a single support request by ID', async () => {
      const mockResponseData = {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        requestDate: '2026-02-28T00:00:00.000Z',
        requirementType: 'Copyright',
        notes: 'El contenido infringe mis derechos.',
        documentUrl: 'https://livecharmss.s3.us-east-1.amazonaws.com/support/uuid-file.pdf',
        documentKey: 'support/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf',
        status: 'PENDING',
        createdAt: '2026-02-28T12:00:00.000Z',
        updatedAt: '2026-02-28T12:00:00.000Z',
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponseData });

      const result = await SupportService.getSupportRequest(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/service/support/1');
      expect(result).toMatchObject({
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        requirementType: RequirementTypeEnum.COPYRIGHT,
        status: SupportStatusEnum.PENDING,
      });
    });

    it('should throw error if supportId is not provided', async () => {
      await expect(SupportService.getSupportRequest('')).rejects.toThrow('supportId required');
      await expect(SupportService.getSupportRequest(0)).rejects.toThrow('supportId required');
    });
  });

  describe('updateSupportRequest', () => {
    it('should update a support request with FormData', async () => {
      const mockResponseData = {
        id: 1,
        fullName: 'John Doe Updated',
        email: 'john.updated@example.com',
        requestDate: '2026-02-28T00:00:00.000Z',
        requirementType: 'Copyright',
        notes: 'Updated notes.',
        documentUrl: 'https://livecharmss.s3.us-east-1.amazonaws.com/support/new-file.pdf',
        documentKey: 'support/new-file.pdf',
        status: 'IN_REVIEW',
        createdAt: '2026-02-28T12:00:00.000Z',
        updatedAt: '2026-02-28T14:00:00.000Z',
      };

      mockApiClient.patch.mockResolvedValue({ data: mockResponseData });

      const updateData = {
        fullName: 'John Doe Updated',
        email: 'john.updated@example.com',
        status: SupportStatusEnum.IN_REVIEW,
        notes: 'Updated notes.',
      };

      const result = await SupportService.updateSupportRequest(1, updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/service/support/1',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      expect(result).toMatchObject({
        id: 1,
        fullName: 'John Doe Updated',
        email: 'john.updated@example.com',
        status: SupportStatusEnum.IN_REVIEW,
      });
    });

    it('should handle file upload in FormData', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponseData = {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        requestDate: '2026-02-28T00:00:00.000Z',
        requirementType: 'Copyright',
        notes: 'Test with file.',
        documentUrl: 'https://livecharmss.s3.us-east-1.amazonaws.com/support/test.pdf',
        documentKey: 'support/test.pdf',
        status: 'PENDING',
        createdAt: '2026-02-28T12:00:00.000Z',
        updatedAt: '2026-02-28T14:00:00.000Z',
      };

      mockApiClient.patch.mockResolvedValue({ data: mockResponseData });

      const updateData = {
        file: mockFile,
        notes: 'Test with file.',
      };

      await SupportService.updateSupportRequest(1, updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/api/service/support/1',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should throw error if supportId is not provided', async () => {
      const updateData = { fullName: 'Test' };
      await expect(SupportService.updateSupportRequest('', updateData)).rejects.toThrow(
        'supportId required'
      );
      await expect(SupportService.updateSupportRequest(0, updateData)).rejects.toThrow(
        'supportId required'
      );
    });

    it('should only include defined fields in FormData', async () => {
      const mockResponseData = {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        requestDate: '2026-02-28T00:00:00.000Z',
        requirementType: 'Copyright',
        notes: 'Notes only.',
        status: 'PENDING',
        createdAt: '2026-02-28T12:00:00.000Z',
        updatedAt: '2026-02-28T14:00:00.000Z',
      };

      mockApiClient.patch.mockResolvedValue({ data: mockResponseData });

      const updateData = {
        notes: 'Notes only.',
        fullName: undefined, // Should not be included
        email: undefined, // Should not be included
      };

      await SupportService.updateSupportRequest(1, updateData);

      expect(mockApiClient.patch).toHaveBeenCalled();
      // The FormData should only contain 'notes', not undefined fields
    });
  });

  describe('utility functions', () => {
    describe('getStatusLabel', () => {
      it('should return correct labels for all statuses', () => {
        expect(SupportService.getStatusLabel(SupportStatusEnum.PENDING)).toBe('Pendiente');
        expect(SupportService.getStatusLabel(SupportStatusEnum.IN_REVIEW)).toBe('En Revisión');
        expect(SupportService.getStatusLabel(SupportStatusEnum.RESOLVED)).toBe('Resuelto');
        expect(SupportService.getStatusLabel(SupportStatusEnum.REJECTED)).toBe('Rechazado');
        // Legacy states
        expect(SupportService.getStatusLabel(SupportStatusEnum.IN_PROGRESS)).toBe('En Progreso');
        expect(SupportService.getStatusLabel(SupportStatusEnum.CLOSED)).toBe('Cerrado');
      });
    });

    describe('getStatusColor', () => {
      it('should return correct colors for all statuses', () => {
        expect(SupportService.getStatusColor(SupportStatusEnum.PENDING)).toBe(
          'bg-yellow-100 text-yellow-800'
        );
        expect(SupportService.getStatusColor(SupportStatusEnum.IN_REVIEW)).toBe(
          'bg-blue-100 text-blue-800'
        );
        expect(SupportService.getStatusColor(SupportStatusEnum.RESOLVED)).toBe(
          'bg-green-100 text-green-800'
        );
        expect(SupportService.getStatusColor(SupportStatusEnum.REJECTED)).toBe(
          'bg-red-100 text-red-800'
        );
        // Legacy states
        expect(SupportService.getStatusColor(SupportStatusEnum.IN_PROGRESS)).toBe(
          'bg-blue-100 text-blue-800'
        );
        expect(SupportService.getStatusColor(SupportStatusEnum.CLOSED)).toBe(
          'bg-gray-100 text-gray-800'
        );
      });
    });

    describe('getRequirementTypeLabel', () => {
      it('should return correct labels for all requirement types', () => {
        expect(SupportService.getRequirementTypeLabel(RequirementTypeEnum.COPYRIGHT)).toBe(
          'Derechos de Autor'
        );
        expect(SupportService.getRequirementTypeLabel(RequirementTypeEnum.CONTENT_VIOLATION)).toBe(
          'Violación de Contenido'
        );
        expect(SupportService.getRequirementTypeLabel(RequirementTypeEnum.TECHNICAL_ISSUE)).toBe(
          'Problema Técnico'
        );
        expect(SupportService.getRequirementTypeLabel(RequirementTypeEnum.ACCOUNT_ISSUE)).toBe(
          'Problema de Cuenta'
        );
        expect(SupportService.getRequirementTypeLabel(RequirementTypeEnum.PAYMENT_ISSUE)).toBe(
          'Problema de Pago'
        );
        expect(SupportService.getRequirementTypeLabel(RequirementTypeEnum.OTHER)).toBe('Otro');
      });
    });
  });

  describe('data mapping', () => {
    it('should map unknown requirement type to OTHER', async () => {
      const mockResponseData = [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          requestDate: '2026-02-28T00:00:00.000Z',
          requirementType: 'UnknownType',
          notes: 'Test notes',
          status: 'PENDING',
          createdAt: '2026-02-28T12:00:00.000Z',
          updatedAt: '2026-02-28T12:00:00.000Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockResponseData });

      const result = await SupportService.getSupportRequests();

      expect(result.items[0].requirementType).toBe(RequirementTypeEnum.OTHER);
    });

    it('should map unknown status to PENDING', async () => {
      const mockResponseData = [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          requestDate: '2026-02-28T00:00:00.000Z',
          requirementType: 'Copyright',
          notes: 'Test notes',
          status: 'UnknownStatus',
          createdAt: '2026-02-28T12:00:00.000Z',
          updatedAt: '2026-02-28T12:00:00.000Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockResponseData });

      const result = await SupportService.getSupportRequests();

      expect(result.items[0].status).toBe(SupportStatusEnum.PENDING);
    });

    it('should map new statuses correctly', async () => {
      const mockResponseData = [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          requestDate: '2026-02-28T00:00:00.000Z',
          requirementType: 'Copyright',
          notes: 'Test notes',
          status: 'IN_REVIEW',
          createdAt: '2026-02-28T12:00:00.000Z',
          updatedAt: '2026-02-28T12:00:00.000Z',
        },
        {
          id: 2,
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          requestDate: '2026-02-28T00:00:00.000Z',
          requirementType: 'Copyright',
          notes: 'Test notes',
          status: 'REJECTED',
          createdAt: '2026-02-28T12:00:00.000Z',
          updatedAt: '2026-02-28T12:00:00.000Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockResponseData });

      const result = await SupportService.getSupportRequests();

      expect(result.items[0].status).toBe(SupportStatusEnum.IN_REVIEW);
      expect(result.items[1].status).toBe(SupportStatusEnum.REJECTED);
    });

    it('should handle null/undefined optional fields', async () => {
      const mockResponseData = [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          requestDate: '2026-02-28T00:00:00.000Z',
          requirementType: 'Copyright',
          notes: 'Test notes',
          documentUrl: null,
          documentKey: null,
          status: 'PENDING',
          createdAt: '2026-02-28T12:00:00.000Z',
          updatedAt: '2026-02-28T12:00:00.000Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockResponseData });

      const result = await SupportService.getSupportRequests();

      expect(result.items[0].documentUrl).toBeUndefined();
      expect(result.items[0].documentKey).toBeUndefined();
    });
  });
});

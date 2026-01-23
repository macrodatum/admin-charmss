import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAssetUpload } from '../../hooks/useAssetUpload';
import * as imageOptimizationService from '../../app/services/image-optimization.service';
import * as s3UploadService from '../../app/services/s3Upload.service';

// Mock de los servicios
vi.mock('../../app/services/image-optimization.service');
vi.mock('../../app/services/s3Upload.service');
vi.mock('../../shared/utils/truncateAssetName', () => ({
  truncateAssetName: (name: string) => name,
}));

describe('useAssetUpload', () => {
  const mockPerformerId = 'performer-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addFiles', () => {
    it('debería añadir archivos de imagen correctamente', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([imageFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      expect(result.current.assets).toHaveLength(1);
      expect(result.current.assets[0].type).toBe('photo');
      expect(result.current.assets[0].status).toBe('pending');
      expect(result.current.assets[0].name).toBe('test.jpg');
    });

    it('debería añadir archivos de video correctamente', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
      const fileList = createFileList([videoFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      expect(result.current.assets).toHaveLength(1);
      expect(result.current.assets[0].type).toBe('video');
      expect(result.current.assets[0].status).toBe('pending');
    });

    it('debería ignorar archivos no válidos', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const textFile = new File(['text content'], 'test.txt', { type: 'text/plain' });
      const fileList = createFileList([textFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      expect(result.current.assets).toHaveLength(0);
    });

    it('debería añadir múltiples archivos válidos', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
      const fileList = createFileList([imageFile, videoFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      expect(result.current.assets).toHaveLength(2);
      expect(result.current.assets[0].type).toBe('photo');
      expect(result.current.assets[1].type).toBe('video');
    });
  });

  describe('deleteAsset', () => {
    it('debería eliminar un asset por ID', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([imageFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      const assetId = result.current.assets[0].id;

      act(() => {
        result.current.deleteAsset(assetId);
      });

      expect(result.current.assets).toHaveLength(0);
    });

    it('no debería afectar otros assets al eliminar uno', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const file1 = new File(['image1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['image2'], 'test2.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([file1, file2]);

      act(() => {
        result.current.addFiles(fileList);
      });

      const assetId = result.current.assets[0].id;

      act(() => {
        result.current.deleteAsset(assetId);
      });

      expect(result.current.assets).toHaveLength(1);
      expect(result.current.assets[0].name).toBe('test2.jpg');
    });
  });

  describe('filterAssets', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('debería filtrar assets por tipo "photo"', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
      const fileList = createFileList([imageFile, videoFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      const photos = result.current.filterAssets('photo');
      expect(photos).toHaveLength(1);
      expect(photos[0].type).toBe('photo');
    });

    it('debería filtrar assets por tipo "video"', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
      const fileList = createFileList([imageFile, videoFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      const videos = result.current.filterAssets('video');
      expect(videos).toHaveLength(1);
      expect(videos[0].type).toBe('video');
    });

    it('debería retornar todos los assets con tipo "all"', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const videoFile = new File(['video'], 'test.mp4', { type: 'video/mp4' });
      const fileList = createFileList([imageFile, videoFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      const all = result.current.filterAssets('all');
      expect(all).toHaveLength(2);
    });
  });

  describe('contadores', () => {
    it('debería calcular pendingCount correctamente', () => {
      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([imageFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      expect(result.current.pendingCount).toBe(1);
      expect(result.current.completedCount).toBe(0);
    });
  });

  describe('uploadAsset', () => {
    it('debería actualizar el estado a "uploading" al iniciar la subida', async () => {
      // Mock de los servicios
      vi.mocked(imageOptimizationService.optimizeImage).mockResolvedValue({
        optimizedFile: new File(['opt'], 'opt.jpg', { type: 'image/jpeg' }),
        thumbFile: new File(['thumb'], 'thumb.jpg', { type: 'image/jpeg' }),
        optimizedBlob: new Blob(['opt'], { type: 'image/jpeg' }),
        thumbBlob: new Blob(['thumb'], { type: 'image/jpeg' }),
      });

      vi.mocked(s3UploadService.buildFileName).mockReturnValue('test-file.jpg');
      vi.mocked(s3UploadService.getPresignedUploadUrl).mockResolvedValue({
        url: 'https://s3.example.com/presigned',
        fileName: 'test-file.jpg',
        expiresIn: 900,
        contentType: 'image/jpeg',
      });
      vi.mocked(s3UploadService.uploadToS3).mockResolvedValue({
        objectUrl: 'https://s3.example.com/uploaded-file.jpg',
        success: true,
        status: 200,
      });
      vi.mocked(s3UploadService.uploadAsset).mockResolvedValue({
        id: 'asset-123',
        fileURL: 'https://s3.example.com/final-file.jpg',
        fileURLthumb: 'https://s3.example.com/thumb.jpg',
      } as any);

      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([imageFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      const assetId = result.current.assets[0].id;

      act(() => {
        void result.current.uploadAsset(assetId);
      });

      // Verificar que cambió a 'uploading'
      await waitFor(() => {
        const asset = result.current.assets.find((a) => a.id === assetId);
        expect(asset?.status).toBe('uploading');
      });
    });

    it('debería marcar como "failed" si hay un error', async () => {
      vi.mocked(imageOptimizationService.optimizeImage).mockRejectedValue(
        new Error('Optimization failed')
      );

      const { result } = renderHook(() => useAssetUpload({ performerId: mockPerformerId }));

      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      const fileList = createFileList([imageFile]);

      act(() => {
        result.current.addFiles(fileList);
      });

      const assetId = result.current.assets[0].id;

      act(() => {
        void result.current.uploadAsset(assetId);
      });

      await waitFor(
        () => {
          const asset = result.current.assets.find((a) => a.id === assetId);
          expect(asset?.status).toBe('failed');
        },
        { timeout: 3000 }
      );
    });
  });
});

// Utilidad para crear FileList desde array de Files
function createFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
}

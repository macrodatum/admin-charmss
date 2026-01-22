import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadToS3, uploadToS3WithFetch } from '../../app/services/s3Upload.service';
import { UploadError } from '../../app/types/s3Upload.types';
import { API_CONFIG } from '../../app/config/appConfig';

describe('S3 Upload Service', () => {
  let mockFile: File;
  const mockPresignedUrl = 'https://bucket.s3.amazonaws.com/key?X-Amz-Signature=test';
  const expectedObjectUrl = 'https://bucket.s3.amazonaws.com/key';

  beforeEach(() => {
    mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  });

  describe('uploadToS3', () => {
    let mockXHR: any;
    let xhrInstances: any[];

    beforeEach(() => {
      xhrInstances = [];

      // Mock XMLHttpRequest
      mockXHR = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        upload: {
          addEventListener: vi.fn(),
        },
        addEventListener: vi.fn(),
        status: 200,
      };

      // Provide a constructor function (not a plain vi.fn) so `new XMLHttpRequest()` works
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      global.XMLHttpRequest = function () {
        xhrInstances.push(mockXHR);
        return mockXHR;
      } as unknown as typeof XMLHttpRequest;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('debería subir un archivo exitosamente', async () => {
      const uploadPromise = uploadToS3(mockFile, mockPresignedUrl);

      // Simular evento load
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'load'
      )?.[1];

      mockXHR.status = 200;
      loadHandler?.();

      const result = await uploadPromise;

      expect(result).toEqual({
        success: true,
        objectUrl: expectedObjectUrl,
        status: 200,
      });
      expect(mockXHR.open).toHaveBeenCalledWith('PUT', mockPresignedUrl);
      expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(mockXHR.send).toHaveBeenCalledWith(mockFile);
    });

    it('debería reportar progreso durante la subida', async () => {
      const onProgress = vi.fn();
      const uploadPromise = uploadToS3(mockFile, mockPresignedUrl, onProgress);

      // Simular evento de progreso
      const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'progress'
      )?.[1];

      progressHandler?.({ lengthComputable: true, loaded: 50, total: 100 });
      progressHandler?.({ lengthComputable: true, loaded: 100, total: 100 });

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);

      // Completar la subida
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'load'
      )?.[1];
      mockXHR.status = 200;
      loadHandler?.();

      await uploadPromise;
    });

    it('debería rechazar con error cuando el status es >= 400', async () => {
      const uploadPromise = uploadToS3(mockFile, mockPresignedUrl);

      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'load'
      )?.[1];

      mockXHR.status = 403;
      loadHandler?.();

      await expect(uploadPromise).rejects.toThrow(UploadError);
      await expect(uploadPromise).rejects.toThrow('Upload failed with status 403');
    });

    it('debería rechazar con error de red', async () => {
      const uploadPromise = uploadToS3(mockFile, mockPresignedUrl);

      const errorHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'error'
      )?.[1];

      errorHandler?.();

      await expect(uploadPromise).rejects.toThrow(UploadError);
      await expect(uploadPromise).rejects.toThrow('Network error during upload');

      try {
        await uploadPromise;
      } catch (error) {
        expect((error as UploadError).type).toBe('network');
      }
    });

    it('debería rechazar cuando se aborta la subida', async () => {
      const uploadPromise = uploadToS3(mockFile, mockPresignedUrl);

      const abortHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'abort'
      )?.[1];

      abortHandler?.();

      await expect(uploadPromise).rejects.toThrow(UploadError);
      await expect(uploadPromise).rejects.toThrow('Upload aborted');

      try {
        await uploadPromise;
      } catch (error) {
        expect((error as UploadError).type).toBe('abort');
      }
    });

    it('debería manejar progreso cuando no es computable', async () => {
      const onProgress = vi.fn();
      const uploadPromise = uploadToS3(mockFile, mockPresignedUrl, onProgress);

      const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'progress'
      )?.[1];

      // Progreso no computable
      progressHandler?.({ lengthComputable: false });

      expect(onProgress).not.toHaveBeenCalled();

      // Completar la subida
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'load'
      )?.[1];
      mockXHR.status = 200;
      loadHandler?.();

      await uploadPromise;
    });

    it('debería extraer correctamente la URL del objeto sin query params', async () => {
      const complexUrl =
        'https://bucket.s3.amazonaws.com/path/to/file.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=test';
      const uploadPromise = uploadToS3(mockFile, complexUrl);

      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'load'
      )?.[1];

      mockXHR.status = 204;
      loadHandler?.();

      const result = await uploadPromise;
      expect(result.objectUrl).toBe('https://bucket.s3.amazonaws.com/path/to/file.jpg');
    });
  });

  describe('uploadToS3WithFetch', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('debería subir un archivo exitosamente con fetch', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await uploadToS3WithFetch(mockFile, mockPresignedUrl);

      expect(result).toEqual({
        success: true,
        objectUrl: expectedObjectUrl,
        status: 200,
      });

      expect(global.fetch).toHaveBeenCalledWith(mockPresignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: mockFile,
      });
    });

    it('debería rechazar cuando la respuesta no es ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      try {
        await uploadToS3WithFetch(mockFile, mockPresignedUrl);
        throw new Error('Expected uploadToS3WithFetch to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(UploadError);
        expect((error as UploadError).status).toBe(403);
        expect((error as UploadError).type).toBe('server');
      }
    });

    it('debería rechazar cuando hay error de red', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network failed'));

      try {
        await uploadToS3WithFetch(mockFile, mockPresignedUrl);
        throw new Error('Expected uploadToS3WithFetch to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(UploadError);
        expect((error as UploadError).type).toBe('network');
        expect((error as UploadError).message).toContain('Network failed');
      }
    });

    it('debería manejar errores desconocidos', async () => {
      (global.fetch as any).mockRejectedValueOnce('String error');

      try {
        await uploadToS3WithFetch(mockFile, mockPresignedUrl);
        throw new Error('Expected uploadToS3WithFetch to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(UploadError);
        expect((error as UploadError).message).toContain('Unknown error');
      }
    });

    it('debería preservar UploadError cuando ya es del tipo correcto', async () => {
      const customError = new UploadError('Custom error', 500, 'server');
      (global.fetch as any).mockRejectedValueOnce(customError);

      try {
        await uploadToS3WithFetch(mockFile, mockPresignedUrl);
      } catch (error) {
        expect(error).toBe(customError);
        expect((error as UploadError).status).toBe(500);
        expect((error as UploadError).type).toBe('server');
      }
    });

    it('debería extraer correctamente la URL del objeto', async () => {
      const complexUrl =
        'https://bucket.s3.amazonaws.com/uploads/image.png?signature=xyz&expires=123';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await uploadToS3WithFetch(mockFile, complexUrl);
      expect(result.objectUrl).toBe('https://bucket.s3.amazonaws.com/uploads/image.png');
    });

    it('debería manejar un JSON mal formado al pedir la URL prefirmada', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(async () => {
        // Importar aquí para evitar ordenar los mocks de fetch antes de las pruebas de XHR
        const { getPresignedUploadUrl } = await import('../../app/services/s3Upload.service');
        await getPresignedUploadUrl('image/jpeg', 900);
      }).rejects.toThrow('Failed to get presigned URL');
    });
  });

  describe('Presigned URL endpoint', () => {
    const presignedEndpoint = `${API_CONFIG.BASE_URL.replace(
      /\/$/,
      ''
    )}/api/asset/presigned-upload-url`;

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('debería obtener una URL prefirmada exitosamente', async () => {
      const responseBody = {
        url: 'https://charmss-bucket.s3.us-east-1.amazonaws.com/a.jpg?X-TEST=1',
        fileName: 'a.jpg',
        expiresIn: 900,
        contentType: 'image/jpeg',
      };

      (global.fetch as any) = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseBody,
      });

      const { getPresignedUploadUrl } = await import('../../app/services/s3Upload.service');

      const result = await getPresignedUploadUrl('image/jpeg', 900);

      expect(global.fetch).toHaveBeenCalledWith(presignedEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/jpeg', expiresIn: 900 }),
      });

      // Además, devolver la respuesta esperada
      expect(result).toEqual(responseBody);

      // Cuando enviamos fileName, debe incluirse en el body
      const mockFileName = 'image/1/12345.jpg';
      (global.fetch as any) = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseBody,
      });

      await getPresignedUploadUrl('image/jpeg', 900, mockFileName);

      expect(global.fetch).toHaveBeenCalledWith(presignedEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/jpeg', expiresIn: 900, fileName: mockFileName }),
      });
    });

    describe('buildFileName', () => {
      it('genera path válido para imágenes con extensión', async () => {
        const { buildFileName } = await import('../../app/services/s3Upload.service');
        const file = new File(['a'], 'pic.JPG', { type: 'image/jpeg' });
        const res = buildFileName(file, 'photo', 1);
        expect(res).toMatch(/^images\/1\/\d+-[a-z0-9]{9}\.jpg$/);
      });

      it('devuelve null para extensiones no soportadas', async () => {
        const { buildFileName } = await import('../../app/services/s3Upload.service');
        const file = new File(['a'], 'doc.pdf', { type: 'application/pdf' });
        const res = buildFileName(file, 'photo', 1);
        expect(res).toBeNull();
      });

      it('mapea el mime a ext cuando no hay extensión', async () => {
        const { buildFileName } = await import('../../app/services/s3Upload.service');
        const file = new File(['a'], 'file', { type: 'video/mp4' });
        const res = buildFileName(file, 'video', 'p');
        expect(typeof res).toBe('string');
        expect(res as string).toMatch(/^videos\/p\/\d+-[a-z0-9]{9}\.mp4$/);
      });
    });

    it('debería lanzar UploadError cuando el endpoint responde con error y payload de error', async () => {
      const errorBody = {
        statusCode: 400,
        message: 'Presigned upload URLs are only supported with S3 provider',
        error: 'Bad Request',
      };

      (global.fetch as any) = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorBody,
      });

      const { getPresignedUploadUrl } = await import('../../app/services/s3Upload.service');

      await expect(getPresignedUploadUrl('image/jpeg', 900)).rejects.toThrow(
        'Presigned upload URLs are only supported with S3 provider'
      );
    });

    it('debería lanzar UploadError en caso de fallo de red', async () => {
      (global.fetch as any) = vi.fn().mockRejectedValueOnce(new Error('Network failure'));

      const { getPresignedUploadUrl } = await import('../../app/services/s3Upload.service');

      await expect(getPresignedUploadUrl('image/jpeg', 900)).rejects.toThrow(
        'Failed to get presigned URL'
      );
    });
  });

  describe('uploadAsset (register asset)', () => {
    it('debería registrar un asset exitosamente', async () => {
      const mockResp = {
        id: 77,
        fileName: 'file.jpg',
        fileURL: 'https://s3.test/file.jpg',
        contentType: 'image/jpeg',
        assetType: 'photo',
        createdAt: new Date().toISOString(),
      };

      // mock ApiClient.post
      const ApiClient = await import('../../app/services/api/axios/apiClient');
      vi.spyOn(ApiClient, 'default').mockImplementation(() => ({ post: vi.fn() } as any));

      // Instead of spying on default, mock post directly
      (ApiClient as any).default.post = vi.fn().mockResolvedValueOnce({ data: mockResp });

      const { uploadAsset } = await import('../../app/services/s3Upload.service');
      const payload = {
        fileURL: 'https://s3.test/images/1/file.jpg',
        fileURLthumb: 'https://s3.test/images/1/thumbs/file-thumb.jpg',
        contentType: 'image/jpeg',
        size: 100,
        assetType: 'photo' as const,
        performerId: 1,
        assetName: 'file.jpg',
      };

      const res = await uploadAsset(payload);
      expect((ApiClient as any).default.post).toHaveBeenCalledWith(
        '/api/asset/with-uploaded-file',
        {
          assetName: 'file.jpg',
          assetType: 1,
          price: 0,
          fileName: 'images/1/file.jpg',
          fileNameThumb: 'images/1/thumbs/file-thumb.jpg',
        },
        { params: { performerId: 1 } }
      );
      expect(res).toEqual(mockResp);
    });

    it('debería lanzar UploadError si el servidor responde con error', async () => {
      const ApiClient = await import('../../app/services/api/axios/apiClient');
      (ApiClient as any).default.post = vi.fn().mockRejectedValueOnce({
        response: { data: { message: 'Bad', statusCode: 400 }, status: 400 },
      });

      const { uploadAsset } = await import('../../app/services/s3Upload.service');
      const payload = {
        fileName: 'file.jpg',
        fileURL: 'https://s3.test/file.jpg',
        contentType: 'image/jpeg',
        size: 100,
        assetType: 'photo' as const,
        performerId: 1,
      };

      try {
        await uploadAsset(payload);
        throw new Error('Expected uploadAsset to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(UploadError);
        expect((error as UploadError).message).toContain('Bad');
      }
    });
  });

  describe('UploadError', () => {
    it('debería crear un error con todos los parámetros', () => {
      const error = new UploadError('Test error', 404, 'server');

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.type).toBe('server');
      expect(error.name).toBe('UploadError');
      expect(error instanceof Error).toBe(true);
    });

    it('debería crear un error sin parámetros opcionales', () => {
      const error = new UploadError('Simple error');

      expect(error.message).toBe('Simple error');
      expect(error.status).toBeUndefined();
      expect(error.type).toBeUndefined();
    });
  });
});

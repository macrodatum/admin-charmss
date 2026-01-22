import type {
  UploadResult,
  ProgressCallback,
  PresignedUrlRequest,
  PresignedUrlResponse,
  PresignedUrlErrorResponse,
} from '../types/s3Upload.types';
import { UploadError } from '../types/s3Upload.types';
import ApiClient from './api/axios/apiClient';
import { API_CONFIG } from '../config/appConfig';
import type { UploadAssetRequest, UploadAssetResponse } from '../types/s3Upload.types';

/**
 * Sube un archivo a S3 usando una URL prefirmada con XMLHttpRequest
 * Permite monitorear el progreso de subida
 *
 * @param file - El archivo a subir
 * @param presignedUrl - URL prefirmada obtenida del backend
 * @param onProgress - Callback opcional para recibir actualizaciones de progreso
 * @returns Promise con el resultado de la subida
 */
export const uploadToS3 = async (
  file: File,
  presignedUrl: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Monitorear el progreso de subida
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        if (onProgress) {
          onProgress(percentComplete);
        }
      }
    });

    // Manejar la finalización exitosa
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // La URL del objeto es la URL prefirmada sin los query parameters
        const objectUrl = presignedUrl.split('?')[0];
        resolve({
          success: true,
          objectUrl,
          status: xhr.status,
        });
      } else {
        reject(new UploadError(`Upload failed with status ${xhr.status}`, xhr.status, 'server'));
      }
    });

    // Manejar errores
    xhr.addEventListener('error', () => {
      reject(new UploadError('Network error during upload', undefined, 'network'));
    });

    xhr.addEventListener('abort', () => {
      reject(new UploadError('Upload aborted', undefined, 'abort'));
    });

    // Configurar y enviar la petición
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Sube un archivo a S3 usando fetch API (sin soporte de progreso)
 * Alternativa más moderna pero sin capacidad de monitorear el progreso
 *
 * @param file - El archivo a subir
 * @param presignedUrl - URL prefirmada obtenida del backend
 * @returns Promise con el resultado de la subida
 */
export const uploadToS3WithFetch = async (
  file: File,
  presignedUrl: string
): Promise<UploadResult> => {
  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new UploadError(
        `Upload failed with status ${response.status}`,
        response.status,
        'server'
      );
    }

    // Obtener la URL del objeto
    const objectUrl = presignedUrl.split('?')[0];

    return {
      success: true,
      objectUrl,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError(
      `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'network'
    );
  }
};

// Helper para construir la clave/filename en S3
export const buildFileName = (
  file: File,
  assetType: 'photo' | 'video',
  performerId?: number | string,
  isThumb: boolean = false
): string | null => {
  const allowedImageExt = ['jpg', 'jpeg', 'png', 'gif'];
  const allowedVideoExt = ['mp4'];

  const originalExt = (file.name.split('.').pop() || '').toLowerCase();
  let ext = originalExt;

  // If the extension is not recognized for the asset type, try to infer it from the MIME type
  if (assetType === 'photo' && !allowedImageExt.includes(ext)) {
    if (file.type === 'image/jpeg') ext = 'jpg';
    else if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/gif') ext = 'gif';
  }

  if (assetType === 'video' && !allowedVideoExt.includes(ext)) {
    if (file.type === 'video/mp4') ext = 'mp4';
  }

  if (assetType === 'photo' && !allowedImageExt.includes(ext)) return null;
  if (assetType === 'video' && !allowedVideoExt.includes(ext)) return null;

  const randomName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
  const prefix = assetType === 'photo' ? 'images' : 'videos';
  const pid = performerId ?? 'unknown';
  if (isThumb) return `${prefix}/${pid}/thumbs/${randomName}`;
  else return `${prefix}/${pid}/${randomName}`;
};

/**
 * Obtiene una URL prefirmada para subir un archivo a S3
 *
 * @param contentType - Tipo MIME del archivo (ej: 'image/jpeg', 'video/mp4')
 * @param expiresIn - Tiempo de expiración en segundos (por defecto 900)
 * @returns Promise con la respuesta de URL prefirmada
 * @throws UploadError si la solicitud falla
 */
export const getPresignedUploadUrl = async (
  contentType: string,
  expiresIn: number = 900,
  fileName?: string
): Promise<PresignedUrlResponse> => {
  try {
    const requestBody: PresignedUrlRequest = {
      contentType,
      expiresIn,
      ...(fileName ? { fileName } : {}),
    };

    const baseUrl = (import.meta.env.VITE_API_URL ?? API_CONFIG.BASE_URL ?? '').replace(/\/$/, '');
    const endpoint = baseUrl
      ? `${baseUrl}/api/asset/presigned-upload-url`
      : '/api/asset/presigned-upload-url';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as PresignedUrlErrorResponse;
      throw new UploadError(
        errorData.message || 'Failed to get presigned URL',
        errorData.statusCode || response.status,
        'server'
      );
    }

    return data as PresignedUrlResponse;
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError(
      `Failed to get presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      'network'
    );
  }
};

/**
 * Registra el asset en el backend (debe llamarse después de subir a S3)
 * @param payload - Datos del asset (puede ser el shape antiguo o el nuevo simplificado)
 * @param performerId - Id del performer que se enviará como query param
 * @returns respuesta del backend con datos del asset creado
 */
export const uploadAsset = async (
  payload: UploadAssetRequest,
  performerId?: number | string
): Promise<UploadAssetResponse> => {
  try {
    // Allow performerId either as explicit arg or in payload
    const pid = performerId ?? payload.performerId;

    const getKeyFromUrl = (url?: string) => {
      if (!url) return undefined;
      try {
        const u = new URL(url);
        return u.pathname.replace(/^\//, '');
      } catch {
        // If url is not a full URL, assume it's already an object key
        return url;
      }
    };

    const fileName = payload.fileName ?? getKeyFromUrl(payload.fileURL);
    const fileNameThumb = payload.fileNameThumb ?? getKeyFromUrl(payload.fileURLthumb);

    if (!fileName) {
      throw new UploadError('Missing fileName or fileURL', undefined, 'server');
    }

    const assetTypeNumber =
      typeof payload.assetType === 'number'
        ? payload.assetType
        : payload.assetType === 'photo'
        ? 1
        : 2;

    const body = {
      assetName: payload.assetName ?? fileName.split('/').pop(),
      assetType: assetTypeNumber,
      price: payload.price ?? 0,
      fileName,
      ...(fileNameThumb ? { fileNameThumb } : {}),
    };

    const resp = await ApiClient.post<UploadAssetResponse>('/api/asset/with-uploaded-file', body, {
      params: { performerId: pid },
    });

    return resp.data;
  } catch (err: any) {
    // Si el servidor responde con un error estructurado, tratarlo
    const message = err?.response?.data?.message || err?.message || 'Failed to register asset';
    const status = err?.response?.status;
    throw new UploadError(message, status, 'server');
  }
};

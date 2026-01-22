/**
 * Resultado de la subida a S3
 */
export interface UploadResult {
  success: boolean;
  objectUrl: string;
  status: number;
}

/**
 * Callback para reportar el progreso de subida
 */
export type ProgressCallback = (percentComplete: number) => void;

/**
 * Opciones para la subida de archivos
 */
export interface UploadOptions {
  file: File;
  presignedUrl: string;
  onProgress?: ProgressCallback;
}

/**
 * Error personalizado para subidas fallidas
 */
export class UploadError extends Error {
  constructor(
    message: string,
    public status?: number,
    public type?: 'network' | 'abort' | 'server'
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

/**
 * Parámetros para solicitar una URL prefirmada
 */
export interface PresignedUrlRequest {
  contentType: string;
  expiresIn: number;
  fileName?: string; // optional desired object key/path
}

/**
 * Respuesta exitosa al solicitar una URL prefirmada
 */
export interface PresignedUrlResponse {
  url: string;
  fileName: string;
  expiresIn: number;
  contentType: string;
}

/**
 * Respuesta de error al solicitar una URL prefirmada
 */
export interface PresignedUrlErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

/**
 * Payload para registrar el asset en el backend después de subir a S3
 *
 * Nota: la API espera un body simplificado cuando se usa el endpoint
 * `/api/asset/with-uploaded-file` (el backend completará el resto):
 * {
 *   assetName: string,
 *   assetType: number, // 1=image, 2=video
 *   price: number,
 *   fileName: string,
 *   fileNameThumb?: string
 * }
 *
 * Para compatibilidad, también aceptamos el shape antiguo que contiene
 * `fileURL` / `fileURLthumb` y convertimos automáticamente.
 */
export interface UploadAssetRequest {
  // New simplified fields sent to the backend
  assetName?: string;
  assetType?: 'photo' | 'video' | number;
  price?: number;
  fileName?: string; // S3 object key like 'images/123/abc.jpg'
  fileNameThumb?: string;

  // Backwards-compatible fields (the service will derive fileName from these)
  fileURL?: string;
  fileURLthumb?: string;
  contentType?: string;
  size?: number;
  performerId?: number | string;
}

/**
 * Respuesta del backend al registrar un asset
 */
export interface UploadAssetResponse {
  id: number | string;
  fileName: string;
  fileURL: string;
  contentType: string;
  assetType: 'photo' | 'video';
  createdAt?: string;
}

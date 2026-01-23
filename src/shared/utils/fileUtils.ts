/**
 * Formatea el tamaño de un archivo en bytes a una representación legible
 * @param bytes - Tamaño del archivo en bytes
 * @returns String formateado (ej: "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Genera un ID único para un asset
 * @returns ID alfanumérico único
 */
export const generateAssetId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Verifica si un archivo es una imagen
 * @param file - Archivo a verificar
 * @returns true si es imagen, false en caso contrario
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Verifica si un archivo es un video
 * @param file - Archivo a verificar
 * @returns true si es video, false en caso contrario
 */
export const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

/**
 * Valida si un archivo es de un tipo aceptado (imagen o video)
 * @param file - Archivo a validar
 * @returns true si es un tipo válido, false en caso contrario
 */
export const isValidFileType = (file: File): boolean => {
  return isImageFile(file) || isVideoFile(file);
};

/**
 * Crea una URL temporal para previsualización de un archivo
 * @param file - Archivo para crear URL
 * @returns URL de objeto temporal
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

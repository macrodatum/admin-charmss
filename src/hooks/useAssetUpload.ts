import { useState, useCallback } from 'react';
import { truncateAssetName } from '../shared/utils/truncateAssetName';
import { optimizeImage } from '../app/services/image-optimization.service';
import {
  buildFileName,
  getPresignedUploadUrl,
  uploadToS3,
  uploadAsset,
} from '../app/services/s3Upload.service';
import {
  formatFileSize,
  generateAssetId,
  isImageFile,
  isValidFileType,
  createPreviewUrl,
} from '../shared/utils/fileUtils';

export interface Asset {
  id: string;
  type: 'photo' | 'video';
  url: string;
  name: string;
  size: string;
  uploadedAt: Date;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  file?: File;
}

interface UseAssetUploadProps {
  performerId?: string;
}

interface UseAssetUploadReturn {
  assets: Asset[];
  addFiles: (files: FileList) => void;
  uploadAsset: (assetId: string) => Promise<void>;
  uploadAllPending: () => void;
  deleteAsset: (assetId: string) => void;
  filterAssets: (type: 'all' | 'photo' | 'video') => Asset[];
  pendingCount: number;
  completedCount: number;
}

/**
 * Hook personalizado para manejar la lógica de carga y gestión de assets
 *
 * Este hook encapsula toda la lógica compleja relacionada con:
 * - Gestión del estado de los assets
 * - Procesamiento y optimización de archivos
 * - Subida a S3 con URLs prefirmadas
 * - Registro de assets en el backend
 *
 * @param performerId - ID del performer al que pertenecen los assets
 * @returns Objeto con estado y métodos para gestionar assets
 */
export const useAssetUpload = ({ performerId }: UseAssetUploadProps): UseAssetUploadReturn => {
  const [assets, setAssets] = useState<Asset[]>([]);

  /**
   * Procesa y añade nuevos archivos al estado
   * Crea objetos Asset temporales con URLs de previsualización
   */
  const addFiles = useCallback((files: FileList) => {
    const newAssets: Asset[] = [];

    Array.from(files).forEach((file) => {
      if (!isValidFileType(file)) {
        return;
      }

      const assetId = generateAssetId();
      const asset: Asset = {
        id: assetId,
        type: isImageFile(file) ? 'photo' : 'video',
        url: createPreviewUrl(file),
        name: truncateAssetName(file.name, 50),
        size: formatFileSize(file.size),
        uploadedAt: new Date(),
        status: 'pending',
        file,
      };

      newAssets.push(asset);
    });

    setAssets((prev) => [...prev, ...newAssets]);
  }, []);

  /**
   * Actualiza el estado de un asset específico
   */
  const updateAssetStatus = useCallback((assetId: string, updates: Partial<Asset>) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, ...updates } : a)));
  }, []);

  /**
   * Sube un asset individual a S3 y lo registra en el backend
   *
   * Proceso:
   * 1. Optimiza la imagen (si aplica) y genera thumbnail
   * 2. Obtiene URLs prefirmadas para subida
   * 3. Sube archivo y thumbnail a S3
   * 4. Registra el asset en el backend
   * 5. Actualiza el estado del asset
   */
  const uploadAssetById = useCallback(
    async (assetId: string) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset || !asset.file) {
        return;
      }

      updateAssetStatus(assetId, { status: 'uploading' });

      try {
        const isImage = asset.type === 'photo';
        const assetTypeForPath: 'photo' | 'video' = isImage ? 'photo' : 'video';

        let fileToUpload: File = asset.file;
        let thumbToUpload: File = asset.file;

        // Optimizar imagen si corresponde
        if (isImage) {
          try {
            const { optimizedFile, thumbFile } = await optimizeImage(asset.file);
            if (optimizedFile) fileToUpload = optimizedFile;
            if (thumbFile) thumbToUpload = thumbFile;
          } catch (optErr) {
            console.warn('Image optimization failed, proceeding with original file', optErr);
          }
        }

        // Generar nombres de archivo
        const generatedFileName = buildFileName(fileToUpload, assetTypeForPath, performerId);
        const generatedThumbFileName = buildFileName(
          thumbToUpload,
          assetTypeForPath,
          performerId,
          true
        );

        if (!generatedFileName || !generatedThumbFileName) {
          throw new Error('Failed to generate file names');
        }

        // Obtener URLs prefirmadas
        const { url: presignedUrl, fileName } = await getPresignedUploadUrl(
          fileToUpload.type,
          900,
          generatedFileName
        );

        const { url: presignedThumbUrl } = await getPresignedUploadUrl(
          thumbToUpload.type,
          900,
          generatedThumbFileName
        );

        // Subir archivos a S3
        const { objectUrl } = await uploadToS3(fileToUpload, presignedUrl, () => {
          // Progress callback si es necesario
        });

        const { objectUrl: objectThumbUrl } = await uploadToS3(
          thumbToUpload,
          presignedThumbUrl,
          () => {
            // Progress callback si es necesario
          }
        );

        // Registrar asset en backend
        const uploadPayload = {
          fileName,
          fileURLthumb: objectThumbUrl,
          fileURL: objectUrl,
          contentType: fileToUpload.type,
          size: fileToUpload.size,
          assetType: assetTypeForPath,
          performerId,
          assetName: asset.name,
        };

        const registered = await uploadAsset(uploadPayload);

        updateAssetStatus(assetId, {
          status: 'completed',
          url: registered.fileURL,
        });
      } catch (err) {
        console.error('Asset upload failed', err);
        updateAssetStatus(assetId, { status: 'failed' });
      }
    },
    [assets, performerId, updateAssetStatus]
  );

  /**
   * Sube todos los assets pendientes
   */
  const uploadAllPending = useCallback(() => {
    const pending = assets.filter((a) => a.status === 'pending');
    pending.forEach((a) => {
      void uploadAssetById(a.id);
    });
  }, [assets, uploadAssetById]);

  /**
   * Elimina un asset del estado
   */
  const deleteAsset = useCallback((assetId: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  }, []);

  /**
   * Filtra assets por tipo
   */
  const filterAssets = useCallback(
    (type: 'all' | 'photo' | 'video'): Asset[] => {
      if (type === 'all') return assets;
      return assets.filter((asset) => asset.type === type);
    },
    [assets]
  );

  // Contadores útiles
  const pendingCount = assets.filter((a) => a.status === 'pending').length;
  const completedCount = assets.filter((a) => a.status === 'completed').length;

  return {
    assets,
    addFiles,
    uploadAsset: uploadAssetById,
    uploadAllPending,
    deleteAsset,
    filterAssets,
    pendingCount,
    completedCount,
  };
};

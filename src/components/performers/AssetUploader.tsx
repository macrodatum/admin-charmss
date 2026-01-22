import React, { useState } from 'react';
import { X, Upload, Image, Video, Trash2, Eye, CheckCircle } from 'lucide-react';
import { Performer } from '../../app/types/performers.types';
import {
  getPresignedUploadUrl,
  uploadToS3,
  buildFileName,
} from '../../app/services/s3Upload.service';
import { optimizeImage } from '../../app/services/image-optimization.service';
interface AssetUploaderProps {
  performer: Performer | null;
  onClose: () => void;
}

interface Asset {
  id: string;
  type: 'photo' | 'video';
  url: string;
  name: string;
  size: string;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'failed';
}

export default function AssetUploader({ performer, onClose }: AssetUploaderProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'photo' | 'video'>('all');

  if (!performer) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  /**
   * handleFiles
   *
   * Acciones realizadas (enumeradas):
   * 1) Convertir `FileList` en arreglo e iterar cada archivo.
   * 2) Detectar si el archivo es imagen o video; ignorar otros tipos.
   * 3) Crear un `asset` temporal en estado `uploading` y mostrarlo en la UI para seguimiento.
   * 4) Iniciar un proceso asíncrono por archivo que realiza:
   *    4.1) Optimización de imagen y generación de thumbnail (si corresponde).
   *    4.2) Construcción de nombres de archivo para S3 (original y thumbnail).
   *    4.3) Solicitud de URLs prefirmadas al backend usando los nombres generados.
   *    4.4) Subida del archivo y del thumbnail a S3 con seguimiento de progreso.
   *    4.5) Registro del asset en el backend (metadata y URLs definitivas).
   *    4.6) (Opcional) Registrar y añadir thumbnail como asset separado en la UI.
   *    4.7) Actualizar el asset temporal en el estado local con la URL real y marcarlo `completed`.
   * 5) Capturar errores en cualquier paso y marcar el asset como `failed` si ocurre un fallo.
   * 6) Finalmente, añadir todos los assets temporales al estado local (`setAssets`) para iniciar el flujo de subida.
   */
  const handleFiles = (files: FileList) => {
    // 1) Preparar array para assets temporales que se mostrarán inmediatamente en la UI
    const newAssets: Asset[] = [];

    // 2) Iterar cada archivo del FileList
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      // 2.1) Solo procesar imágenes y videos
      if (isImage || isVideo) {
        // 3) Generar ID y objeto asset temporal en estado 'uploading'
        const assetId = Math.random().toString(36).substr(2, 9);
        const asset: Asset = {
          id: assetId,
          type: isImage ? 'photo' : 'video',
          url: URL.createObjectURL(file), // URL local para previsualización
          name: file.name,
          size: formatFileSize(file.size),
          uploadedAt: new Date(),
          status: 'uploading',
        };

        newAssets.push(asset);

        // 4) Iniciar flujo de subida/registro en background (IIFE async para cada archivo)
        (async () => {
          try {
            const assetTypeForPath: 'photo' | 'video' = isImage ? 'photo' : 'video';

            // 4.1) Preparar archivos a subir: intentar optimizar imagen y generar thumbnail
            let fileToUpload: File = file;
            let thumbToUpload: File = file;

            if (isImage) {
              try {
                // Intentamos optimizar la imagen y obtener un thumbnail
                const { optimizedFile, thumbFile } = await optimizeImage(file);
                if (optimizedFile) fileToUpload = optimizedFile; // usar optimizado si existe
                if (thumbFile) thumbToUpload = thumbFile; // usar thumb si fue generado
              } catch (optErr) {
                // Si la optimización falla, continuamos con el archivo original
                console.warn('Image optimization failed, proceeding with original file', optErr);
              }
            }

            // 4.2) Construir nombres de archivo esperados para S3, que incluyen la ruta relativa y performer ID
            // TODO: debe aclararse el proceso para llevarlo a performer y a client
            const generatedFileName = buildFileName(fileToUpload, assetTypeForPath, performer?.id);
            const generatedThumbFileName = buildFileName(
              thumbToUpload,
              assetTypeForPath,
              performer?.id,
              true
            );

            // 5) Si no se pudo construir un nombre válido, marcar fallo y salir
            if (!generatedFileName || !generatedThumbFileName) {
              setAssets((prev) =>
                prev.map((a) => (a.id === assetId ? { ...a, status: 'failed' } : a))
              );
              return;
            }

            // 4.3) Solicitar URLs prefirmadas al backend para ambos archivos
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

            // 4.4) Subir archivo y thumbnail a S3 con seguimiento de progreso (actualizando UI)
            const { objectUrl } = await uploadToS3(fileToUpload, presignedUrl, (_p) => {
              // Actualizar UI con progreso (aquí solo refrescamos el asset correspondiente)
              setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a } : a)));
            });

            const { objectUrl: objectThumbUrl } = await uploadToS3(
              thumbToUpload,
              presignedThumbUrl,
              (_p) => {
                setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a } : a)));
              }
            );

            // 4.5) Registrar el asset en el backend con la metadata y las URLs obtenidas
            const assetType: 'photo' | 'video' = isImage ? 'photo' : 'video';

            const uploadPayload = {
              fileName,
              fileURLthumb: objectThumbUrl,
              fileURL: objectUrl,
              contentType: fileToUpload.type,
              size: fileToUpload.size,
              assetType,
              performerId: performer?.id,
              // conservar nombre original como assetName
              assetName: file.name,
            };

            const { uploadAsset } = await import('../../app/services/s3Upload.service');
            const registered = await uploadAsset(uploadPayload);

            // 4.6) Si se generó un thumbnail, intentar subirlo/registrarlo y añadirlo como asset separado
            if (thumbToUpload) {
              try {
                const thumbGeneratedFileName = buildFileName(
                  thumbToUpload,
                  assetTypeForPath,
                  performer?.id
                );
                if (thumbGeneratedFileName) {
                  const { url: thumbPresignedUrl, fileName: thumbFileName } =
                    await getPresignedUploadUrl(thumbToUpload.type, 900, thumbGeneratedFileName);
                  const { objectUrl: thumbObjectUrl } = await uploadToS3(
                    thumbToUpload,
                    thumbPresignedUrl,
                    () => {}
                  );
                  const registeredThumb = await uploadAsset({
                    fileName: thumbFileName,
                    fileURL: thumbObjectUrl,
                    contentType: thumbToUpload.type,
                    size: thumbToUpload.size,
                    assetType,
                    performerId: performer?.id,
                    assetName: file.name,
                  });

                  // Añadir thumbnail como asset separado en la UI
                  setAssets((prev) => [
                    ...prev,
                    {
                      id: Math.random().toString(36).substr(2, 9),
                      type: 'photo',
                      url: registeredThumb.fileURL,
                      name: file.name,
                      size: formatFileSize(thumbToUpload.size),
                      uploadedAt: new Date(),
                      status: 'completed',
                    },
                  ]);
                }
              } catch (thumbErr) {
                // Si falla subir/registrar el thumbnail, se registra la advertencia y se continúa
                console.warn('Thumbnail upload failed', thumbErr);
              }
            }

            // 4.7) Actualizar el asset original en estado local con la URL real y marcar como completado
            setAssets((prev) =>
              prev.map((a) =>
                a.id === assetId ? { ...a, status: 'completed', url: registered.fileURL } : a
              )
            );
          } catch (err) {
            // 5) En caso de error en cualquier paso, marcar asset como 'failed'
            console.error('Asset upload failed', err);
            setAssets((prev) =>
              prev.map((a) => (a.id === assetId ? { ...a, status: 'failed' } : a))
            );
          }
        })();
      }
    });

    // 6) Añadir los assets temporales al estado para que la UI los muestre e inicie el proceso
    setAssets((prev) => [...prev, ...newAssets]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== id));
  };

  const filteredAssets = assets.filter((asset) => {
    if (selectedType === 'all') return true;
    return asset.type === selectedType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return (
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        );
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-linear-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={performer.avatar || '/icons/default-avatar.svg'}
              alt={performer.stage_name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
            />
            <div>
              <h2 className="text-xl font-bold text-white">Subir Assets</h2>
              <p className="text-sm text-purple-100">{performer.stage_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*,video/*"
              onChange={handleChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500">
                    Soporta imágenes (JPG, PNG, GIF) y videos (MP4, MOV, AVI)
                  </p>
                </div>
                <button
                  type="button"
                  className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
                >
                  Seleccionar archivos
                </button>
              </div>
            </label>
          </div>

          {assets.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assets subidos ({assets.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedType('photo')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'photo'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Fotos
                  </button>
                  <button
                    onClick={() => setSelectedType('video')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'video'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Videos
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        {asset.type === 'photo' ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow">
                        {asset.type === 'photo' ? (
                          <Image className="h-3 w-3 text-blue-600" />
                        ) : (
                          <Video className="h-3 w-3 text-purple-600" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{asset.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{asset.size}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {asset.uploadedAt.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(asset.status)}
                      {asset.status === 'completed' && (
                        <>
                          <button
                            onClick={() => window.open(asset.url, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {assets.filter((a) => a.status === 'completed').length} de {assets.length} archivos
            completados
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cerrar
            </button>
            <button
              className="px-6 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
              disabled={assets.filter((a) => a.status === 'completed').length === 0}
            >
              Guardar Assets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Upload, Image, Video, Trash2, Eye, CheckCircle } from 'lucide-react';
import { Performer } from '../../app/types/performers.types';

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

  const handleFiles = (files: FileList) => {
    const newAssets: Asset[] = [];

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (isImage || isVideo) {
        const asset: Asset = {
          id: Math.random().toString(36).substr(2, 9),
          type: isImage ? 'photo' : 'video',
          url: URL.createObjectURL(file),
          name: file.name,
          size: formatFileSize(file.size),
          uploadedAt: new Date(),
          status: 'uploading',
        };

        newAssets.push(asset);

        setTimeout(() => {
          setAssets((prev) =>
            prev.map((a) => (a.id === asset.id ? { ...a, status: 'completed' } : a))
          );
        }, 2000);
      }
    });

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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={performer.avatar_url || '/icons/default-avatar.svg'}
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
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
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
                    <div className="relative flex-shrink-0">
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
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
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

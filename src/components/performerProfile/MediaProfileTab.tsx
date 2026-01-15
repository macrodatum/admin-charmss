import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { getContentByPerformerProfileId } from '../../app/services/content.service';
import PerformersService from '../../app/services/performers.service';
import PerformerProfileService from '../../app/services/performerProfile.service';
import { PerformerProfile, Performer } from '../../app/types/performers.types';

type PerformerProfileWithVideo = PerformerProfile & { video?: string | Record<string, unknown> };

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  fileURL: string;
  thumbnail?: string;
  assetName?: string;
  statusCode?: number;
}

interface MediaProfileTabProps {
  performer: Performer;
}

export default function MediaProfileTab({ performer }: MediaProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | null>(performer?.avatar || null);
  const [localVideo, setLocalVideo] = useState<string | null>(performer?.video ?? null);
  const [profileData, setProfileData] = useState<PerformerProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video' | null>(null);
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  const openModal = (type: 'image' | 'video', src: string) => {
    setModalType(type);
    setModalSrc(src);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalSrc(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (modalOpen) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
    return;
  }, [modalOpen]);

  // Cargar media items al montar
  useEffect(() => {
    const loadMedia = async () => {
      const profileId = performer?.performerProfile?.id;
      if (!profileId) {
        setMediaItems([]);
        return;
      }

      setLoading(true);
      try {
        const resp = await getContentByPerformerProfileId(profileId);
        const items = resp?.items ?? [];
        const mapped = items.map((it) => ({
          id: String(it.id),
          type: it.type as 'photo' | 'video',
          fileURL: it.fileURL ?? it.fileURLThumb ?? '',
          thumbnail: it.fileURLThumb ?? undefined,
          assetName: it.assetName,
          statusCode: it.status,
        }));
        setMediaItems(mapped);
      } catch (error) {
        console.error('Error loading media items:', error);
        setMediaItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [performer?.performerProfile?.id]);

  const assignAvatar = async () => {
    if (!selectedImageId) return;
    setAssignError(null);
    setAssignSuccess(null);
    setAssignLoading(true);
    try {
      const item = mediaItems.find((m) => m.id === selectedImageId);
      if (!item) throw new Error('Asset not found');

      const result = await PerformersService.assignProfileAsset(performer.id, item.id);
      if (result.url) {
        setLocalAvatar(result.url);
      } else {
        setLocalAvatar(item.fileURL);
      }
      setAssignSuccess('Avatar asignado correctamente');
    } catch (err) {
      console.error(err);
      setAssignError('Error asignando avatar');
    } finally {
      setAssignLoading(false);
    }
  };

  const assignVideo = async () => {
    if (!selectedVideoId) return;
    setAssignError(null);
    setAssignSuccess(null);
    setAssignLoading(true);
    try {
      const item = mediaItems.find((m) => m.id === selectedVideoId);
      if (!item) throw new Error('Asset not found');

      await PerformersService.assignProfileAsset(performer.id, item.id);

      // Recargar el perfil para obtener el video actualizado
      const updatedProfile = await PerformerProfileService.getPerformerProfile(performer.id);
      setProfileData(updatedProfile);

      // Recargar performer para obtener el video actualizado
      const updatedPerformer = await PerformersService.getPerformer(performer.id);
      if (updatedPerformer?.video) setLocalVideo(updatedPerformer.video);
      if (updatedPerformer?.avatar) setLocalAvatar(updatedPerformer.avatar);

      setAssignSuccess('Video asignado correctamente');
    } catch (err) {
      console.error(err);
      setAssignError('Error asignando video');
    } finally {
      setAssignLoading(false);
    }
  };

  const approvedImages = mediaItems.filter((m) => m.type === 'photo' && m.statusCode === 3);
  const approvedVideos = mediaItems.filter((m) => m.type === 'video' && m.statusCode === 3);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando media...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-700 dark:text-gray-300">
      {assignError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {assignError}
        </div>
      )}

      {assignSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          {assignSuccess}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Imagenes disponibles para Perfil
        </h3>
        <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
          Selecciona una imagen aprobada para usar como avatar
        </p>

        {approvedImages.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay imágenes aprobadas disponibles
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {approvedImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImageId(img.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                    selectedImageId === img.id
                      ? 'border-pink-600 ring-2 ring-pink-300'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img
                    src={img.fileURL}
                    alt={img.assetName || 'Image'}
                    className="w-full h-36 object-cover cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('image', img.fileURL);
                    }}
                  />
                  {selectedImageId === img.id && (
                    <div className="absolute bottom-0 left-0 right-0 bg-pink-600 text-white py-2 text-sm font-medium flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" />
                      Seleccionada
                    </div>
                  )}
                  {selectedImageId !== img.id && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 text-gray-700 py-2 text-sm font-medium text-center hover:bg-pink-500 hover:text-white transition-all">
                      Seleccionar
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={assignAvatar}
              disabled={!selectedImageId || assignLoading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50 hover:bg-pink-700 transition-colors"
            >
              {assignLoading ? 'Asignando...' : 'Asignar como Avatar'}
            </button>
          </>
        )}
      </div>

      <hr className="border-gray-300 dark:border-slate-600" />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Videos disponibles para Perfil
        </h3>
        <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
          Selecciona un video aprobado para mostrar en el perfil
        </p>

        {approvedVideos.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay videos aprobados disponibles
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {approvedVideos.map((vid) => (
                <div
                  key={vid.id}
                  className={`relative rounded-lg overflow-hidden bg-black shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-2 ${
                    selectedVideoId === vid.id
                      ? 'border-pink-600 ring-2 ring-pink-300'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <video
                    src={vid.fileURL}
                    poster={vid.thumbnail}
                    className="w-full h-36 object-cover bg-black"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('video', vid.fileURL);
                    }}
                    role="button"
                    aria-label="Previsualizar video"
                  >
                    <div className="bg-black bg-opacity-60 text-white rounded-full p-3 text-xl select-none">
                      ▶
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    Video
                  </div>
                  <button
                    onClick={() => setSelectedVideoId(vid.id)}
                    className={`absolute bottom-0 left-0 right-0 py-3 text-sm font-medium transition-all duration-300 ${
                      selectedVideoId === vid.id
                        ? 'bg-pink-600 text-white'
                        : 'bg-white bg-opacity-90 text-gray-700 hover:bg-pink-500 hover:text-white'
                    }`}
                  >
                    {selectedVideoId === vid.id ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        Seleccionado
                      </span>
                    ) : (
                      'Seleccionar'
                    )}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={assignVideo}
              disabled={!selectedVideoId || assignLoading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50 hover:bg-pink-700 transition-colors"
            >
              {assignLoading ? 'Asignando...' : 'Asignar como Video de Presentación'}
            </button>
          </>
        )}
      </div>

      <hr className="border-gray-300 dark:border-slate-600" />

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Avatar actual</h4>
            <img
              src={localAvatar || 'https://via.placeholder.com/150'}
              alt="avatar"
              className="w-full max-w-xs h-36 rounded-lg object-cover shadow-md cursor-pointer"
              onClick={() => localAvatar && openModal('image', localAvatar)}
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Video actual</h4>
            {(() => {
              const videoUrl =
                localVideo ??
                performer?.video ??
                ((profileData as PerformerProfileWithVideo)?.video as string | undefined);

              return videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-w-xs h-36 rounded-lg object-contain bg-black shadow-md cursor-pointer"
                  onClick={() => openModal('video', String(videoUrl))}
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              ) : (
                <div className="w-full max-w-xs h-36 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm p-4">
                  Sin video asignado
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {modalOpen && modalSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div className="relative w-full max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100"
              aria-label="Cerrar"
            >
              ✕
            </button>
            {modalType === 'image' ? (
              <img
                src={modalSrc}
                alt="Preview"
                className="w-full max-h-[80vh] object-contain rounded"
              />
            ) : (
              <video
                src={modalSrc}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain rounded bg-black"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

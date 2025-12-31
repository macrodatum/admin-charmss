import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Image as ImageIcon, Video, Filter, Calendar } from 'lucide-react';
import AssetPreviewModal from './AssetPreviewModal';
import { motion } from 'framer-motion';
import type { ContentItem } from '../../types/content';
import { Performer } from '../../app/types/performers.types';
import { getContentByPerformerProfileId } from '../../app/services/content.service';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  uploaded_date: string;
  status: 'pending' | 'approved' | 'rejected';
  title?: string;
  // additional metadata
  likes?: number;
  comments?: number;
  creator?: { id: string; username: string; avatar?: string };
  duration?: number;
  statusCode?: number;
}

interface ContentApprovalModalProps {
  performer: Performer | null;
  onClose: () => void;
}

export default function ContentApprovalModal({ performer, onClose }: ContentApprovalModalProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!performer?.performerProfile?.id) return setMediaItems([]);
      setIsLoading(true);
      setError(null);

      try {
        const resp = await getContentByPerformerProfileId(performer.performerProfile.id);
        const items = resp?.items ?? [];
        const mapped: MediaItem[] = items.map((it) => {
          // Map statusCode to editorial status: 1=pending, 2=rejected, 3=approved
          const getEditorialStatus = (
            statusCode: number | undefined
          ): 'pending' | 'approved' | 'rejected' => {
            switch (statusCode) {
              case 2:
                return 'rejected';
              case 3:
                return 'approved';
              case 1:
              default:
                return 'pending';
            }
          };

          return {
            id: String(it.id),
            type: it.type as 'photo' | 'video',
            url: it.fileURL ?? it.fileURLThumb ?? '',
            thumbnail: it.fileURLThumb ?? undefined,
            uploaded_date:
              it.createdAt instanceof Date ? it.createdAt.toISOString() : String(it.createdAt),
            status: getEditorialStatus(it.status),
            title: it.assetName || it.description || '',
            likes: (it.likes ?? 0) as number,
            comments: (it.comments ?? 0) as number,
            creator: it.creator ?? undefined,
            duration: it.duration ?? undefined,
            statusCode: it.status ?? undefined,
          };
        });

        if (mounted) setMediaItems(mapped);
      } catch {
        if (mounted) setError('Error al cargar contenido');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [performer?.performerProfile?.id]);

  // Local UI flow states for action confirmation
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!performer) return null;

  const handleApprove = (id: string) => {
    setConfirmApproveId(id);
    setActionError(null);
  };

  const handleReject = (id: string) => {
    setRejectModal({ id, reason: '' });
    setActionError(null);
  };

  const doApprove = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      // status 3 = approved
      await import('../../app/services/content.service').then((m) => m.updateAssetStatus(id, 3));
      setMediaItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: 'approved', statusCode: 3 } : it))
      );
      setConfirmApproveId(null);
    } catch {
      setActionError('Error al aprobar el asset');
    } finally {
      setActionLoading(false);
    }
  };

  const doReject = async (id: string, reason: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      // status 2 = rejected
      await import('../../app/services/content.service').then((m) =>
        m.updateAssetStatus(id, 2, reason)
      );
      setMediaItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, status: 'rejected', statusCode: 2 } : it))
      );
      setRejectModal(null);
    } catch {
      setActionError('Error al rechazar el asset');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    const typeMatch = filterType === 'all' || item.type === filterType;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const pendingCount = mediaItems.filter((item) => item.status === 'pending').length;
  const approvedCount = mediaItems.filter((item) => item.status === 'approved').length;
  const rejectedCount = mediaItems.filter((item) => item.status === 'rejected').length;

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src={performer.avatar}
                alt={performer.stage_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Aprobación de Contenido
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {performer.stage_name} - {performer.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'photo' | 'video')}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="photo">Fotos</option>
              <option value="video">Videos</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')
              }
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes ({pendingCount})</option>
              <option value="approved">Aprobados ({approvedCount})</option>
              <option value="rejected">Rechazados ({rejectedCount})</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300 mb-4" />
              <p className="text-lg">Cargando contenido...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <XCircle className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">{error}</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">No hay contenido que coincida con los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((item) => {
                const layoutId = 'asset-' + item.id;
                const thumbTestId = `asset-thumb-${item.id}`;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAsset(item)}
                    className="relative bg-gray-50 dark:bg-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <motion.div
                      layoutId={layoutId}
                      data-testid={thumbTestId}
                      className="relative aspect-video"
                    >
                      {item.type === 'photo' ? (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <img
                            src={item.thumbnail || item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-opacity-30 flex items-center justify-center">
                            <Video className="h-12 w-12 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>

                    <div className="absolute top-2 right-2">
                      {item.type === 'photo' ? (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          Foto
                        </span>
                      ) : (
                        <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Video
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      {item.status === 'pending' && (
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Pendiente
                        </span>
                      )}

                      {/* Numeric asset status pill (1=subido, 2=rechazado, 3=aprobado) */}
                      {/* Only show numeric status pill for approved (3) or rejected (2). Hide "Subido" (1) */}
                      {typeof item.statusCode === 'number' &&
                        (item.statusCode === 2 || item.statusCode === 3) && (
                          <span
                            data-testid={`asset-statuscode-${item.id}`}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.statusCode === 2
                                ? 'bg-red-500 text-white'
                                : 'bg-green-500 text-white'
                            }`}
                          >
                            {item.statusCode === 2 ? 'Rechazado' : 'Aprobado'}
                          </span>
                        )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.uploaded_date).toLocaleDateString()}</span>
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(item.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(item.id);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Rechazar
                          </button>
                        </div>
                      )}

                      {item.status === 'approved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(item.id);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-600 hover:bg-red-600 hover:text-white text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>
                      )}

                      {item.status === 'rejected' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(item.id);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-600 hover:bg-green-600 hover:text-white text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-750">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Pendientes:{' '}
                  <strong className="text-gray-900 dark:text-white">{pendingCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Aprobados:{' '}
                  <strong className="text-gray-900 dark:text-white">{approvedCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Rechazados:{' '}
                  <strong className="text-gray-900 dark:text-white">{rejectedCount}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {selectedAsset && (
        <AssetPreviewModal
          asset={(() => {
            const content: ContentItem = {
              id: selectedAsset.id,
              type: selectedAsset.type,
              fileURLThumb: selectedAsset.thumbnail ?? '',
              fileURL: selectedAsset.url,
              assetName: selectedAsset.title,
              description: selectedAsset.title,
              price: 0,
              likes: selectedAsset.likes ?? 0,
              comments: selectedAsset.comments ?? 0,
              isLiked: false,
              creator: selectedAsset.creator
                ? {
                    id: selectedAsset.creator.id,
                    username: selectedAsset.creator.username,
                    avatar: selectedAsset.creator.avatar ?? '',
                  }
                : { id: '', username: '', avatar: '' },
              createdAt: new Date(selectedAsset.uploaded_date),
              duration: selectedAsset.duration,
              status: selectedAsset.statusCode,
            };
            return content;
          })()}
          editorialStatus={selectedAsset.status}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* Approve confirm modal */}
      {confirmApproveId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-glass" />
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-lg w-full z-10">
            <h3 className="text-lg font-semibold mb-4">Confirmar aprobación</h3>
            <p className="text-sm text-gray-600 mb-4">¿Deseas aprobar este asset?</p>
            {actionError && <p className="text-red-500 mb-2">{actionError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmApproveId(null)}
                className="px-4 py-2 rounded text-gray-800 dark:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => doApprove(confirmApproveId)}
                disabled={actionLoading}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                {actionLoading ? 'Procesando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal (reason textarea 255 chars required) */}
      {rejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-glass" />
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full z-10">
            <h3 className="text-lg font-semibold mb-4">Rechazar asset</h3>
            <p className="text-sm text-gray-600 mb-2">
              Indica la causal de rechazo (máx 255 caracteres)
            </p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ id: rejectModal.id, reason: e.target.value.slice(0, 255) })
              }
              className="w-full border p-2 rounded mb-4 h-24"
              maxLength={255}
              aria-label="Motivo de rechazo"
            />
            {actionError && <p className="text-red-500 mb-2">{actionError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded text-gray-800 dark:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => rejectModal && doReject(rejectModal.id, rejectModal.reason)}
                disabled={
                  actionLoading || !(rejectModal?.reason && rejectModal.reason.trim().length > 0)
                }
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                {actionLoading ? 'Procesando...' : 'Enviar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

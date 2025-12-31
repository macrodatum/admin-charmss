import React from 'react';
import { X, Heart, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ContentItem } from '../../types/content';

interface AssetPreviewModalProps {
  asset: ContentItem;
  editorialStatus?: 'pending' | 'approved' | 'rejected';
  onClose: () => void;
}

export default function AssetPreviewModal({
  asset,
  editorialStatus,
  onClose,
}: AssetPreviewModalProps) {
  // Map numeric asset status -> labels/colors according to spec: 1=Subido, 2=Rechazado, 3=Aprobado
  const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: 'Subido', color: 'bg-gray-400' },
    2: { label: 'Rechazado', color: 'bg-red-500' },
    3: { label: 'Aprobado', color: 'bg-green-500' },
    4: { label: 'Inactiva', color: 'bg-blue-500' },
  };

  const s =
    typeof asset.status === 'number' && statusMap[asset.status]
      ? statusMap[asset.status]
      : { label: 'Pendiente', color: 'bg-yellow-500' };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 backdrop-blur-glass"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid={`asset-preview-overlay-${asset.id}`}
        />

        <motion.div
          className="relative z-10 max-w-5xl w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded ${s.color}`} />
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {asset.assetName || asset.description || 'Sin título'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {asset.creator?.username} • {new Date(asset.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Heart className="h-4 w-4" /> <span>{asset.likes ?? 0}</span>
                </div>

                {/* If editorialStatus is provided, show editorial pill (prioritized). Otherwise, show numeric pill only for approved(3)/rejected(2) */}
                {editorialStatus ? (
                  <span
                    data-testid={`asset-preview-editorial-${asset.id}`}
                    className={`text-xs px-2 py-1 rounded ${
                      editorialStatus === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : editorialStatus === 'approved'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {editorialStatus === 'pending'
                      ? 'Pendiente'
                      : editorialStatus === 'approved'
                      ? 'Aprobado'
                      : 'Rechazado'}
                  </span>
                ) : asset.status === 2 || asset.status === 3 ? (
                  <span
                    data-testid={`asset-preview-status-${asset.id}`}
                    className={`text-xs px-2 py-1 rounded ${s.color} text-white`}
                  >
                    {s.label}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MessageSquare className="h-4 w-4" /> <span>{asset.comments ?? 0}</span>
              </div>

              <button
                aria-label="Cerrar preview"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex items-center justify-center">
              <motion.div layoutId={`asset-${asset.id}`} data-testid={`asset-preview-${asset.id}`}>
                {asset.type === 'photo' ? (
                  <img
                    src={asset.fileURL || asset.fileURLThumb}
                    alt={asset.assetName || asset.description}
                    className="max-h-[70vh] w-auto object-contain"
                  />
                ) : (
                  <video
                    src={asset.fileURL}
                    poster={asset.fileURLThumb}
                    controls
                    className="max-h-[70vh] w-full h-auto bg-black rounded"
                  />
                )}
              </motion.div>
            </div>

            <div className="w-full md:w-64 flex flex-col">
              <div className="mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Estado</div>
                <div className="mt-1 font-medium text-gray-900 dark:text-white">{s.label}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Detalles</div>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>
                    <strong>Likes:</strong> {asset.likes ?? 0}
                  </li>
                  <li>
                    <strong>Comments:</strong> {asset.comments ?? 0}
                  </li>
                  {asset.duration && (
                    <li>
                      <strong>Duración:</strong> {Math.round(asset.duration)}s
                    </li>
                  )}
                  <li>
                    <strong>Fecha:</strong> {new Date(asset.createdAt).toLocaleString()}
                  </li>
                  <li>
                    <strong>Nombre:</strong> {asset.assetName || asset.description || 'Sin título'}
                  </li>
                </ul>
              </div>

              <div className="mt-auto" />
            </div>
          </div>

          {/* Sticky footer with close button so bottom controls remain visible */}
          <div className="p-4 border-t bg-white dark:bg-slate-800 sticky bottom-0 z-20">
            <div className="max-w-5xl mx-auto flex justify-end">
              <button
                data-testid={`asset-footer-close-${asset.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

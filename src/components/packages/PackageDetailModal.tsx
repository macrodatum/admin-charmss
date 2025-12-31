import React from 'react';
import { X, Calendar, DollarSign, Star, Gift } from 'lucide-react';
import type { Package } from '../../app/types/packages.types';
import { PACKAGE_STATUS_LABELS } from '../../app/types/packages.types';

interface Props {
  paquete: Package | null;
  open: boolean;
  onClose: () => void;
}

export default function PackageDetailModal({ paquete: pkg, open, onClose }: Props) {
  if (!open || !pkg) return null;

  const statusColor = pkg.status
    ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
    : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detalle del Paquete
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{pkg.name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo
              </label>
              {pkg.logoImage ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={pkg.logoImage}
                      alt={pkg.name}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-slate-600 block"
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', pkg.logoImage);
                        const target = e.target as HTMLImageElement;
                        const errorDiv = target.parentNode?.querySelector('.error-message');
                        if (errorDiv) errorDiv.remove();
                      }}
                      onError={(e) => {
                        console.log('Image failed to load:', pkg.logoImage);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (!target.parentNode?.querySelector('.error-message')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className =
                            'error-message text-red-500 text-sm p-2 border border-red-200 rounded bg-red-50';
                          errorDiv.textContent = 'Error al cargar la imagen';
                          target.parentNode?.appendChild(errorDiv);
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No hay imagen</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio
              </label>
              <div className="flex items-center gap-1">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${pkg.price}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración
              </label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-gray-900 dark:text-white">{pkg.lifeTime} días</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
              >
                {PACKAGE_STATUS_LABELS[pkg.status.toString()]}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Créditos
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-900 dark:text-white">{pkg.totalCredit} créditos</span>
                </div>
                {pkg.bonus > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400">+{pkg.bonus} bonus</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            {pkg.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Creado
                </label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(pkg.createdAt).toLocaleString()}
                </div>
              </div>
            )}
            {pkg.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Actualizado
                </label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(pkg.updatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

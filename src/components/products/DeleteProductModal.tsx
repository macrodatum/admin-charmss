import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteProductModal({
  open,
  productName,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Confirmar Eliminación</h3>
          <button
            onClick={onCancel}
            aria-label="Cerrar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-200" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                ¿Estás seguro de que deseas eliminar el producto{' '}
                <span className="font-bold">"{productName}"</span>?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Esta acción no se puede deshacer y el producto será eliminado permanentemente.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white text-sm font-medium transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

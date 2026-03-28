import React from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { Parameter } from '../../app/types/parameter.types';

interface Props {
  open: boolean;
  param: Parameter | null;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteParameterModal({ open, param, deleting, onConfirm, onClose }: Props) {
  if (!open || !param) return null;

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Eliminar Parámetro
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar el parámetro{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{param.name}</span>?
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="flex gap-3 w-full pt-1">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700
                disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg
                bg-red-600 text-white text-sm font-medium hover:bg-red-700
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

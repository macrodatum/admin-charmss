import React from 'react';
import { X } from 'lucide-react';
import type { Gift } from '../../app/types/gifts.types';

interface Props {
  gift?: Gift | null;
  open: boolean;
  onClose: () => void;
}

export default function GiftModal({ gift, open, onClose }: Props) {
  if (!open || !gift) return null;

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold">{gift.name}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-200" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {gift.url && (
            <img
              src={gift.url}
              alt={gift.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="mb-2">{gift.description}</p>
            <p className="font-semibold">Precio: {gift.price} tokens</p>
            {gift.urlSound ? (
              <div className="mt-3">
                <audio controls src={gift.urlSound} className="w-full" />
              </div>
            ) : null}
            <div className="mt-3 text-xs text-gray-400">
              {gift.updatedAt ? `Actualizado: ${new Date(gift.updatedAt).toLocaleString()}` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash } from 'lucide-react';
import type { Gift } from '../../app/types/gifts.types';

interface Props {
  gift: Gift;
  onView: (gift: Gift) => void;
  onEdit: (gift: Gift) => void;
  onDelete: (id: number) => void;
}

export default function GiftCard({ gift, onView, onEdit, onDelete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.18 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-3"
      data-testid={`gift-card-${gift.id}`}
    >
      <div className="w-full flex items-start gap-4">
        {/* Imagen */}
        {gift.url ? (
          <img src={gift.url} alt={gift.name} className="h-24 w-24 object-cover rounded-lg" />
        ) : (
          <div className="h-24 w-24 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm text-gray-500">
            No Image
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{gift.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{gift.description}</p>

          <div className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
            {gift.price} tokens
          </div>
          {/* Previsualización de sonido */}
          {gift.urlSound ? (
            <div className="mt-2">
              <audio controls src={gift.urlSound} className="w-full" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center justify-start gap-2">
          <button
            aria-label="Ver"
            title="Ver"
            onClick={() => onView(gift)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-200" />
          </button>
          <button
            aria-label="Editar"
            title="Editar"
            onClick={() => onEdit(gift)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-200" />
          </button>
          <button
            aria-label="Borrar"
            title="Borrar"
            onClick={() => onDelete(gift.id)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Trash className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

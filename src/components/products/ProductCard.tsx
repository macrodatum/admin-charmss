import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash, Calendar, DollarSign, Tag } from 'lucide-react';
import type { Product } from '../../app/types/products.types';
import { PRODUCT_TYPE_LABELS } from '../../app/types/products.types';

interface Props {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductCard({ product, onView, onEdit, onDelete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.18 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-3"
      data-testid={`product-card-${product.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {PRODUCT_TYPE_LABELS[product.productType]}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            aria-label="Ver"
            title="Ver"
            onClick={() => onView(product)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-200" />
          </button>
          <button
            aria-label="Editar"
            title="Editar"
            onClick={() => onEdit(product)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-200" />
          </button>
          <button
            aria-label="Borrar"
            title="Borrar"
            onClick={() => onDelete(product.id)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Trash className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {product.durationDays} días
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Precio por defecto</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              ${product.defaultPrice}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Rango de precio:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${product.minPrice} - ${product.maxPrice}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-gray-500 dark:text-gray-400">Editable en perfil:</span>
          <span
            className={`font-medium ${
              product.editPriceInProfile
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {product.editPriceInProfile ? 'Sí' : 'No'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

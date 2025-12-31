import React from 'react';
import { X, Calendar, DollarSign, Tag, CheckCircle, XCircle } from 'lucide-react';
import type { Product } from '../../app/types/products.types';
import { PRODUCT_TYPE_LABELS } from '../../app/types/products.types';

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, open, onClose }: Props) {
  if (!open || !product) return null;

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold">Detalle del Producto</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-200" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Producto</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {PRODUCT_TYPE_LABELS[product.productType]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duración</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {product.durationDays} días
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Precio por Defecto</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    ${product.defaultPrice}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rango de Precio</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    ${product.minPrice} - ${product.maxPrice}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <div className="flex items-center gap-3">
                {product.editPriceInProfile ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Editable en Perfil del Performer
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {product.editPriceInProfile ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {(product.createdAt || product.updatedAt) && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
                {product.createdAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Creado:</span>{' '}
                    {new Date(product.createdAt).toLocaleString('es-ES')}
                  </div>
                )}
                {product.updatedAt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Actualizado:</span>{' '}
                    {new Date(product.updatedAt).toLocaleString('es-ES')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

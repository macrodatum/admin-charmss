import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ProductService from '../../app/services/products.service';
import type { Product } from '../../app/types/products.types';
import { ProductType, PRODUCT_TYPE_LABELS } from '../../app/types/products.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
  initial?: Partial<Product> | null;
}

export default function ProductFormModal({ open, onClose, onSaved, initial }: Props) {
  const [name, setName] = useState('');
  const [productType, setProductType] = useState<ProductType>(ProductType.PRIVATE_SHOW);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);
  const [editPriceInProfile, setEditPriceInProfile] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setProductType(initial.productType ?? ProductType.PRIVATE_SHOW);
      setDurationDays(initial.durationDays ?? 30);
      setMinPrice(initial.minPrice ?? 0);
      setMaxPrice(initial.maxPrice ?? 0);
      setDefaultPrice(initial.defaultPrice ?? 0);
      setEditPriceInProfile(initial.editPriceInProfile ?? true);
    } else {
      setName('');
      setProductType(ProductType.PRIVATE_SHOW);
      setDurationDays(30);
      setMinPrice(0);
      setMaxPrice(0);
      setDefaultPrice(0);
      setEditPriceInProfile(true);
    }
    setError(null);
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones
    if (minPrice > maxPrice) {
      setError('El precio mínimo no puede ser mayor al precio máximo');
      setLoading(false);
      return;
    }

    if (defaultPrice < minPrice || defaultPrice > maxPrice) {
      setError('El precio por defecto debe estar dentro del rango de precios');
      setLoading(false);
      return;
    }

    try {
      if (initial && (initial as Product).id) {
        const id = (initial as Product).id;
        const updated = await ProductService.updateProduct(id, {
          name,
          productType,
          durationDays,
          minPrice,
          maxPrice,
          defaultPrice,
          editPriceInProfile,
        });
        onSaved(updated);
      } else {
        const created = await ProductService.createProduct({
          name,
          productType,
          durationDays,
          minPrice,
          maxPrice,
          defaultPrice,
          editPriceInProfile,
        });
        onSaved(created);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {initial ? 'Editar Producto' : 'Crear Producto'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Producto
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                  required
                  placeholder="Ej: Private Show"
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Producto
                <select
                  value={productType}
                  onChange={(e) => setProductType(Number(e.target.value) as ProductType)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                  required
                >
                  {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duración (días)
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                  required
                  min="1"
                  placeholder="30"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio por Defecto
                <input
                  type="number"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                  required
                  min="0"
                  step="0.01"
                  placeholder="150"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio Mínimo
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                  required
                  min="0"
                  step="0.01"
                  placeholder="100"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio Máximo
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                  required
                  min="0"
                  step="0.01"
                  placeholder="500"
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editPriceInProfile}
                  onChange={(e) => setEditPriceInProfile(e.target.checked)}
                  className="rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permitir editar precio en perfil del performer
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white text-sm font-medium transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

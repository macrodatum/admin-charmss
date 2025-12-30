import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import PackageService from '../../app/services/packages.service';
import type {
  Package,
  CreatePackagePayload,
  UpdatePackagePayload,
} from '../../app/types/packages.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (paquete: Package) => void;
  initial?: Package | null;
}

export default function PackageFormModal({ open, onClose, onSaved, initial }: Props) {
  const [formData, setFormData] = useState<CreatePackagePayload>({
    name: '',
    lifeTime: 30,
    price: 0,
    status: true,
    bonus: 0,
    totalCredit: 100,
    logoImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = initial;
      setFormData(rest);
    } else {
      setFormData({
        name: '',
        lifeTime: 30,
        price: 0,
        status: true,
        bonus: 0,
        totalCredit: 100,
        logoImage: '',
      });
    }
    setErrors({});
  }, [initial, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.lifeTime <= 0) {
      newErrors.lifeTime = 'La duración debe ser mayor a 0';
    }

    if (formData.totalCredit <= 0) {
      newErrors.totalCredit = 'Los créditos totales deben ser mayor a 0';
    }

    if (formData.bonus < 0) {
      newErrors.bonus = 'Los créditos bonus no pueden ser negativos';
    }

    if (formData.logoImage && !isValidUrl(formData.logoImage)) {
      newErrors.logoImage = 'Debe ser una URL válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      let result: Package;
      if (initial) {
        const payload: UpdatePackagePayload = formData;
        result = await PackageService.updatePackage(initial.id, payload);
      } else {
        result = await PackageService.createPackage(formData);
      }
      onSaved(result);
      onClose();
    } catch (error) {
      console.error('Error saving package:', error);
      setErrors({ submit: 'Error al guardar el paquete' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePackagePayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initial ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Premium Package"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                  handleInputChange('price', val);
                }}
                placeholder="99.99"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración (días) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.lifeTime}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                  handleInputChange('lifeTime', val);
                }}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              {errors.lifeTime && <p className="text-red-500 text-sm mt-1">{errors.lifeTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Créditos Totales *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalCredit}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                  handleInputChange('totalCredit', val);
                }}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              {errors.totalCredit && (
                <p className="text-red-500 text-sm mt-1">{errors.totalCredit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Créditos Bonus
              </label>
              <input
                type="number"
                min="0"
                value={formData.bonus}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                  handleInputChange('bonus', val);
                }}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
              {errors.bonus && <p className="text-red-500 text-sm mt-1">{errors.bonus}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={(e) => handleInputChange('status', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="status"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Activo
              </label>
            </div>
          </div>

          {/* Logo Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL del Logo
            </label>
            <input
              type="url"
              value={formData.logoImage}
              onChange={(e) => handleInputChange('logoImage', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
            {errors.logoImage && <p className="text-red-500 text-sm mt-1">{errors.logoImage}</p>}
            {formData.logoImage && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vista previa:</p>
                <img
                  src={formData.logoImage}
                  alt="Preview"
                  className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-slate-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="text-red-500 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

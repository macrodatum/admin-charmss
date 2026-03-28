import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import ParameterService from '../../app/services/parameter.service';
import type { Parameter, CreateParameterPayload, UpdateParameterPayload, ParameterDataType } from '../../app/types/parameter.types';
import { PARAMETER_TYPE_LABELS } from '../../app/types/parameter.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (param: Parameter) => void;
  initial?: Parameter | null;
}

const EMPTY: CreateParameterPayload = {
  name: '',
  data_type: '',
  typeParameter: 'string',
  value: '',
  state: true,
};

export default function ParameterFormModal({ open, onClose, onSaved, initial }: Props) {
  const [form, setForm] = useState<CreateParameterPayload>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial;
      setForm(rest);
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [initial, open]);

  const set = (field: keyof CreateParameterPayload, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.data_type.trim()) e.data_type = 'El tipo de dato es requerido';
    if (!form.value.trim()) e.value = 'El valor es requerido';
    if (form.typeParameter === 'json') {
      try { JSON.parse(form.value); } catch { e.value = 'El valor no es un JSON válido'; }
    }
    if (form.typeParameter === 'number' && isNaN(Number(form.value))) {
      e.value = 'El valor debe ser un número';
    }
    if (form.typeParameter === 'boolean' && !['true', 'false'].includes(form.value.toLowerCase())) {
      e.value = 'El valor debe ser "true" o "false"';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let result: Parameter;
      if (initial) {
        const payload: UpdateParameterPayload = form;
        result = await ParameterService.updateParameter(initial.id, payload);
      } else {
        result = await ParameterService.createParameter(form);
      }
      onSaved(result);
      onClose();
    } catch {
      setErrors({ submit: 'Error al guardar el parámetro. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const typeOptions: ParameterDataType[] = ['string', 'boolean', 'number', 'json'];

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initial ? 'Editar Parámetro' : 'Nuevo Parámetro'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="ej: MAX_UPLOAD_SIZE"
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-slate-700 
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-pink-500 transition
                ${errors.name ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Data Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Data Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.data_type}
              onChange={(e) => set('data_type', e.target.value)}
              placeholder="ej: string"
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-slate-700 
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-pink-500 transition
                ${errors.data_type ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
            />
            {errors.data_type && <p className="mt-1 text-xs text-red-500">{errors.data_type}</p>}
          </div>

          {/* Type Parameter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tipo de Parámetro <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('typeParameter', t)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border-2 transition-all
                    ${form.typeParameter === t
                      ? 'border-pink-500 bg-pink-600 text-white shadow-md'
                      : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {PARAMETER_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Valor <span className="text-red-500">*</span>
            </label>
            {form.typeParameter === 'json' ? (
              <textarea
                rows={4}
                value={form.value}
                onChange={(e) => set('value', e.target.value)}
                placeholder={'{\n  "key": "value"\n}'}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-mono bg-white dark:bg-slate-700
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-pink-500 transition resize-none
                  ${errors.value ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
              />
            ) : form.typeParameter === 'boolean' ? (
              <div className="flex gap-3">
                {['true', 'false'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set('value', v)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all
                      ${form.value === v
                        ? v === 'true'
                          ? 'border-emerald-500 bg-emerald-600 text-white'
                          : 'border-red-400 bg-red-500 text-white'
                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-pink-400'
                      }`}
                  >
                    {v === 'true' ? '✓ True' : '✗ False'}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type={form.typeParameter === 'number' ? 'number' : 'text'}
                value={form.value}
                onChange={(e) => set('value', e.target.value)}
                placeholder={form.typeParameter === 'number' ? 'ej: 1024' : 'ej: valor1'}
                className={`w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-slate-700
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-pink-500 transition
                  ${errors.value ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
              />
            )}
            {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
          </div>

          {/* State */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {form.state ? 'El parámetro está activo' : 'El parámetro está inactivo'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('state', !form.state)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                ${form.state ? 'bg-pink-600' : 'bg-gray-300 dark:bg-slate-600'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                  ${form.state ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-pink-600
                text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

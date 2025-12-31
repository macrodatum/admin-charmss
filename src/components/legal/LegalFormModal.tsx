import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import LegalService from '../../app/services/legal.service';
import type { LegalDocument } from '../../app/types/legal.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (doc: LegalDocument) => void;
  initial?: Partial<LegalDocument> | null;
}

export default function LegalFormModal({ open, onClose, onSaved, initial }: Props) {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setVersion(initial.version ?? '1.0');
      setContent(initial.content ?? '');
    } else {
      setName('');
      setVersion('1.0');
      setContent('');
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initial && (initial as LegalDocument).id) {
        const id = (initial as LegalDocument).id;
        const updated = await LegalService.updateLegal(id, { name, version, content });
        onSaved(updated);
      } else {
        const created = await LegalService.createLegal({ name, version, content, active: true });
        onSaved(created);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold">{initial ? 'Editar documento' : 'Crear documento'}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            <label className="text-xs">
              Nombre
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                required
              />
            </label>

            <label className="text-xs">
              Versión
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                required
              />
            </label>

            <label className="text-xs">
              Contenido
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm min-h-[160px] resize-none"
                required
              />
            </label>

            {error ? <div className="text-sm text-red-500">{error}</div> : null}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-100 dark:bg-slate-700 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

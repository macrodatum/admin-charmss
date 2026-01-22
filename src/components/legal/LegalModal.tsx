import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import logo from '../../assets/images/livecharmss2t.png';
import LegalService from '../../app/services/legal.service';
import type { LegalDocument } from '../../app/types/legal.types';

interface LegalModalProps {
  name: string;
  open: boolean;
  onClose: () => void;
}

export default function LegalModal({ name, open, onClose }: LegalModalProps) {
  const [doc, setDoc] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await LegalService.getLegalByName(name);
        if (mounted) setDoc(resp);
      } catch (err) {
        console.error('Error fetching legal document:', err);
        if (mounted) setError('No se pudo cargar el documento');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [name, open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Live Charmss" className="h-10 w-auto object-contain" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {doc?.name ?? name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {doc?.version ?? ''}{' '}
                {doc?.updatedAt ? `• ${new Date(doc.updatedAt).toLocaleString()}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 prose prose-slate dark:prose-invert max-w-none [&_*]:text-gray-900 [&_*]:dark:text-white">
          {loading ? (
            <div className="text-center text-gray-500">Cargando...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : doc ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
          ) : (
            <div className="text-center text-gray-500">Documento no encontrado</div>
          )}
        </div>
      </div>
    </div>
  );
}

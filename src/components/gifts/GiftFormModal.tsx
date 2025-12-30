import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import GiftService from '../../app/services/gift.service';
import type { Gift } from '../../app/types/gifts.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (gift: Gift) => void;
  initial?: Partial<Gift> | null;
}

export default function GiftFormModal({ open, onClose, onSaved, initial }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileSound, setFileSound] = useState<File | null>(null);
  const [fileSoundPreview, setFileSoundPreview] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const soundInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setDescription(initial.description ?? '');
      setPrice(initial.price ?? 0);
      setFile(null);
      setFilePreview(initial.url ?? null);
      setFileSound(null);
      setFileSoundPreview(initial.urlSound ?? null);
    } else {
      setName('');
      setDescription('');
      setPrice(0);
      setFile(null);
      setFilePreview(null);
      setFileSound(null);
      setFileSoundPreview(null);
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initial && (initial as Gift).id) {
        const id = (initial as Gift).id;
        const updated = await GiftService.updateGift(id, {
          name,
          description,
          price,
          file: file ?? undefined,
          fileSound: fileSound ?? undefined,
        });
        onSaved(updated);
      } else {
        const created = await GiftService.createGift({
          name,
          description,
          price,
          file: file ?? undefined,
          fileSound: fileSound ?? undefined,
        });
        onSaved(created);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el gift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-bold">{initial ? 'Editar gift' : 'Crear gift'}</h3>
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
            {/* Imagen (drag and drop) */}
            <label className="text-xs">
              Imagen (icono)
              <div
                className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-md p-4 cursor-pointer bg-white dark:bg-slate-900"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    setFile(file);
                    setFilePreview(URL.createObjectURL(file));
                  }
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget && imageInputRef.current) {
                    imageInputRef.current.click();
                  }
                }}
              >
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="preview"
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400">Arrastra una imagen aquí o haz click</span>
                )}
                <input
                  id="gift-image-input"
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                      setFilePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </label>
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
              Descripción
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm min-h-[80px] resize-none"
              />
            </label>

            {/* El campo de URL de imagen se elimina, ya que ahora se sube archivo */}

            <label className="text-xs">
              Precio (tokens)
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm"
                required
                min={0}
              />
            </label>

            {/* Sonido (drag and drop) */}
            <label className="text-xs">
              Sonido (opcional)
              <div
                className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-md p-4 cursor-pointer bg-white dark:bg-slate-900"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('audio/')) {
                    setFileSound(file);
                    setFileSoundPreview(URL.createObjectURL(file));
                  }
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget && soundInputRef.current) {
                    soundInputRef.current.click();
                  }
                }}
              >
                {fileSoundPreview ? (
                  <audio controls src={fileSoundPreview} className="w-full" />
                ) : (
                  <span className="text-gray-400">
                    Arrastra un archivo de sonido aquí o haz click
                  </span>
                )}
                <input
                  id="gift-sound-input"
                  ref={soundInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFileSound(file);
                      setFileSoundPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
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

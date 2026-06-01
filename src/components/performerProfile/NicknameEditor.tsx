import React, { useState } from 'react';
import { Check, Pencil, X, Loader2 } from 'lucide-react';
import PerformerProfileService from '../../app/services/performerProfile.service';

interface NicknameEditorProps {
  performerId: string | number;
  currentNickname: string | null | undefined;
  onNicknameUpdated?: (newNickname: string) => void;
}

type Status = 'idle' | 'editing' | 'saving' | 'success' | 'error';

const MIN_LENGTH = 5;
const MAX_LENGTH = 50;
const AT_LEAST_ONE_LETTER = /[a-zA-Z]/;

function validateNickname(value: string): string | null {
  if (value.length < MIN_LENGTH) return `Mínimo ${MIN_LENGTH} caracteres`;
  if (value.length > MAX_LENGTH) return `Máximo ${MAX_LENGTH} caracteres`;
  if (!AT_LEAST_ONE_LETTER.test(value)) return 'Debe contener al menos una letra';
  return null;
}

export default function NicknameEditor({
  performerId,
  currentNickname,
  onNicknameUpdated,
}: NicknameEditorProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [inputValue, setInputValue] = useState(currentNickname ?? '');
  const [localNickname, setLocalNickname] = useState(currentNickname ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleEditClick = () => {
    setInputValue(localNickname);
    setValidationError(null);
    setApiError(null);
    setStatus('editing');
  };

  const handleCancel = () => {
    setStatus('idle');
    setValidationError(null);
    setApiError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setValidationError(validateNickname(val));
    setApiError(null);
  };

  const handleSave = async () => {
    const error = validateNickname(inputValue);
    if (error) {
      setValidationError(error);
      return;
    }

    setStatus('saving');
    setApiError(null);

    try {
      const result = await PerformerProfileService.updateNickname(performerId, inputValue);
      setLocalNickname(result.nickName);
      setStatus('success');
      onNicknameUpdated?.(result.nickName);

      setTimeout(() => setStatus('idle'), 2500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string | string[] } } };
      const status = axiosErr.response?.status;
      const raw = axiosErr.response?.data?.message;
      const message = Array.isArray(raw) ? raw[0] : (raw ?? 'Error al actualizar el nickname');

      if (status === 409) {
        setApiError(`El nickname "${inputValue}" ya está en uso`);
      } else if (status === 400) {
        setApiError(message);
      } else if (status === 404) {
        setApiError('Performer no encontrado');
      } else {
        setApiError(message);
      }

      setStatus('editing');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const isSaving = status === 'saving';
  const isEditing = status === 'editing' || isSaving;
  const isSuccess = status === 'success';
  const hasError = !!validationError || !!apiError;
  const displayError = validationError ?? apiError;

  return (
    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Nickname
      </label>

      {isEditing ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              maxLength={MAX_LENGTH}
              autoFocus
              className={`flex-1 bg-white dark:bg-slate-900 border px-3 py-2 rounded-lg text-sm md:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                hasError
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 dark:border-slate-700 focus:ring-pink-500'
              } disabled:opacity-60`}
              placeholder="Ingresa el nickname"
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !!validationError || inputValue === localNickname}
              title="Guardar"
              className="p-2 rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              title="Cancelar"
              className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {displayError ? (
              <p className="text-xs text-red-500">{displayError}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {inputValue.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span
            className={`text-xl md:text-2xl font-bold ${
              isSuccess
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {localNickname || <span className="text-gray-400 dark:text-gray-500 text-base font-normal italic">Sin nickname</span>}
          </span>
          {isSuccess && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> Guardado
            </span>
          )}
          <button
            onClick={handleEditClick}
            title="Editar nickname"
            className="p-1.5 rounded-lg text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

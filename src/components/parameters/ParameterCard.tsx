import React from 'react';
import { Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { Parameter } from '../../app/types/parameter.types';
import { PARAMETER_TYPE_LABELS, PARAMETER_TYPE_COLORS } from '../../app/types/parameter.types';

interface Props {
  param: Parameter;
  onEdit: (param: Parameter) => void;
  onDelete: (param: Parameter) => void;
}

export default function ParameterCard({ param, onEdit, onDelete }: Props) {
  const typeColor = PARAMETER_TYPE_COLORS[param.typeParameter] ?? 'bg-gray-100 text-gray-700';
  const typeLabel = PARAMETER_TYPE_LABELS[param.typeParameter] ?? param.typeParameter;

  const displayValue = () => {
    if (param.typeParameter === 'json') {
      try {
        return JSON.stringify(JSON.parse(param.value), null, 2);
      } catch {
        return param.value;
      }
    }
    return param.value;
  };

  const isJson = param.typeParameter === 'json';

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700
      shadow-sm hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100 dark:border-slate-700">
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-gray-900 dark:text-white truncate"
            title={param.name}
          >
            {param.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            data_type: <span className="font-medium">{param.data_type}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${typeColor}`}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="px-4 py-3 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium uppercase tracking-wide">
          Valor
        </p>
        {isJson ? (
          <pre
            className="text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-slate-700/60
            rounded-lg p-2 overflow-x-auto max-h-24 font-mono border border-gray-100 dark:border-slate-600"
          >
            {displayValue()}
          </pre>
        ) : (
          <p
            className="text-sm text-gray-800 dark:text-gray-200 font-mono bg-gray-50 dark:bg-slate-700/60
            rounded-lg px-2 py-1.5 truncate border border-gray-100 dark:border-slate-600"
          >
            {displayValue()}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          {param.state ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400" />
          )}
          <span
            className={`text-xs font-medium ${
              param.state
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {param.state ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(param)}
            title="Editar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50
              dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(param)}
            title="Eliminar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50
              dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

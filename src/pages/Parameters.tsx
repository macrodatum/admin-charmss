import React, { useEffect, useState } from 'react';
import { Plus, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import ParameterService from '../app/services/parameter.service';
import type { Parameter, ParameterDataType } from '../app/types/parameter.types';
import { PARAMETER_TYPE_LABELS } from '../app/types/parameter.types';
import ParameterCard from '../components/parameters/ParameterCard';
import ParameterFormModal from '../components/parameters/ParameterFormModal';
import DeleteParameterModal from '../components/parameters/DeleteParameterModal';

const ALL = 'all';
type FilterType = ParameterDataType | typeof ALL;

export default function ParametersPage() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>(ALL);
  const [filterState, setFilterState] = useState<'all' | 'active' | 'inactive'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editParam, setEditParam] = useState<Parameter | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paramToDelete, setParamToDelete] = useState<Parameter | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await ParameterService.getParameters();
      // Normaliza: acepta array directo o respuestas envueltas { data: [...] }
      const data: Parameter[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: Parameter[] }).data)
        ? (raw as { data: Parameter[] }).data
        : [];
      setParameters(data);
    } catch {
      setError('No se pudieron cargar los parámetros. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEdit = (param: Parameter) => {
    setEditParam(param);
    setFormOpen(true);
  };
  const handleDeleteClick = (param: Parameter) => {
    setParamToDelete(param);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paramToDelete) return;
    setDeleting(true);
    try {
      await ParameterService.deleteParameter(paramToDelete.id);
      setParameters((s) => s.filter((p) => p.id !== paramToDelete.id));
      setDeleteOpen(false);
      setParamToDelete(null);
    } catch {
      alert('Error al eliminar el parámetro.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (param: unknown) => {
    // Valida que sea un objeto con id antes de actualizar el estado
    if (!param || typeof param !== 'object' || !('id' in param)) {
      console.error('[Parameters] handleSaved recibió un objeto inválido:', param);
      // Recarga desde la API para reflejar el estado real
      load();
      return;
    }
    const safe = param as Parameter;
    setParameters((s) => {
      const exists = s.find((p) => p.id === safe.id);
      return exists ? s.map((p) => (p.id === safe.id ? safe : p)) : [safe, ...s];
    });
  };

  const typeFilters: FilterType[] = [ALL, 'string', 'boolean', 'number', 'json'];

  const filtered = parameters.filter((p) => {
    const term = search.toLowerCase();
    const matchSearch =
      (p.name ?? '').toLowerCase().includes(term) ||
      (p.data_type ?? '').toLowerCase().includes(term) ||
      (p.value ?? '').toLowerCase().includes(term);
    const matchType = filterType === ALL || p.typeParameter === filterType;
    const matchState =
      filterState === 'all' ||
      (filterState === 'active' && p.state) ||
      (filterState === 'inactive' && !p.state);
    return matchSearch && matchType && matchState;
  });

  const counts = {
    active: parameters.filter((p) => p.state).length,
    inactive: parameters.filter((p) => !p.state).length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parámetros</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Administra los parámetros de configuración del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300
              hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            title="Recargar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setEditParam(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white text-sm
              font-medium hover:bg-pink-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Nuevo Parámetro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: 'Total',
            value: parameters.length,
            color: 'text-gray-900 dark:text-white',
            bg: 'bg-white dark:bg-slate-800',
          },
          {
            label: 'Activos',
            value: counts.active,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-white dark:bg-slate-800',
          },
          {
            label: 'Inactivos',
            value: counts.inactive,
            color: 'text-red-500 dark:text-red-400',
            bg: 'bg-white dark:bg-slate-800',
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, tipo o valor…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600
                bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>

          {/* State filter */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterState(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${
                    filterState === s
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                ${
                  filterType === t
                    ? 'border-pink-500 bg-pink-600 text-white shadow-sm'
                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-slate-700'
                }`}
            >
              {t === ALL ? 'Todos los tipos' : PARAMETER_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-8 w-8 text-pink-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando parámetros…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm hover:bg-pink-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {parameters.length === 0
              ? 'No hay parámetros registrados. Crea el primero.'
              : 'No hay resultados para los filtros aplicados.'}
          </p>
          {parameters.length === 0 && (
            <button
              onClick={() => {
                setEditParam(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white text-sm hover:bg-pink-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crear Parámetro
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== parameters.length && ` de ${parameters.length}`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((param) => (
              <ParameterCard
                key={param.id}
                param={param}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <ParameterFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditParam(null);
        }}
        onSaved={handleSaved}
        initial={editParam}
      />

      <DeleteParameterModal
        open={deleteOpen}
        param={paramToDelete}
        deleting={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteOpen(false);
          setParamToDelete(null);
        }}
      />
    </div>
  );
}

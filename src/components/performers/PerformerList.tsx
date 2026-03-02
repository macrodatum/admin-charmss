import React, { useState } from 'react';
import {
  User,
  Video,
  Upload,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  FileText,
  CheckSquare,
} from 'lucide-react';

import { Performer } from '../../app/types/performers.types';

interface PerformerListProps {
  performers: Performer[];
  onToggleStatus: (id: string, newStatus: number | string) => void;
  onViewProfile: (performer: Performer) => void;
  onViewStreaming: (performer: Performer) => void;
  onUploadAssets: (performer: Performer) => void;
  onApproveContent: (performer: Performer) => void;
  onViewOnboarding?: (performer: Performer) => void;
  totalCount?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onChangePage?: (page: number) => void;
  onChangeItemsPerPage?: (n: number) => void;
  onSearch?: (term: string) => void;
  onFilterStatus?: (status: string) => void;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

type SortField = 'stage_name' | 'rating' | 'total_shows' | 'country';
type SortDirection = 'asc' | 'desc';

// SortIcon component declared outside render to satisfy lint rule react-hooks/static-components
const SortIcon = ({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) => {
  if (sortField !== field) {
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  }
  return (
    <ArrowUpDown
      className={`h-4 w-4 ${
        sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600 rotate-180'
      }`}
    />
  );
};

export default function PerformerList({
  performers,
  onToggleStatus,
  onViewProfile,
  onViewStreaming,
  onUploadAssets,
  onApproveContent,
  onViewOnboarding,
  totalCount,
  currentPage: currentPageProp,
  itemsPerPage: itemsPerPageProp,
  onChangePage,
  onChangeItemsPerPage,
  onSearch,
  onFilterStatus,
  onSort,
}: PerformerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('stage_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
    onSort?.(field, sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
  };

  // This component is presentational: it renders the `performers` array given by the parent
  // and emits events (search, filter, pagination, sort) so the parent can call the backend.
  const displayedPerformers = performers;
  const currentPageEffective = currentPageProp ?? currentPage;
  const itemsPerPageEffective = itemsPerPageProp ?? itemsPerPage;
  const totalPages = Math.max(
    1,
    Math.ceil((totalCount ?? displayedPerformers.length) / itemsPerPageEffective)
  );
  const startIndex = (currentPageEffective - 1) * itemsPerPageEffective;
  const endIndex = startIndex + itemsPerPageEffective;

  const goToPage = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(next);
    onChangePage?.(next);
  };

  const getStatusColor = (status: number | string | undefined) => {
    switch (String(status)) {
      case 'online':
        return 'bg-green-500 text-white';
      case 'offline':
        return 'bg-red-500 text-white';
      case '1': // active
        return 'bg-green-100 text-green-800';
      case '2': // inactive
        return 'bg-gray-400 text-white';
      case '0': // pending
        return 'bg-yellow-100 text-yellow-800';
      case '3': // suspended
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // SortIcon is declared at top-level to avoid recreating components during render

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, stage name o email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              onFilterStatus?.(e.target.value);
            }}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pendientes</option>
            <option value="suspended">Suspendidos</option>
          </select>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avatar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('stage_name')}
                  className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Información
                  <SortIcon
                    field="stage_name"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('rating')}
                  className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Rating
                  <SortIcon field="rating" sortField={sortField} sortDirection={sortDirection} />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('total_shows')}
                  className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Shows
                  <SortIcon
                    field="total_shows"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('country')}
                  className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Ubicación
                  <SortIcon field="country" sortField={sortField} sortDirection={sortDirection} />
                </button>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {displayedPerformers.map((performer) => (
              <tr
                key={performer.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={performer.avatar || '/icons/default-avatar.svg'}
                    alt={performer.full_name || 'Avatar'}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-600"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {performer.stage_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {performer.full_name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {performer.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {(performer.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {performer.total_shows}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    {performer.performerProfile?.countryCode ?? performer.country}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <div>
                      <label htmlFor={`status-select-${performer.id}`} className="sr-only">
                        Cambiar estado
                      </label>
                      <select
                        id={`status-select-${performer.id}`}
                        value={String(performer.status ?? '')}
                        onChange={(e) => onToggleStatus(performer.id, Number(e.target.value))}
                        className={`px-3 py-1 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                          performer.status
                        )}`}
                        title="Cambiar estado"
                      >
                        <option value={0}>Pendiente</option>
                        <option value={1}>Activo</option>
                        <option value={2}>Inactivo</option>
                        <option value={3}>Suspendido</option>
                      </select>
                    </div>
                    <button
                      onClick={() => onViewProfile(performer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Ver perfil"
                    >
                      <User className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onViewStreaming(performer)}
                      className="p-2 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                      title="Ver streaming"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onUploadAssets(performer)}
                      className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                      title="Subir assets"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onViewOnboarding?.(performer)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Ver Onboarding"
                    >
                      <FileText className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onApproveContent(performer)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Aprobar contenido"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(totalCount ?? displayedPerformers.length) > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Mostrar:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const n = Number(e.target.value);
                setItemsPerPage(n);
                onChangeItemsPerPage?.(n);
                setCurrentPage(1);
                onChangePage?.(1);
              }}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {startIndex + 1}-
              {Math.min(endIndex, totalCount ?? displayedPerformers.length)} de{' '}
              {totalCount ?? displayedPerformers.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPageEffective === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Primera página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(currentPageEffective - 1)}
              disabled={currentPageEffective === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPageEffective - 1 && page <= currentPageEffective + 1)
                    return true;
                  return false;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPageEffective === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => goToPage(currentPageEffective + 1)}
              disabled={currentPageEffective === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPageEffective === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="md:hidden space-y-4">
        {displayedPerformers.map((performer) => (
          <div
            key={performer.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 space-y-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={performer.avatar || '/icons/default-avatar.svg'}
                alt={performer.full_name || 'Avatar'}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-600"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {performer.stage_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {performer.full_name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {performer.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-gray-100 dark:border-slate-700">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {(performer.rating ?? 0).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Video className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {performer.total_shows}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Shows</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {performer.performerProfile?.countryCode ?? performer.country}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">País</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center gap-1">
                <label htmlFor={`status-select-mobile-${performer.id}`} className="sr-only">
                  Cambiar estado
                </label>
                <select
                  id={`status-select-mobile-${performer.id}`}
                  value={String(performer.status ?? '')}
                  onChange={(e) => onToggleStatus(performer.id, Number(e.target.value))}
                  className="px-2 py-1 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Cambiar estado"
                >
                  <option value={0}>Pendiente</option>
                  <option value={1}>Activo</option>
                  <option value={2}>Inactivo</option>
                  <option value={3}>Suspendido</option>
                </select>
                <span className="sr-only">Estado</span>
              </div>
              <button
                onClick={() => onViewProfile(performer)}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                <User className="h-4 w-4" />
                Perfil
              </button>
              <button
                onClick={() => onViewStreaming(performer)}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                <Video className="h-4 w-4" />
                Stream
              </button>
              <button
                onClick={() => onUploadAssets(performer)}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Assets
              </button>
            </div>
          </div>
        ))}
      </div>

      {displayedPerformers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 mb-2">
            <User className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron performers</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}

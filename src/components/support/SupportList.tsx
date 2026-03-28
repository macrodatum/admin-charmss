import React, { useState } from 'react';
import {
  Eye,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Calendar,
  Mail,
  User,
} from 'lucide-react';

import { SupportRequest } from '../../app/types/support.types';
import SupportService from '../../app/services/support.service';

interface SupportListProps {
  supportRequests: SupportRequest[];
  onViewDetail: (supportRequest: SupportRequest) => void;
  onDownloadDocument?: (supportRequest: SupportRequest) => void;
  totalCount?: number;
  currentSkip?: number;
  itemsToTake?: number;
  onChangeSkip?: (skip: number) => void;
  onChangeItemsToTake?: (take: number) => void;
  onSearch?: (term: string) => void;
  onFilterStatus?: (status: string) => void;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

type SortField = 'fullName' | 'email' | 'requestDate' | 'requirementType' | 'status';
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

export default function SupportList({
  supportRequests,
  onViewDetail,
  onDownloadDocument,
  totalCount,
  currentSkip: currentSkipProp,
  itemsToTake: itemsToTakeProp,
  onChangeSkip,
  onChangeItemsToTake,
  onSearch,
  onFilterStatus,
  onSort,
}: SupportListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentSkip, setCurrentSkip] = useState(0);
  const [itemsToTake, setItemsToTake] = useState(20);
  const [sortField, setSortField] = useState<SortField>('requestDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentSkip(0);
    onSort?.(field, sortField === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentSkip(0);
    onSearch?.(term);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentSkip(0);
    onFilterStatus?.(status);
  };

  // Pagination calculations
  const displayedRequests = supportRequests;
  const currentSkipEffective = currentSkipProp ?? currentSkip;
  const itemsToTakeEffective = itemsToTakeProp ?? itemsToTake;
  const currentPage = Math.floor(currentSkipEffective / itemsToTakeEffective) + 1;
  const totalPages = Math.ceil((totalCount ?? displayedRequests.length) / itemsToTakeEffective);

  const handlePageChange = (page: number) => {
    const newSkip = (page - 1) * itemsToTakeEffective;
    setCurrentSkip(newSkip);
    onChangeSkip?.(newSkip);
  };

  const handleItemsPerPageChange = (take: number) => {
    setItemsToTake(take);
    setCurrentSkip(0);
    onChangeItemsToTake?.(take);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o notas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">Todos los Estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="RESOLVED">Resueltos</option>
              <option value="CLOSED">Cerrados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('fullName')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100"
                >
                  <span>Solicitante</span>
                  <SortIcon
                    field="fullName"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('requirementType')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100"
                >
                  <span>Tipo</span>
                  <SortIcon
                    field="requirementType"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('requestDate')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100"
                >
                  <span>Fecha Solicitud</span>
                  <SortIcon
                    field="requestDate"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-100"
                >
                  <span>Estado</span>
                  <SortIcon
                    field="status"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {displayedRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.fullName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {request.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {SupportService.getRequirementTypeLabel(request.requirementType)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(request.requestDate)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${SupportService.getStatusColor(request.status)}`}
                  >
                    {SupportService.getStatusLabel(request.status)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {request.documentUrl ? (
                    <button
                      onClick={() => onDownloadDocument?.(request)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Documento
                    </button>
                  ) : (
                    <span className="text-gray-400">Sin documento</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetail(request)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {displayedRequests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No hay reportes de soporte
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No se encontraron reportes de soporte con los criterios actuales.
          </p>
        </div>
      )}

      {/* Pagination */}
      {displayedRequests.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <span>Mostrar</span>
            <select
              value={itemsToTakeEffective}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-200 dark:border-slate-600 rounded px-2 py-1 dark:bg-slate-700 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              de {totalCount ?? displayedRequests.length} resultados (página {currentPage} de {totalPages})
            </span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
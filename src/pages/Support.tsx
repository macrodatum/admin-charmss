import React, { useState, useEffect } from 'react';
import { LifeBuoy, RefreshCw, X as XIcon } from 'lucide-react';
import SupportList from '../components/support/SupportList';
import SupportDetail from '../components/support/SupportDetail';
import SupportEdit from '../components/support/SupportEdit';
import SupportService from '../app/services/support.service';
import { GetSupportRequestsParams, SupportRequest } from '../app/types/support.types';

export default function Support() {
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState<number>(0);
  const [take, setTake] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderBy, setOrderBy] = useState<string>('requestDate:desc');
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [activeModal, setActiveModal] = useState<'detail' | 'edit' | null>(null);

  // Toast state for success/error notifications
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const fetchSupportRequests = async (params?: GetSupportRequestsParams) => {
    setLoading(true);
    try {
      // Build where conditions object
      const whereConditions: Record<string, unknown> = {};

      // Add search filter if exists
      const searchTerm = params?.where ?? search;
      if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
        whereConditions.OR = [
          { fullName: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { notes: { contains: searchTerm } },
        ];
      }

      // Add status filter if not 'all'
      const currentStatus = statusFilter;
      if (currentStatus !== 'all') {
        whereConditions.status = currentStatus;
      }

      const p: GetSupportRequestsParams = {
        skip: params?.skip ?? skip,
        take: params?.take ?? take,
        orderBy: params?.orderBy ?? orderBy,
        where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      };

      const resp = await SupportService.getSupportRequests(p);
      setSupportRequests(resp.items);
      setTotal(resp.total);
      setSkip(resp.skip);
      setTake(resp.take);
    } catch (error) {
      console.error('Error fetching support requests', error);
      showToast('Error al cargar los reportes de soporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchSupportRequests();
    showToast('Lista actualizada correctamente');
  };

  const handleViewDetail = (supportRequest: SupportRequest) => {
    setSelectedRequest(supportRequest);
    setActiveModal('detail');
  };

  const handleEditRequest = (supportRequest: SupportRequest) => {
    setSelectedRequest(supportRequest);
    setActiveModal('edit');
  };

  const handleSaveRequest = (updatedRequest: SupportRequest) => {
    // Update the request in the list
    setSupportRequests((prev) =>
      prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
    );
    showToast('Reporte actualizado correctamente');
    // Refresh the list to get the latest data
    fetchSupportRequests();
  };

  const handleDownloadDocument = (supportRequest: SupportRequest) => {
    if (supportRequest.documentUrl) {
      // Open document in new tab
      window.open(supportRequest.documentUrl, '_blank');
      showToast('Documento abierto en nueva pestaña');
    } else {
      showToast('No hay documento disponible para descargar', 'error');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRequest(null);
  };

  const handleSearch = (term: string) => {
    setSearch(term);
    setSkip(0);
    fetchSupportRequests({ skip: 0, take, orderBy, where: term });
  };

  const handleFilterStatus = (status: string) => {
    setStatusFilter(status);
    setSkip(0);
    fetchSupportRequests({ skip: 0, take, orderBy });
  };

  const handleSort = (field: string, direction: string) => {
    const newOrderBy = `${field}:${direction}`;
    setOrderBy(newOrderBy);
    setSkip(0);
    fetchSupportRequests({ skip: 0, take, orderBy: newOrderBy });
  };

  const handleChangeSkip = (newSkip: number) => {
    setSkip(newSkip);
    fetchSupportRequests({ skip: newSkip, take, orderBy });
  };

  const handleChangeItemsToTake = (newTake: number) => {
    setTake(newTake);
    setSkip(0);
    fetchSupportRequests({ skip: 0, take: newTake, orderBy });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <LifeBuoy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reportes de Soporte
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona las solicitudes de soporte y reportes de la plataforma
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reportes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <LifeBuoy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {supportRequests.filter((r) => r.status === 'PENDING').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <LifeBuoy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Revisión</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {supportRequests.filter((r) => r.status === 'IN_REVIEW').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <LifeBuoy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rechazados</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {supportRequests.filter((r) => r.status === 'REJECTED').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <LifeBuoy className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Support List */}
      <SupportList
        supportRequests={supportRequests}
        onViewDetail={handleViewDetail}
        onEditRequest={handleEditRequest}
        onDownloadDocument={handleDownloadDocument}
        totalCount={total}
        currentSkip={skip}
        itemsToTake={take}
        onChangeSkip={handleChangeSkip}
        onChangeItemsToTake={handleChangeItemsToTake}
        onSearch={handleSearch}
        onFilterStatus={handleFilterStatus}
        onSort={handleSort}
      />

      {/* Modals */}
      {activeModal === 'detail' && selectedRequest && (
        <SupportDetail
          supportRequest={selectedRequest}
          onClose={closeModal}
          onDownloadDocument={handleDownloadDocument}
        />
      )}

      {activeModal === 'edit' && selectedRequest && (
        <SupportEdit
          supportRequest={selectedRequest}
          onClose={closeModal}
          onSave={handleSaveRequest}
          onError={(error) => showToast(error, 'error')}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`
              flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg
              ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
            `}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/20 rounded p-1">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Cargando reportes...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import StudioList from '../components/studios/StudioList';
import StudioDetail from '../components/studios/StudioDetail';
import FinancialModule from '../components/studios/FinancialModule';

interface Studio {
  id: string;
  name: string;
  legal_representative: string;
  email: string;
  location: string;
  status: 'active' | 'inactive';
  active_performers: number;
  online_performers: number;
  created_at: string;
}

const MOCK_STUDIOS: Studio[] = [
  {
    id: '1',
    name: 'Dreamscape Productions',
    legal_representative: 'Carlos Mendoza',
    email: 'carlos@dreamscape.com',
    location: 'Miami, Florida',
    status: 'active',
    active_performers: 15,
    online_performers: 8,
    created_at: '2023-01-15',
  },
  {
    id: '2',
    name: 'Starlight Entertainment',
    legal_representative: 'Maria Rodriguez',
    email: 'maria@starlight.com',
    location: 'Los Angeles, California',
    status: 'active',
    active_performers: 22,
    online_performers: 12,
    created_at: '2023-02-20',
  },
  {
    id: '3',
    name: 'Platinum Models Agency',
    legal_representative: 'Roberto Silva',
    email: 'roberto@platinum.com',
    location: 'New York, New York',
    status: 'active',
    active_performers: 18,
    online_performers: 9,
    created_at: '2023-03-10',
  },
  {
    id: '4',
    name: 'Elite Talent Management',
    legal_representative: 'Ana Martinez',
    email: 'ana@elitetalent.com',
    location: 'Houston, Texas',
    status: 'inactive',
    active_performers: 10,
    online_performers: 0,
    created_at: '2023-04-05',
  },
  {
    id: '5',
    name: 'Diamond Entertainment Group',
    legal_representative: 'Carlos Mendoza',
    email: 'carlos@diamond.com',
    location: 'Chicago, Illinois',
    status: 'active',
    active_performers: 25,
    online_performers: 14,
    created_at: '2023-05-12',
  },
  {
    id: '6',
    name: 'Paradise Models',
    legal_representative: 'Sofia Garcia',
    email: 'sofia@paradise.com',
    location: 'San Diego, California',
    status: 'active',
    active_performers: 12,
    online_performers: 6,
    created_at: '2023-06-18',
  },
  {
    id: '7',
    name: 'VIP Talent Agency',
    legal_representative: 'Miguel Torres',
    email: 'miguel@viptalent.com',
    location: 'Phoenix, Arizona',
    status: 'active',
    active_performers: 16,
    online_performers: 7,
    created_at: '2023-07-22',
  },
  {
    id: '8',
    name: 'Royal Entertainment',
    legal_representative: 'Carmen Ruiz',
    email: 'carmen@royal.com',
    location: 'Las Vegas, Nevada',
    status: 'inactive',
    active_performers: 8,
    online_performers: 0,
    created_at: '2023-08-14',
  },
];

export default function Studios() {
  const [studios, setStudios] = useState<Studio[]>(MOCK_STUDIOS);
  const [loading, setLoading] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [activeModal, setActiveModal] = useState<'detail' | 'financial' | null>(null);

  const fetchStudios = () => {
    setLoading(true);
    setTimeout(() => {
      setStudios(MOCK_STUDIOS);
      setLoading(false);
    }, 1000);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
    setStudios((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const handleViewDetail = (studio: Studio) => {
    setSelectedStudio(studio);
    setActiveModal('detail');
  };

  const handleViewFinancial = (studio: Studio) => {
    setSelectedStudio(studio);
    setActiveModal('financial');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedStudio(null);
  };

  const handleSaveStudio = (updatedStudio: Studio) => {
    setStudios((prev) => prev.map((s) => (s.id === updatedStudio.id ? updatedStudio : s)));
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                Administración de Studios
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestiona las agencias reclutadoras y sus performers
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchStudios}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando studios...</p>
            </div>
          ) : (
            <StudioList
              studios={studios}
              onToggleStatus={handleToggleStatus}
              onViewDetail={handleViewDetail}
              onViewFinancial={handleViewFinancial}
            />
          )}
        </div>
      </div>

      {activeModal === 'detail' && selectedStudio && (
        <StudioDetail
          studio={selectedStudio}
          onClose={handleCloseModal}
          onSave={handleSaveStudio}
        />
      )}

      {activeModal === 'financial' && selectedStudio && (
        <FinancialModule studio={selectedStudio} onClose={handleCloseModal} />
      )}
    </div>
  );
}

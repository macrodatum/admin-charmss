import React, { useState } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  Calendar,
  User,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

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

interface PerformerFinancial {
  id: string;
  performer_name: string;
  stage_name: string;
  total_earnings: number;
  commission_rate: number;
  commission_amount: number;
  net_earnings: number;
  total_payments: number;
  last_payment_date: string;
  payment_status: 'pending' | 'completed' | 'failed';
}

interface PaymentHistory {
  id: string;
  payment_date: string;
  amount: number;
  commission: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  notes: string;
}

interface FinancialModuleProps {
  studio: Studio;
  onClose: () => void;
}

const MOCK_PERFORMER_FINANCIALS: PerformerFinancial[] = [
  {
    id: '1',
    performer_name: 'Diana Herrera',
    stage_name: 'Di Goddess',
    total_earnings: 12500.0,
    commission_rate: 20,
    commission_amount: 2500.0,
    net_earnings: 10000.0,
    total_payments: 5,
    last_payment_date: '2024-10-01',
    payment_status: 'completed',
  },
  {
    id: '2',
    performer_name: 'Isabella Martinez',
    stage_name: 'Bella Charm',
    total_earnings: 9800.0,
    commission_rate: 20,
    commission_amount: 1960.0,
    net_earnings: 7840.0,
    total_payments: 4,
    last_payment_date: '2024-09-28',
    payment_status: 'completed',
  },
  {
    id: '3',
    performer_name: 'Sofia Lopez',
    stage_name: 'Sofi Angel',
    total_earnings: 11200.0,
    commission_rate: 20,
    commission_amount: 2240.0,
    net_earnings: 8960.0,
    total_payments: 6,
    last_payment_date: '2024-10-03',
    payment_status: 'completed',
  },
  {
    id: '4',
    performer_name: 'Camila Torres',
    stage_name: 'Cami Dream',
    total_earnings: 8500.0,
    commission_rate: 20,
    commission_amount: 1700.0,
    net_earnings: 6800.0,
    total_payments: 3,
    last_payment_date: '2024-09-25',
    payment_status: 'pending',
  },
  {
    id: '5',
    performer_name: 'Valentina Ruiz',
    stage_name: 'Vale Fantasy',
    total_earnings: 10300.0,
    commission_rate: 20,
    commission_amount: 2060.0,
    net_earnings: 8240.0,
    total_payments: 5,
    last_payment_date: '2024-10-05',
    payment_status: 'completed',
  },
];

const MOCK_PAYMENT_HISTORY: { [key: string]: PaymentHistory[] } = {
  '1': [
    {
      id: 'p1',
      payment_date: '2024-10-01',
      amount: 2500.0,
      commission: 500.0,
      payment_method: 'Bank Transfer',
      status: 'completed',
      notes: 'Monthly payment',
    },
    {
      id: 'p2',
      payment_date: '2024-09-01',
      amount: 2300.0,
      commission: 460.0,
      payment_method: 'Bank Transfer',
      status: 'completed',
      notes: 'Monthly payment',
    },
    {
      id: 'p3',
      payment_date: '2024-08-01',
      amount: 2100.0,
      commission: 420.0,
      payment_method: 'PayPal',
      status: 'completed',
      notes: 'Monthly payment',
    },
    {
      id: 'p4',
      payment_date: '2024-07-01',
      amount: 2800.0,
      commission: 560.0,
      payment_method: 'Bank Transfer',
      status: 'completed',
      notes: 'Monthly payment',
    },
    {
      id: 'p5',
      payment_date: '2024-06-01',
      amount: 2800.0,
      commission: 560.0,
      payment_method: 'Bank Transfer',
      status: 'completed',
      notes: 'Monthly payment',
    },
  ],
  '2': [
    {
      id: 'p6',
      payment_date: '2024-09-28',
      amount: 2450.0,
      commission: 490.0,
      payment_method: 'Bank Transfer',
      status: 'completed',
      notes: 'Monthly payment',
    },
    {
      id: 'p7',
      payment_date: '2024-08-28',
      amount: 2350.0,
      commission: 470.0,
      payment_method: 'Bank Transfer',
      status: 'completed',
      notes: 'Monthly payment',
    },
    {
      id: 'p8',
      payment_date: '2024-07-28',
      amount: 2500.0,
      commission: 500.0,
      payment_method: 'PayPal',
      status: 'completed',
      notes: 'Monthly payment',
    },
    {
      id: 'p9',
      payment_date: '2024-06-28',
      amount: 2500.0,
      commission: 500.0,
      payment_method: 'Bank Transfer',
      status: 'completed',
      notes: 'Monthly payment',
    },
  ],
};

export default function FinancialModule({ studio, onClose }: FinancialModuleProps) {
  const [performers] = useState<PerformerFinancial[]>(MOCK_PERFORMER_FINANCIALS);
  const [selectedPerformer, setSelectedPerformer] = useState<PerformerFinancial | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>(
    'all'
  );

  const filteredPerformers = performers.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.payment_status === statusFilter;
  });

  const totalEarnings = performers.reduce((sum, p) => sum + p.total_earnings, 0);
  const totalCommissions = performers.reduce((sum, p) => sum + p.commission_amount, 0);
  const totalNetEarnings = performers.reduce((sum, p) => sum + p.net_earnings, 0);

  const paymentHistory = selectedPerformer ? MOCK_PAYMENT_HISTORY[selectedPerformer.id] || [] : [];

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Módulo Financiero
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{studio.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Ganancias Totales</p>
                  <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Comisiones Totales</p>
                  <p className="text-2xl font-bold">${totalCommissions.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Ganancias Netas</p>
                  <p className="text-2xl font-bold">${totalNetEarnings.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'pending' | 'completed' | 'failed')
              }
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completados</option>
              <option value="failed">Fallidos</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performers y Ganancias
              </h3>
              <div className="space-y-3">
                {filteredPerformers.map((performer) => (
                  <div
                    key={performer.id}
                    onClick={() => setSelectedPerformer(performer)}
                    className={`bg-gray-50 dark:bg-slate-700 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedPerformer?.id === performer.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {performer.stage_name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {performer.performer_name}
                          </p>
                        </div>
                      </div>
                      {performer.payment_status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {performer.payment_status === 'pending' && (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      {performer.payment_status === 'failed' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ganancias</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${performer.total_earnings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Comisión ({performer.commission_rate}%)
                        </p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          ${performer.commission_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Neto para performer:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${performer.net_earnings.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-400">Total pagos:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {performer.total_payments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historial de Pagos
                </h3>
                {selectedPerformer && (
                  <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>
                )}
              </div>

              {!selectedPerformer ? (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-8 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Selecciona un performer para ver su historial de pagos
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      {selectedPerformer.stage_name}
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Último pago:{' '}
                      {new Date(selectedPerformer.last_payment_date).toLocaleDateString()}
                    </p>
                  </div>

                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {payment.status === 'completed'
                            ? 'Completado'
                            : payment.status === 'pending'
                            ? 'Pendiente'
                            : 'Fallido'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${payment.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Comisión</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ${payment.commission.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Método: {payment.payment_method}</p>
                        {payment.notes && <p>Notas: {payment.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-750">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

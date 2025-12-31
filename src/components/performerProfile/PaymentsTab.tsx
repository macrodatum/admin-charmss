import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import PaymentsService, { type PaymentSummary } from '../../app/services/payments.service';

interface PaymentsTabProps {
  performerId: string;
}

export default function PaymentsTab({ performerId }: PaymentsTabProps) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentSummary | null>(null);

  // Cargar datos de pagos al montar
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const data = await PaymentsService.getPaymentSummary(performerId);
        setPaymentData(data);
      } catch (error) {
        console.error('Error loading payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [performerId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando datos de pagos...</p>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p>No hay datos de pagos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Earnings</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                ${paymentData.totalEarnings.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-600">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Weekly</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                ${paymentData.weeklyEarnings.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-600">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Monthly Avg</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                ${paymentData.monthlyAverage.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-600">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Payout</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                ${paymentData.nextPayout.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-600">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
              Weekly Payments
            </h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Last 5 weeks</span>
            </div>
          </div>

          <div className="space-y-3">
            {paymentData.weeklyPayments.map((payment, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Week {payment.week}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {payment.generatedDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    ${payment.amount.toFixed(2)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'PAID'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">
            Payment Methods
          </h3>
          <div className="space-y-3">
            {paymentData.paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {method.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Fee: {method.fee} • Min: {method.minPayout}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    method.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                  }`}
                >
                  {method.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Type
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </th>
                <th className="text-center py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentData.recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 dark:border-slate-800"
                >
                  <td className="py-2 px-3 text-gray-900 dark:text-white">{transaction.date}</td>
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    {transaction.type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

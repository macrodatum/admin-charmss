import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import SalesService, { type SalesSummary } from '../../app/services/sales.service';

interface SalesTabProps {
  performerId: string;
}

export default function SalesTab({ performerId }: SalesTabProps) {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesSummary | null>(null);

  // Cargar datos de ventas al montar
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const data = await SalesService.getSalesSummary(performerId);
        setSalesData(data);
      } catch (error) {
        console.error('Error loading sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [performerId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando datos de ventas...</p>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <p className="text-lg font-medium">Sales Analytics</p>
        <p className="text-sm mt-2">No hay datos de ventas disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                ${salesData.totalRevenue.toFixed(2)}
              </p>
              <p
                className={`text-xs mt-1 ${
                  salesData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {salesData.revenueGrowth >= 0 ? '+' : ''}
                {salesData.revenueGrowth.toFixed(1)}%
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
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Sales</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {salesData.totalSales}
              </p>
              <p
                className={`text-xs mt-1 ${
                  salesData.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {salesData.salesGrowth >= 0 ? '+' : ''}
                {salesData.salesGrowth.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-600">
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Order</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                ${salesData.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-600">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Top Product</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {salesData.topSellingProduct}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-600">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">
            Sales by Product
          </h3>
          <div className="space-y-3">
            {salesData.salesByProduct.map((product, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {product.productType}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {product.totalSales} sales • Avg: ${product.averagePrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      ${product.totalRevenue.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs ${
                        product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {product.growth >= 0 ? '+' : ''}
                      {product.growth.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-pink-600 h-2 rounded-full"
                    style={{
                      width: `${(product.totalRevenue / salesData.totalRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">
            Top Customers
          </h3>
          <div className="space-y-3">
            {salesData.topCustomers.map((customer, idx) => (
              <div
                key={customer.customerId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.customerName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {customer.transactionCount} transactions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    ${customer.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {customer.lastPurchase}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">
          Sales by Period
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Period
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Revenue
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Sales
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Avg Order
                </th>
              </tr>
            </thead>
            <tbody>
              {salesData.salesByPeriod.map((period, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-800">
                  <td className="py-2 px-3 text-gray-900 dark:text-white">{period.date}</td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-white">
                    ${period.revenue.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                    {period.sales}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">
                    ${period.averageOrderValue.toFixed(2)}
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

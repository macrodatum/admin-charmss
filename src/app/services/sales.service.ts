/**
 * Sales Service
 * Mock service - Backend endpoint pendiente de implementación
 */

// Estructura de datos para venta por producto
export interface ProductSale {
  productType: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  growth: number; // Porcentaje de crecimiento
}

// Estructura para datos de ventas por período
export interface SalesPeriod {
  period: string; // 'daily', 'weekly', 'monthly'
  date: string;
  revenue: number;
  sales: number;
  averageOrderValue: number;
}

// Estructura para top clientes
export interface TopCustomer {
  customerId: number;
  customerName: string;
  totalSpent: number;
  transactionCount: number;
  lastPurchase: string;
}

// Estructura para resumen de ventas
export interface SalesSummary {
  performerId: string;
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  topSellingProduct: string;
  salesByProduct: ProductSale[];
  salesByPeriod: SalesPeriod[];
  topCustomers: TopCustomer[];
  revenueGrowth: number; // Porcentaje de crecimiento
  salesGrowth: number;
}

class SalesService {
  /**
   * Obtener resumen de ventas del performer
   * @param performerId ID del performer
   * @param period Período de análisis: 'daily', 'weekly', 'monthly'
   * @returns Resumen de ventas
   */
  async getSalesSummary(
    performerId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<SalesSummary> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Getting sales summary for performer', performerId, 'period:', period);

    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    return {
      performerId,
      totalRevenue: 8542.3,
      totalSales: 342,
      averageOrderValue: 24.98,
      topSellingProduct: 'Private Show',
      salesByProduct: [
        {
          productType: 'Private Show',
          totalSales: 125,
          totalRevenue: 4320.5,
          averagePrice: 34.56,
          growth: 12.5,
        },
        {
          productType: 'Video Call',
          totalSales: 89,
          totalRevenue: 2145.8,
          averagePrice: 24.11,
          growth: 8.3,
        },
        {
          productType: 'Tips',
          totalSales: 78,
          totalRevenue: 1234.0,
          averagePrice: 15.82,
          growth: -2.1,
        },
        {
          productType: 'Content Sale',
          totalSales: 50,
          totalRevenue: 842.0,
          averagePrice: 16.84,
          growth: 15.7,
        },
      ],
      salesByPeriod: [
        {
          period: 'weekly',
          date: '2025-01-06',
          revenue: 1234.5,
          sales: 45,
          averageOrderValue: 27.43,
        },
        {
          period: 'weekly',
          date: '2024-12-30',
          revenue: 987.3,
          sales: 38,
          averageOrderValue: 25.98,
        },
        {
          period: 'weekly',
          date: '2024-12-23',
          revenue: 1456.2,
          sales: 52,
          averageOrderValue: 28.0,
        },
        {
          period: 'weekly',
          date: '2024-12-16',
          revenue: 876.5,
          sales: 34,
          averageOrderValue: 25.78,
        },
      ],
      topCustomers: [
        {
          customerId: 1,
          customerName: 'User_001',
          totalSpent: 542.3,
          transactionCount: 18,
          lastPurchase: '2025-01-15',
        },
        {
          customerId: 2,
          customerName: 'User_002',
          totalSpent: 421.8,
          transactionCount: 15,
          lastPurchase: '2025-01-14',
        },
        {
          customerId: 3,
          customerName: 'User_003',
          totalSpent: 387.5,
          transactionCount: 12,
          lastPurchase: '2025-01-13',
        },
      ],
      revenueGrowth: 14.2,
      salesGrowth: 9.7,
    };
  }

  /**
   * Obtener ventas por producto
   * @param performerId ID del performer
   * @returns Ventas por tipo de producto
   */
  async getSalesByProduct(performerId: string): Promise<ProductSale[]> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Getting sales by product for performer', performerId);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const summary = await this.getSalesSummary(performerId);
    return summary.salesByProduct;
  }

  /**
   * Obtener ventas por período
   * @param performerId ID del performer
   * @param period Período de agrupación
   * @param limit Número de períodos a obtener
   * @returns Ventas por período
   */
  async getSalesByPeriod(
    performerId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly',
    limit = 10
  ): Promise<SalesPeriod[]> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Getting sales by period for performer', performerId, 'period:', period, 'limit:', limit);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const summary = await this.getSalesSummary(performerId, period);
    return summary.salesByPeriod.slice(0, limit);
  }

  /**
   * Obtener top clientes
   * @param performerId ID del performer
   * @param limit Número de clientes a obtener
   * @returns Top clientes
   */
  async getTopCustomers(performerId: string, limit = 10): Promise<TopCustomer[]> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Getting top customers for performer', performerId, 'limit:', limit);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const summary = await this.getSalesSummary(performerId);
    return summary.topCustomers.slice(0, limit);
  }
}

export default new SalesService();

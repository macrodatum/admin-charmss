/**
 * Payments Service
 * Mock service - Backend endpoint pendiente de implementación
 */

// Estructura de datos para pagos semanales
export interface WeeklyPayment {
  week: number;
  year: number;
  amount: number;
  status: 'GENERATED' | 'PENDING' | 'PAID' | 'FAILED';
  generatedDate?: string;
  paidDate?: string;
}

// Estructura para método de pago
export interface PaymentMethod {
  id: number;
  name: string;
  type: 'BANK_TRANSFER' | 'PAYPAL' | 'CRYPTOCURRENCY' | 'WIRE_TRANSFER';
  fee: string;
  minPayout: string;
  isActive: boolean;
  details?: Record<string, unknown>;
}

// Estructura para transacción
export interface Transaction {
  id: number;
  date: string;
  type: 'PRIVATE_SHOW' | 'TIPS' | 'VIDEO_CALL' | 'GIFTS' | 'STREAMING' | 'CONTENT_SALE';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description?: string;
}

// Estructura para resumen de pagos
export interface PaymentSummary {
  performerId: string;
  totalEarnings: number;
  weeklyEarnings: number;
  monthlyAverage: number;
  nextPayout: number;
  weeklyPayments: WeeklyPayment[];
  paymentMethods: PaymentMethod[];
  recentTransactions: Transaction[];
}

class PaymentsService {
  /**
   * Obtener resumen de pagos del performer
   * @param performerId ID del performer
   * @returns Resumen de pagos
   */
  async getPaymentSummary(performerId: string): Promise<PaymentSummary> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Getting payment summary for performer', performerId);

    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    return {
      performerId,
      totalEarnings: 2458.75,
      weeklyEarnings: 148.5,
      monthlyAverage: 592.4,
      nextPayout: 148.5,
      weeklyPayments: [
        { week: 12, year: 2025, amount: 0.09, status: 'GENERATED', generatedDate: '2025-03-20' },
        { week: 11, year: 2025, amount: 0.09, status: 'GENERATED', generatedDate: '2025-03-13' },
        { week: 10, year: 2025, amount: 1.98, status: 'GENERATED', generatedDate: '2025-03-06' },
        {
          week: 3,
          year: 2025,
          amount: 0.09,
          status: 'PAID',
          generatedDate: '2025-01-15',
          paidDate: '2025-01-20',
        },
        {
          week: 17,
          year: 2024,
          amount: 0.09,
          status: 'PAID',
          generatedDate: '2024-04-24',
          paidDate: '2024-04-28',
        },
      ],
      paymentMethods: [
        {
          id: 1,
          name: 'Bank Transfer',
          type: 'BANK_TRANSFER',
          fee: '2%',
          minPayout: '$50',
          isActive: true,
        },
        {
          id: 2,
          name: 'PayPal',
          type: 'PAYPAL',
          fee: '3%',
          minPayout: '$20',
          isActive: false,
        },
        {
          id: 3,
          name: 'Cryptocurrency',
          type: 'CRYPTOCURRENCY',
          fee: '1%',
          minPayout: '$10',
          isActive: true,
        },
        {
          id: 4,
          name: 'Wire Transfer',
          type: 'WIRE_TRANSFER',
          fee: '$15',
          minPayout: '$100',
          isActive: false,
        },
      ],
      recentTransactions: [
        {
          id: 1,
          date: '2025-01-15',
          type: 'PRIVATE_SHOW',
          amount: 45.5,
          status: 'COMPLETED',
          description: 'Private show - 30 minutes',
        },
        {
          id: 2,
          date: '2025-01-14',
          type: 'TIPS',
          amount: 23.75,
          status: 'COMPLETED',
          description: 'Tips from various users',
        },
        {
          id: 3,
          date: '2025-01-14',
          type: 'VIDEO_CALL',
          amount: 67.2,
          status: 'COMPLETED',
          description: 'Video call - 45 minutes',
        },
        {
          id: 4,
          date: '2025-01-13',
          type: 'GIFTS',
          amount: 12.3,
          status: 'PENDING',
          description: 'Virtual gifts',
        },
      ],
    };
  }

  /**
   * Obtener historial de transacciones
   * @param performerId ID del performer
   * @param limit Número de transacciones a obtener
   * @returns Lista de transacciones
   */
  async getTransactionHistory(performerId: string, limit = 50): Promise<Transaction[]> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Getting transaction history for performer', performerId, 'limit:', limit);

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Devolver solo las transacciones recientes del mock
    const summary = await this.getPaymentSummary(performerId);
    return summary.recentTransactions.slice(0, limit);
  }

  /**
   * Actualizar método de pago activo
   * @param performerId ID del performer
   * @param paymentMethodId ID del método de pago
   * @returns Método de pago actualizado
   */
  async setActivePaymentMethod(
    performerId: string,
    paymentMethodId: number
  ): Promise<PaymentMethod> {
    // TODO: Implementar llamada a backend cuando esté disponible
    console.log('Mock: Setting active payment method', paymentMethodId, 'for performer', performerId);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const summary = await this.getPaymentSummary(performerId);
    const method = summary.paymentMethods.find((m) => m.id === paymentMethodId);

    if (!method) {
      throw new Error('Payment method not found');
    }

    return { ...method, isActive: true };
  }
}

export default new PaymentsService();

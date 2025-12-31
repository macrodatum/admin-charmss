import React, { useState } from 'react';
import { X, AlertTriangle, DollarSign, Building2, User, CheckCircle } from 'lucide-react';

interface PaymentData {
  id: string | number;
  recipient_name: string;
  recipient_type: 'studio' | 'model' | 'other';
  amount: number;
  commission_amount?: number;
  net_amount?: number;
  commission_rate?: number;
}

interface PaymentConfirmationDialogProps {
  payment: PaymentData;
  onConfirm: (paymentMethod: string, notes: string) => void;
  onCancel: () => void;
}

const PAYMENT_METHODS = [
  { id: 'bank_transfer', name: 'Transferencia Bancaria', fee: '2%' },
  { id: 'paypal', name: 'PayPal', fee: '3%' },
  { id: 'wire_transfer', name: 'Wire Transfer', fee: '$15' },
  { id: 'cryptocurrency', name: 'Criptomoneda', fee: '1%' },
];

export default function PaymentConfirmationDialog({
  payment,
  onConfirm,
  onCancel,
}: PaymentConfirmationDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        onConfirm(selectedMethod, notes);
      }, 1500);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="modal-backdrop-adaptive">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Pago Procesado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              La transferencia se ha iniciado exitosamente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Confirmar Transferencia
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Revisa los detalles antes de procesar el pago
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                  Advertencia Importante
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  Esta acción iniciará una transferencia de fondos. Una vez procesada, no se puede
                  revertir. Asegúrate de que toda la información sea correcta.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                {payment.recipient_type === 'studio' ? (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Destinatario</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {payment.recipient_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.recipient_type === 'studio' ? 'Studio' : 'Modelo Independiente'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monto Total</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${payment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Comisión {payment.commission_rate && `(${payment.commission_rate}%)`}
                  </p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${(payment.commission_amount ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Neto a Transferir
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${(payment.net_amount ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Método de Pago
              </label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Comisión: {method.fee}
                        </p>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Agrega notas o referencias para esta transferencia..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-750">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-6 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5" />
                  Confirmar Transferencia
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Upload, CheckCircle, X } from 'lucide-react';

/**
 * Obtiene el icono correspondiente al estado de un asset
 * @param status - Estado del asset (pending, uploading, completed, failed)
 * @returns Elemento JSX del icono correspondiente
 */
export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Upload className="h-4 w-4 text-gray-400" />;
    case 'uploading':
      return (
        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      );
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'failed':
      return <X className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

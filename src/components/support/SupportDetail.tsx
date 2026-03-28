import React from 'react';
import {
  X,
  Mail,
  User,
  Calendar,
  Clock,
  FileText,
  Download,
  ExternalLink,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { SupportRequest } from '../../app/types/support.types';
import SupportService from '../../app/services/support.service';

interface SupportDetailProps {
  supportRequest: SupportRequest | null;
  onClose: () => void;
  onDownloadDocument?: (supportRequest: SupportRequest) => void;
}

export default function SupportDetail({ 
  supportRequest, 
  onClose,
  onDownloadDocument
}: SupportDetailProps) {
  if (!supportRequest) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = () => {
    switch (supportRequest.status) {
      case 'PENDING':
        return <Clock className="h-5 w-5" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-5 w-5" />;
      case 'RESOLVED':
        return <CheckCircle className="h-5 w-5" />;
      case 'CLOSED':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalle del Reporte #{supportRequest.id}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {SupportService.getRequirementTypeLabel(supportRequest.requirementType)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${SupportService.getStatusColor(supportRequest.status)}`}
            >
              {getStatusIcon()}
              <span className="ml-2">{SupportService.getStatusLabel(supportRequest.status)}</span>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información del Solicitante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Nombre Completo
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {supportRequest.fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Correo Electrónico
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {supportRequest.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Information */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información de la Solicitud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Tag className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Tipo de Solicitud
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {SupportService.getRequirementTypeLabel(supportRequest.requirementType)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Fecha de Solicitud
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(supportRequest.requestDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Descripción del Problema
            </h3>
            <div className="bg-white dark:bg-slate-600 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {supportRequest.notes}
              </p>
            </div>
          </div>

          {/* Document Information */}
          {supportRequest.documentUrl && (
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Documento Adjunto
              </h3>
              <div className="flex items-center justify-between bg-white dark:bg-slate-600 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Documento de Soporte
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {supportRequest.documentKey}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onDownloadDocument?.(supportRequest)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar</span>
                  </button>
                  <a
                    href={supportRequest.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Abrir</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Historial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Creado
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(supportRequest.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Última Actualización
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(supportRequest.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// Import missing icons from lucide-react
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
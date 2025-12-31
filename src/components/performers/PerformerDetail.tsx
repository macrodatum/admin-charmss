import React from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Video,
  DollarSign,
  Globe,
} from 'lucide-react';
import { Performer } from '../../app/types/performers.types';

interface PerformerDetailProps {
  performer: Performer | null;
  onClose: () => void;
}

export default function PerformerDetail({ performer, onClose }: PerformerDetailProps) {
  if (!performer) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Detalle del Performer</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              <img
                src={
                  performer.avatar_url ||
                  '/icons/default-avatar.svg'
                }
                alt={performer.full_name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-lg object-cover ring-4 ring-gray-200"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold text-gray-900">{performer.stage_name}</h3>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                      performer.status
                    )}`}
                  >
                    {getStatusText(performer.status)}
                  </span>
                </div>
                <p className="text-lg text-gray-600">{performer.full_name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm font-medium">{performer.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Teléfono</div>
                    <div className="text-sm font-medium">{performer.phone || 'No disponible'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">País</div>
                    <div className="text-sm font-medium">{performer.country}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tarifa por hora</div>
                    <div className="text-sm font-medium">${performer.hourly_rate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{performer.rating?.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Video className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{performer.total_shows}</div>
              <div className="text-sm text-gray-600">Shows realizados</div>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                {formatDate(performer.joined_date)}
              </div>
              <div className="text-sm text-gray-600">Fecha de ingreso</div>
            </div>

            <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-sm font-bold text-gray-900">
                {formatDate(performer.last_active)}
              </div>
              <div className="text-sm text-gray-600">Última actividad</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-600" />
                Idiomas
              </h4>
              <div className="flex flex-wrap gap-2">
                {performer.languages && performer.languages.length > 0 ? (
                  performer.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No especificado</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Categorías</h4>
              <div className="flex flex-wrap gap-2">
                {performer.categories && performer.categories.length > 0 ? (
                  performer.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No especificado</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Biografía</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {performer.bio || 'No hay biografía disponible.'}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

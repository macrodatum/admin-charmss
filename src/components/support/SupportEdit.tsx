import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Upload,
  File,
  AlertCircle,
  User,
  Mail,
  Calendar,
  FileText,
  Tag,
} from 'lucide-react';
import {
  SupportRequest,
  UpdateSupportRequestData,
  SupportStatusEnum,
  RequirementTypeEnum,
} from '../../app/types/support.types';
import SupportService from '../../app/services/support.service';

interface SupportEditProps {
  supportRequest: SupportRequest | null;
  onClose: () => void;
  onSave: (updatedRequest: SupportRequest) => void;
  onError?: (error: string) => void;
}

export default function SupportEdit({
  supportRequest,
  onClose,
  onSave,
  onError,
}: SupportEditProps) {
  const [formData, setFormData] = useState<UpdateSupportRequestData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (supportRequest) {
      setFormData({
        fullName: supportRequest.fullName,
        email: supportRequest.email,
        requestDate: supportRequest.requestDate.split('T')[0], // Convert to YYYY-MM-DD
        requirementType: supportRequest.requirementType,
        status: supportRequest.status,
        notes: supportRequest.notes,
      });
    }
  }, [supportRequest]);

  if (!supportRequest) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.fullName && !formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo no puede estar vacío';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (formData.requestDate && new Date(formData.requestDate) > new Date()) {
      newErrors.requestDate = 'La fecha no puede ser futura';
    }

    // Validate file if selected
    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (selectedFile.size > maxSize) {
        newErrors.file = 'El archivo no puede superar los 10MB';
      }

      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.file = 'Formato de archivo no válido. Permitidos: JPG, PNG, PDF, DOC, DOCX, TXT';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for update - only send changed fields
      const updateData: UpdateSupportRequestData = {};

      if (formData.fullName !== supportRequest.fullName) {
        updateData.fullName = formData.fullName;
      }
      if (formData.email !== supportRequest.email) {
        updateData.email = formData.email;
      }
      if (formData.requestDate !== supportRequest.requestDate.split('T')[0]) {
        updateData.requestDate = formData.requestDate;
      }
      if (formData.requirementType !== supportRequest.requirementType) {
        updateData.requirementType = formData.requirementType;
      }
      if (formData.status !== supportRequest.status) {
        updateData.status = formData.status;
      }
      if (formData.notes !== supportRequest.notes) {
        updateData.notes = formData.notes;
      }
      if (selectedFile) {
        updateData.file = selectedFile;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      const updatedRequest = await SupportService.updateSupportRequest(
        supportRequest.id,
        updateData
      );
      onSave(updatedRequest);
      onClose();
    } catch (error) {
      console.error('Error updating support request:', error);
      onError?.('Error al actualizar el reporte de soporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);

    // Clear previous file error
    if (errors.file) {
      const newErrors = { ...errors };
      delete newErrors.file;
      setErrors(newErrors);
    }
  };

  const handleInputChange = (field: keyof UpdateSupportRequestData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const formatDateForInput = (dateString: string) => {
    return dateString.split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Editar Reporte #{supportRequest.id}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Actualizar información del reporte
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="h-4 w-4" />
                  <span>Nombre Completo</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Request Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información de la Solicitud
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de Solicitud</span>
                </label>
                <input
                  type="date"
                  value={formData.requestDate || formatDateForInput(supportRequest.requestDate)}
                  onChange={(e) => handleInputChange('requestDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.requestDate ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                  }`}
                />
                {errors.requestDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.requestDate}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="h-4 w-4" />
                  <span>Tipo</span>
                </label>
                <select
                  value={formData.requirementType || ''}
                  onChange={(e) => handleInputChange('requirementType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={RequirementTypeEnum.COPYRIGHT}>Derechos de Autor</option>
                  <option value={RequirementTypeEnum.CONTENT_VIOLATION}>
                    Violación de Contenido
                  </option>
                  <option value={RequirementTypeEnum.TECHNICAL_ISSUE}>Problema Técnico</option>
                  <option value={RequirementTypeEnum.ACCOUNT_ISSUE}>Problema de Cuenta</option>
                  <option value={RequirementTypeEnum.PAYMENT_ISSUE}>Problema de Pago</option>
                  <option value={RequirementTypeEnum.OTHER}>Otro</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Estado</span>
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={SupportStatusEnum.PENDING}>Pendiente</option>
                  <option value={SupportStatusEnum.IN_REVIEW}>En Revisión</option>
                  <option value={SupportStatusEnum.RESOLVED}>Resuelto</option>
                  <option value={SupportStatusEnum.REJECTED}>Rechazado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="h-4 w-4" />
              <span>Notas / Descripción</span>
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada del problema..."
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Upload className="h-4 w-4" />
              <span>Nuevo Documento (opcional)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Formatos: JPG, PNG, PDF, DOC, DOCX, TXT. Máximo 10MB.
              </p>
              {selectedFile && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <File className="h-4 w-4" />
                  <span>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                  </span>
                </div>
              )}
              {errors.file && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* Current document info */}
            {supportRequest.documentUrl && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Documento actual:</strong> {supportRequest.documentKey}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Si subes un nuevo archivo, reemplazará al actual.
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Image as ImageIcon, FileText } from 'lucide-react';
import AssetPreviewModal from './AssetPreviewModal';
import { OnboardingData } from '../../types/onboarding';
import { getOnboardingData, decideOnboarding } from '../../app/services/onBoarding.service';
import type { ContentItem } from '../../types/content';

interface OnboardingModalProps {
  performerId?: number | string | null;
  onClose: () => void;
}

export default function OnboardingModal({ performerId, onClose }: OnboardingModalProps) {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ reason: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!performerId) return;
      setIsLoading(true);
      setError(null);
      try {
        const resp = await getOnboardingData(performerId);
        if (mounted) setData(resp);
      } catch {
        if (mounted) setError('Error al cargar los datos de onboarding');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [performerId]);

  if (!performerId) return null;

  const _allowed = new Set<number>([1, 2, 3, 4, 5]);
  const documents =
    data?.requestDocuments?.filter((d) => _allowed.has(Number(d.documentType))) ?? [];

  const handleConfirmApprove = () => setConfirmApprove(true);
  const doApprove = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const resp = await decideOnboarding(performerId!, 2, 'Aprobado');
      setData(resp);
      setActionResult('approved');
      setConfirmApprove(false);
    } catch (err) {
      console.error('Error aprovar onboarding', err);
      setActionError('Error al aprobar la inscripción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => setRejectModal({ reason: '' });
  const doReject = async (reason: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      const resp = await decideOnboarding(performerId!, 3, reason);
      setData(resp);
      setActionResult('rejected');
      setRejectModal(null);
    } catch (err) {
      console.error('Error rechazar onboarding', err);
      setActionError('Error al rechazar la inscripción');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data ? `${data.firstName} ${data.middleName ?? ''} ${data.lastName}` : 'Cargando...'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {data?.requestDate ? new Date(data.requestDate).toLocaleString() : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {actionResult === 'approved' && (
              <div className="px-3 py-2 bg-green-100 text-green-700 rounded">
                Inscripción aprobada
              </div>
            )}
            {actionResult === 'rejected' && (
              <div className="px-3 py-2 bg-red-100 text-red-700 rounded">Inscripción rechazada</div>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents grid */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-500" />
              Documentos
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-gray-500">
                Cargando documentos...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-6 text-gray-500">No hay documentos adjuntos.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className="cursor-pointer bg-gray-50 dark:bg-slate-700 rounded overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={doc.fileName}
                      alt={doc.documentName}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {doc.documentName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Subido: {new Date(doc.loadDate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Contract signature */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Firma</h4>
              {data?.sign ? (
                <div className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm p-4">
                  <img src={data.sign} alt="Firma" className="w-full h-40 object-contain" />
                  <div className="text-xs text-gray-500 mt-2">Firma subida por el performer</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No hay firma registrada</div>
              )}
            </div>
          </div>

          {/* Read-only details */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              Datos del performer
            </h3>

            {isLoading ? (
              <div className="text-gray-500">Cargando...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : !data ? (
              <div className="text-gray-500">Sin datos</div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <div>
                  <div className="text-xs text-gray-500">Nombre</div>
                  <div>
                    {data.firstName} {data.middleName ?? ''} {data.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div>{data.emailAddress}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Nick</div>
                  <div>{data.nickName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Fecha de nacimiento</div>
                  <div>{new Date(data.birthDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">País</div>
                  <div>{data.countryCode}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Género</div>
                  <div>{data.gender}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Fecha de solicitud</div>
                  <div>{new Date(data.requestDate).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Identificación</div>
                  <div>
                    {data.identificationNumber ?? '—'}{' '}
                    {data.identificationType ? `(${data.identificationType})` : ''}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleConfirmApprove}
                disabled={isLoading || !!actionResult || actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Aprobar inscripción
              </button>

              <button
                onClick={handleReject}
                disabled={isLoading || !!actionResult || actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Rechazar inscripción
              </button>
            </div>

            {actionError && <div className="text-sm text-red-500 mt-3">{actionError}</div>}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-750">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {selectedDoc !== null && (
        <AssetPreviewModal
          asset={
            {
              id: String(selectedDoc),
              type: 'photo',
              fileURLThumb:
                data?.requestDocuments.find((d) => d.id === selectedDoc)?.fileName ?? '',
              fileURL: data?.requestDocuments.find((d) => d.id === selectedDoc)?.fileName ?? '',
              assetName:
                data?.requestDocuments.find((d) => d.id === selectedDoc)?.documentName ?? '',
              description:
                data?.requestDocuments.find((d) => d.id === selectedDoc)?.documentName ?? '',
              price: 0,
              likes: 0,
              comments: 0,
              isLiked: false,
              creator: { id: '', username: '', avatar: '' },
              createdAt: new Date(
                data?.requestDocuments.find((d) => d.id === selectedDoc)?.loadDate ?? Date.now()
              ),
            } as ContentItem
          }
          editorialStatus={undefined}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {confirmApprove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-glass" />
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-lg w-full z-10">
            <h3 className="text-lg font-semibold mb-4">Confirmar aprobación</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Deseas aprobar la inscripción de este performer?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmApprove(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancelar
              </button>
              <button onClick={doApprove} className="px-4 py-2 rounded bg-green-600 text-white">
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-glass" />
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-lg w-full z-10">
            <h3 className="text-lg font-semibold mb-4">Rechazar inscripción</h3>
            <p className="text-sm text-gray-600 mb-2">Indica la causa del rechazo</p>
            <textarea
              aria-label="Motivo de rechazo"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ reason: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 min-h-30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => doReject(rejectModal.reason)}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

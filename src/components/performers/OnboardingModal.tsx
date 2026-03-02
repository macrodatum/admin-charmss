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

  // Per-document states
  const [docLoading, _setDocLoading] = useState<Record<number, boolean>>({});

  // Local staged statuses for images (modified locally, not yet sent)
  const [docStatuses, setDocStatuses] = useState<Record<number, number>>({});
  const [docNotes, setDocNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!performerId) return;
      setIsLoading(true);
      setError(null);
      try {
        const resp = await getOnboardingData(performerId);
        if (mounted) {
          setData(resp);
          // initialize local doc statuses from fetched data
          setDocStatuses({
            1: resp.statusCardFrontFile ?? 0,
            2: resp.statusCardBackFile ?? 0,
            3: resp.statusCardFrontFaceFile ?? 0,
            4: resp.statusCardBackFaceFile ?? 0,
            5: resp.statusProfileImageFile ?? 0,
            7: resp.statusProfileVideoFile ?? 0,
          });
        }
      } catch {
        if (mounted) setError('Error loading onboarding data');
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
  
  // Get profile video (documentType 7)
  const profileVideo = data?.requestDocuments?.find((d) => Number(d.documentType) === 7);

  const getDocTypeName = (documentType: number): string => {
    switch (documentType) {
      case 1: return 'ID Front';
      case 2: return 'ID Back';
      case 3: return 'ID Front with Face';
      case 4: return 'ID Back with Face';
      case 5: return 'Profile Photo';
      case 7: return 'Profile Video';
      default: return 'Document';
    }
  };

  const getDocStatus = (documentType: number) => {
    // prioritize local staged status
    if (docStatuses && docStatuses[documentType] !== undefined) return docStatuses[documentType];
    if (!data) return 0;
    switch (Number(documentType)) {
      case 1:
        return data.statusCardFrontFile;
      case 2:
        return data.statusCardBackFile;
      case 3:
        return data.statusCardFrontFaceFile;
      case 4:
        return data.statusCardBackFaceFile;
      case 5:
        return data.statusProfileImageFile;
      case 7:
        return data.statusProfileVideoFile ?? 0;
      default:
        return 0;
    }
  };

  const handleApproveDoc = (docId: number, documentType: number) => {
    // stage approval locally
    setDocStatuses((s) => ({ ...s, [documentType]: 2 }));
    // clear any previous note
    setDocNotes((s) => {
      const copy = { ...s };
      delete copy[documentType];
      return copy;
    });
  };

  const handleOpenRejectDoc = (docId: number) => {
    // find document and immediately stage as Rejected without asking for reason
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    // stage rejection locally with empty note
    setDocStatuses((s) => ({ ...s, [Number(doc.documentType)]: 3 }));
    setDocNotes((s) => {
      const copy = { ...s };
      copy[Number(doc.documentType)] = '';
      return copy;
    });
  };

  const _doRejectDoc = (docId: number, documentType: number, reason: string) => {
    // kept for compatibility but not used to show modal anymore
    setDocStatuses((s) => ({ ...s, [documentType]: 3 }));
    setDocNotes((s) => ({ ...s, [documentType]: reason ?? '' }));
  };

  const handleConfirmApprove = () => setConfirmApprove(true);
  const doApprove = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      // Build explicit document status fields from staged statuses
      const documentStatusFields: Record<string, number> = {};
      const docMap: Record<number, string> = {
        1: 'statusCardFrontFile',
        2: 'statusCardBackFile',
        3: 'statusCardFrontFaceFile',
        4: 'statusCardBackFaceFile',
        5: 'statusProfileImageFile',
        7: 'statusProfileVideoFile',
      };

      [1, 2, 3, 4, 5, 7].forEach((dt) => {
        if (docStatuses && docStatuses[dt] !== undefined) {
          documentStatusFields[docMap[dt]] = docStatuses[dt];
        }
      });

      const resp = await decideOnboarding(
        performerId!,
        2,
        'Approved',
        undefined,
        docNotes,
        documentStatusFields
      );
      // Ensure we have a status locally even if backend doesn't return it
      const updated = { ...resp, status: resp.status ?? 2 } as OnboardingData;
      setData(updated);
      setActionResult('approved');
      setConfirmApprove(false);
    } catch (err) {
      console.error('Error approving onboarding', err);
      setActionError('Error approving registration');
    } finally {
      setActionLoading(false);
    }
  };

  const getRequestStatusLabel = (s: number | undefined | null) => {
    switch (String(s)) {
      case '1':
        return 'Pending';
      case '2':
        return 'Approved';
      case '3':
        return 'Rejected';
      default:
        return '';
    }
  };

  const getRequestStatusColor = (s: number | undefined | null) => {
    switch (String(s)) {
      case '1':
        return 'bg-yellow-100 text-yellow-800';
      case '2':
        return 'bg-green-100 text-green-700';
      case '3':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleReject = () => setRejectModal({ reason: '' });
  const doReject = async (reason: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      // Build explicit document status fields from staged statuses
      const documentStatusFields: Record<string, number> = {};
      const docMap: Record<number, string> = {
        1: 'statusCardFrontFile',
        2: 'statusCardBackFile',
        3: 'statusCardFrontFaceFile',
        4: 'statusCardBackFaceFile',
        5: 'statusProfileImageFile',
        7: 'statusProfileVideoFile',
      };

      [1, 2, 3, 4, 5, 7].forEach((dt) => {
        if (docStatuses && docStatuses[dt] !== undefined) {
          documentStatusFields[docMap[dt]] = docStatuses[dt];
        }
      });

      const resp = await decideOnboarding(
        performerId!,
        3,
        reason,
        undefined,
        docNotes,
        documentStatusFields
      );
      // Ensure we have a status locally even if backend doesn't return it
      const updated = { ...resp, status: resp.status ?? 3 } as OnboardingData;
      setData(updated);
      setActionResult('rejected');
      setRejectModal(null);
    } catch (err) {
      console.error('Error rejecting onboarding', err);
      setActionError('Error rejecting registration');
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
              {data ? `${data.firstName} ${data.middleName ?? ''} ${data.lastName}` : 'Loading...'}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-gray-400">
                {data?.requestDate ? new Date(data.requestDate).toLocaleString() : ''}
              </p>

              {(() => {
                // Show a status badge; default to Pending (1) when backend doesn't provide a status
                const displayedStatus = data?.status;

                return (
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getRequestStatusColor(
                      displayedStatus
                    )}`}
                  >
                    {getRequestStatusLabel(displayedStatus)}
                  </span>
                );
              })()}

              {(data?.processMessage ?? data?.notes) && (
                <div className="text-xs text-gray-500">{data.processMessage ?? data?.notes}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actionResult === 'approved' && (
              <div className="px-3 py-2 bg-green-100 text-green-700 rounded">
                Registration approved
              </div>
            )}
            {actionResult === 'rejected' && (
              <div className="px-3 py-2 bg-red-100 text-red-700 rounded">Registration rejected</div>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Close"
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
              Documents
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-gray-500">
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-6 text-gray-500">No documents attached.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-50 dark:bg-slate-700 rounded overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <div onClick={() => setSelectedDoc(doc.id)} className="cursor-pointer relative">
                      <div className="absolute top-0 left-0 right-0 bg-black/60 text-white text-xs font-semibold px-2 py-1 z-10">
                        {getDocTypeName(Number(doc.documentType))}
                      </div>
                      <img
                        src={doc.fileName}
                        alt={doc.documentName}
                        className="w-full h-40 object-cover"
                      />
                    </div>

                    <div className="p-3">
                      <div className="flex flex-col items-center justify-between">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {doc.documentName}
                        </div>
                        <div className="text-xs">
                          {getDocStatus(Number(doc.documentType)) === 2 ? (
                            <span className="px-2 py-1 rounded bg-green-100 text-green-700">
                              Approved
                            </span>
                          ) : getDocStatus(Number(doc.documentType)) === 3 ? (
                            <span className="px-2 py-1 rounded bg-red-100 text-red-700">
                              Rejected
                            </span>
                          ) : getDocStatus(Number(doc.documentType)) === 1 ? (
                            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                              Under review
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        Uploaded: {new Date(doc.loadDate).toLocaleString()}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveDoc(doc.id, Number(doc.documentType));
                          }}
                          disabled={!!docLoading[doc.id]}
                          className="flex-none flex items-center justify-center gap-2 px-2 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRejectDoc(doc.id);
                          }}
                          disabled={!!docLoading[doc.id]}
                          className="flex-none flex items-center justify-center gap-2 px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>

                      {actionError && (
                        <div className="text-sm text-red-500 mt-2">{actionError}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile Video */}
            {profileVideo && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Profile Video
                </h4>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm">
                  <video 
                    controls 
                    className="w-full h-auto max-h-96 object-contain bg-black"
                    preload="metadata"
                  >
                    <source src={profileVideo.fileName} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                  <div className="p-3">
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {profileVideo.documentName}
                        </div>
                        <div className="text-xs">
                          {getDocStatus(7) === 2 ? (
                            <span className="px-2 py-1 rounded bg-green-100 text-green-700">
                              Approved
                            </span>
                          ) : getDocStatus(7) === 3 ? (
                            <span className="px-2 py-1 rounded bg-red-100 text-red-700">
                              Rejected
                            </span>
                          ) : getDocStatus(7) === 1 ? (
                            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                              Under review
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Uploaded: {new Date(profileVideo.loadDate).toLocaleString()}
                      </div>
                      <div className="flex gap-2 w-full mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveDoc(profileVideo.id, 7);
                          }}
                          disabled={!!docLoading[profileVideo.id]}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRejectDoc(profileVideo.id);
                          }}
                          disabled={!!docLoading[profileVideo.id]}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contract signature */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Signature</h4>
              {data?.sign ? (
                <div className="bg-slate-800 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm p-4">
                  <img src={data.sign} alt="Signature" className="w-full h-40 object-contain" />
                  <div className="text-xs text-gray-500 mt-2">Signature uploaded by performer</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No signature registered</div>
              )}
            </div>
          </div>

          {/* Read-only details */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              Performer Info
            </h3>

            {isLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : !data ? (
              <div className="text-gray-500">No data</div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div>
                    {data.firstName} {data.middleName ?? ''} {data.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div>{data.emailAddress}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Nickname</div>
                  <div>{data.nickName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Birth Date</div>
                  <div>{new Date(data.birthDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Country</div>
                  <div>{data.countryCode}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Gender</div>
                  <div>{data.gender}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Request Date</div>
                  <div>{new Date(data.requestDate).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">ID Number</div>
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
                Approve Registration
              </button>

              <button
                onClick={handleReject}
                disabled={isLoading || !!actionResult || actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject Registration
              </button>
            </div>

            {actionError && <div className="text-sm text-red-500 mt-3">{actionError}</div>}
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
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {confirmApprove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-glass" />
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-lg w-full z-10">
            <h3 className="text-lg font-semibold mb-4">Confirm Approval</h3>
            <p className="text-sm text-gray-600 mb-4">
              Do you want to approve this performer's registration?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmApprove(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button onClick={doApprove} className="px-4 py-2 rounded bg-green-600 text-white">
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-glass" />
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-lg w-full z-10">
            <h3 className="text-lg font-semibold mb-4">Reject Registration</h3>
            <p className="text-sm text-gray-600 mb-2">Indicate the reason for rejection</p>
            <textarea
              aria-label="Rejection reason"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ reason: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 min-h-30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => doReject(rejectModal.reason)}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LegalModal from './legal/LegalModal';
import LegalService from '../app/services/legal.service';

const ALLOWED_COOKIE = 'allowed-terms';
const GDPR_COOKIE = 'gdpr';

export default function CookieConsent() {
  const initialAllowed = Cookies.get(ALLOWED_COOKIE) === 'true';
  const initialGdpr = Cookies.get(GDPR_COOKIE) === 'true';
  const initialSessionAllowed = sessionStorage.getItem('allowed-terms-session') === 'true';

  const [visible, setVisible] = useState(!initialAllowed && !initialSessionAllowed);
  const gdprPresent = initialGdpr; // read-only, determined at mount
  const [gdprAccepted, setGdprAccepted] = useState(initialGdpr);
  const [gdprContent, setGdprContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialGdpr);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!gdprPresent) {
      // fetch GDPR content
      LegalService.getLegalByName('Política de privacidad')
        .then((d) => setGdprContent(d.content || null))
        .catch(() => setGdprContent(null))
        .finally(() => setLoading(false));
    }
  }, [gdprPresent]);

  const acceptPersistent = () => {
    if (!gdprPresent && !gdprAccepted) return;
    Cookies.set(ALLOWED_COOKIE, 'true', { expires: 365 });
    if (gdprAccepted) Cookies.set(GDPR_COOKIE, 'true', { expires: 365 });
    setVisible(false);
  };

  const dismissSession = () => {
    // Just hide for now, do NOT persist dismissal so GDPR consent can be shown again later
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed left-4 right-4 bottom-4 md:left-8 md:right-8 md:bottom-8 z-50">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg p-4 flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-200">
                Usamos cookies para mejorar tu experiencia.
              </div>
              <div className="text-xs text-gray-400">
                Puedes leer la política y aceptar los términos.
              </div>
            </div>

            {!gdprPresent && (
              <div className="mt-3">
                <div className="text-sm text-gray-700 dark:text-gray-200 mb-2 font-semibold">
                  Cláusula GDPR
                </div>
                <div className="max-h-40 overflow-auto prose prose-slate dark:prose-invert text-sm text-gray-700 dark:text-gray-200">
                  {loading ? (
                    <div>Cargando cláusula...</div>
                  ) : gdprContent ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{gdprContent}</ReactMarkdown>
                  ) : (
                    <div>No se pudo cargar la cláusula.</div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 mt-3 text-sm">
                  <input
                    type="checkbox"
                    checked={gdprAccepted}
                    onChange={(e) => setGdprAccepted(e.target.checked)}
                    className="form-checkbox h-4 w-4"
                  />
                  <span className="text-gray-700 dark:text-gray-200">Acepto la cláusula GDPR</span>
                </label>
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  setModalOpen(true);
                }}
                className="text-sm underline hover:no-underline"
                type="button"
              >
                Leer política
              </button>

              <button
                onClick={acceptPersistent}
                disabled={!gdprPresent && !gdprAccepted}
                className={`ml-auto px-4 py-2 rounded-lg text-sm text-white ${
                  !gdprPresent && !gdprAccepted
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
                type="button"
              >
                Aceptar cookies
              </button>

              <button
                onClick={dismissSession}
                className="ml-2 px-3 py-2 rounded-lg text-sm bg-transparent text-gray-600 hover:text-gray-900 dark:text-gray-300"
                type="button"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <LegalModal
        name="Política de privacidad"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

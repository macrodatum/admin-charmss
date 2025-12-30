import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CookieConsent from '../../components/CookieConsent';
import Cookies from 'js-cookie';
import LegalService from '../../app/services/legal.service';
import { vi, type Mock } from 'vitest';
import type { LegalDocument } from '../../app/types/legal.types';

vi.mock('js-cookie');

describe('CookieConsent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows consent bar when cookies not present and requires checkbox', async () => {
    (Cookies.get as unknown as Mock).mockImplementation((_k: string) => undefined);
    vi.spyOn(LegalService, 'getLegalByName').mockResolvedValue({
      id: 1,
      name: 'gdpr',
      content: 'gdpr content',
      version: '1',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as LegalDocument);

    render(<CookieConsent />);

    await waitFor(() => expect(screen.getByText(/Usamos cookies/i)).toBeInTheDocument());

    const acceptBtn = screen.getByRole('button', { name: /Aceptar cookies/i });
    expect(acceptBtn).toBeDisabled();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(acceptBtn).not.toBeDisabled();

    fireEvent.click(acceptBtn);

    await waitFor(() =>
      expect(Cookies.set).toHaveBeenCalledWith('allowed-terms', 'true', { expires: 365 })
    );
  });

  it('does not show gdpr content if gdpr cookie present', async () => {
    (Cookies.get as unknown as Mock).mockImplementation((k: string) =>
      k === 'gdpr' ? 'true' : undefined
    );

    render(<CookieConsent />);

    await waitFor(() => expect(screen.getByText(/Usamos cookies/i)).toBeInTheDocument());

    expect(screen.queryByText(/Cláusula GDPR/i)).not.toBeInTheDocument();
  });

  it('hides bar when dismissed but does not persist session flag', async () => {
    (Cookies.get as unknown as Mock).mockImplementation((_k: string) => undefined);
    vi.spyOn(LegalService, 'getLegalByName').mockResolvedValue({
      id: 1,
      name: 'gdpr',
      content: 'gdpr content',
      version: '1',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as LegalDocument);

    sessionStorage.removeItem('allowed-terms-session');

    const { unmount } = render(<CookieConsent />);

    await waitFor(() => expect(screen.getByText(/Usamos cookies/i)).toBeInTheDocument());

    const dismissBtn = screen.getByRole('button', { name: /Cerrar/i });
    fireEvent.click(dismissBtn);

    // Should not set session flag
    expect(sessionStorage.getItem('allowed-terms-session')).toBeNull();
    expect(screen.queryByText(/Usamos cookies/i)).not.toBeInTheDocument();

    // Unmount and re-render to simulate a new page load - bar should appear again
    unmount();
    render(<CookieConsent />);
    await waitFor(() => expect(screen.getByText(/Usamos cookies/i)).toBeInTheDocument());
  });
});

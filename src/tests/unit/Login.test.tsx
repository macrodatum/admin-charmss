import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Login from '../../pages/Login';
import * as authService from '../../app/services/auth.service';
import type { LoginConfig } from '../../app/services/auth.service';
import LegalService from '../../app/services/legal.service';
import type { LegalDocument } from '../../app/types/legal.types';
import { vi } from 'vitest';

const mockConfig = {
  title: 'Test',
  subtitle: 'subtitle',
  features: [],
  oauth: { google: { enabled: false, url: '' }, facebook: { enabled: false, url: '' } },
};

describe('Login page legal links', () => {
  beforeEach(() => {
    vi.spyOn(authService, 'fetchLoginConfig').mockResolvedValue(mockConfig as LoginConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens legal modal when links are clicked', async () => {
    const doc = {
      id: 1,
      name: 'Política de privacidad',
      content: '**Privacidad**',
      version: '1.0',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.spyOn(LegalService, 'getLegalByName').mockResolvedValue(doc as LegalDocument);

    render(<Login />);

    await waitFor(() => expect(screen.getByText('Welcome Back')).toBeInTheDocument());

    const privacyButton = screen.getByText('Política de privacidad');
    fireEvent.click(privacyButton);

    await waitFor(() =>
      expect(LegalService.getLegalByName).toHaveBeenCalledWith('Política de privacidad')
    );
    await waitFor(() => expect(screen.getByText('Privacidad')).toBeInTheDocument());
  });
});

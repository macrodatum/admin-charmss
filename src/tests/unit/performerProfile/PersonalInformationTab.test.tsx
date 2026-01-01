import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PersonalInformationTab from '../../../components/performerProfile/PersonalInformationTab';
import PerformerProfileService from '../../../app/services/performerProfile.service';
import type { Performer } from '../../../app/types/performers.types';

vi.mock('../../../app/services/performerProfile.service');

describe('PersonalInformationTab', () => {
  const mockPerformer: Performer = {
    id: '1',
    full_name: 'Test Fullname',
    stage_name: 'TestPerformer',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    rating: 4.5,
    total_shows: 100,
    status: 'active',
    // New: include performerProfile directly as the component reads it from the performer prop
    performerProfile: {
      nickName: 'TestNick',
      headLines: 'Test headline',
      showDescription: 'Test description',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders performer information correctly', async () => {
    // The component reads the profile from the performer prop (performer.performerProfile)
    render(<PersonalInformationTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByText('TestPerformer')).toBeInTheDocument();
      expect(screen.getByText(/4.5/)).toBeInTheDocument();
      expect(screen.getByText(/100 shows/)).toBeInTheDocument();
      // nickname should come from performer.performerProfile
      expect(screen.getByDisplayValue('TestNick')).toBeInTheDocument();
    });
  });

  it('loads profile data on mount from performer prop', async () => {
    render(<PersonalInformationTab performer={mockPerformer} />);

    const nicknameInput = await screen.findByDisplayValue('TestNick');
    expect(nicknameInput).toBeInTheDocument();
  });

  it('updates form data when inputs change', async () => {
    render(<PersonalInformationTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TestNick')).toBeInTheDocument();
    });

    const nicknameInput = screen.getByDisplayValue('TestNick') as HTMLInputElement;
    fireEvent.change(nicknameInput, { target: { value: 'NewNick' } });

    expect(nicknameInput.value).toBe('NewNick');
  });

  it('saves profile data when save button is clicked', async () => {
    vi.mocked(PerformerProfileService.updatePerformerProfile).mockResolvedValue({} as any);

    render(<PersonalInformationTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TestNick')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save personal');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(PerformerProfileService.updatePerformerProfile).toHaveBeenCalledWith('1', {
        nickName: 'TestNick',
        headLines: 'Test headline',
        showDescription: 'Test description',
      });
    });

    expect(await screen.findByText('Personal guardado correctamente')).toBeInTheDocument();
  });

  it('displays error message when save fails', async () => {
    vi.mocked(PerformerProfileService.updatePerformerProfile).mockRejectedValue(
      new Error('Save failed')
    );

    render(<PersonalInformationTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TestNick')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save personal');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Error guardando Personal')).toBeInTheDocument();
    });
  });

  it('does not show loading state (profile is available on performer prop)', () => {
    render(<PersonalInformationTab performer={mockPerformer} />);

    // The component reads profile synchronously from the performer prop, so the loading text should not be present
    expect(screen.queryByText('Cargando información personal...')).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProfileTab from '../../../components/performerProfile/ProfileTab';
import PerformerProfileService from '../../../app/services/performerProfile.service';

vi.mock('../../../app/services/performerProfile.service');

describe('ProfileTab', () => {
  const mockPerformer = {
    id: '1',
    performerProfile: {
      age: 26,
      height: 165,
      weight: 60,
      countryCode: 'Colombia +57',
      twitterLink: 'https://twitter.com/test',
      instagramLink: 'https://instagram.com/test',
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile form fields from performer prop', async () => {
    render(<ProfileTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByText('26 years')).toBeInTheDocument();
      expect(screen.getByText('165 cms')).toBeInTheDocument();
      expect(screen.getByText('60 kl')).toBeInTheDocument();
    });
  });

  it('uses performer prop to populate fields on mount', async () => {
    render(<ProfileTab performer={mockPerformer} />);

    await waitFor(() => {
      // ensure we didn't call the fetching service
      expect(PerformerProfileService.getPerformerProfile).not.toHaveBeenCalled();
      expect(screen.getByText('26 years')).toBeInTheDocument();
    });
  });

  it('updates age slider value', async () => {
    render(<ProfileTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByText('26 years')).toBeInTheDocument();
    });

    const ageSlider = screen.getAllByRole('slider')[0] as HTMLInputElement;
    fireEvent.change(ageSlider, { target: { value: '30' } });

    expect(await screen.findByText('30 years')).toBeInTheDocument();
  });

  it('saves profile data when save button is clicked', async () => {
    vi.mocked(PerformerProfileService.updatePerformerProfile).mockResolvedValue({} as any);

    render(<ProfileTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByText('26 years')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(PerformerProfileService.updatePerformerProfile).toHaveBeenCalledWith('1', expect.any(Object));
    });

    expect(await screen.findByText('Profile guardado correctamente')).toBeInTheDocument();
  });

  it('displays error message when save fails', async () => {
    vi.mocked(PerformerProfileService.updatePerformerProfile).mockRejectedValue(
      new Error('Save failed')
    );

    render(<ProfileTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByText('26 years')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Error guardando Profile')).toBeInTheDocument();
    });
  });

  it('does not show loading state initially when performer is provided', () => {
    render(<ProfileTab performer={mockPerformer} />);

    expect(screen.queryByText('Cargando perfil...')).not.toBeInTheDocument();
  });
});

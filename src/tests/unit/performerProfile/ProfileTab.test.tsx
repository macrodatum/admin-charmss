import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProfileTab from '../../../components/performerProfile/ProfileTab';
import PerformerProfileService from '../../../app/services/performerProfile.service';

vi.mock('../../../app/services/performerProfile.service');

describe('ProfileTab', () => {
  const mockProps = {
    performerId: '1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile form fields', async () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      age: 26,
      height: 165,
      weight: 60,
      countryCode: 'Colombia +57',
      twitterLink: 'https://twitter.com/test',
      instagramLink: 'https://instagram.com/test',
    } as any);

    render(<ProfileTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('26 years')).toBeInTheDocument();
      expect(screen.getByText('165 cms')).toBeInTheDocument();
      expect(screen.getByText('60 kl')).toBeInTheDocument();
    });
  });

  it('loads profile data on mount', async () => {
    const mockProfile = {
      age: 26,
      height: 165,
      weight: 60,
      countryCode: 'Colombia +57',
      twitterLink: 'https://twitter.com/test',
      instagramLink: 'https://instagram.com/test',
    };

    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue(mockProfile as any);

    render(<ProfileTab {...mockProps} />);

    await waitFor(() => {
      expect(PerformerProfileService.getPerformerProfile).toHaveBeenCalledWith('1');
    });
  });

  it('updates age slider value', async () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      age: 26,
    } as any);

    render(<ProfileTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('26 years')).toBeInTheDocument();
    });

    const ageSlider = screen.getAllByRole('slider')[0] as HTMLInputElement;
    fireEvent.change(ageSlider, { target: { value: '30' } });

    expect(await screen.findByText('30 years')).toBeInTheDocument();
  });

  it('saves profile data when save button is clicked', async () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      age: 26,
      height: 165,
      weight: 60,
    } as any);

    vi.mocked(PerformerProfileService.updatePerformerProfile).mockResolvedValue({} as any);

    render(<ProfileTab {...mockProps} />);

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
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      age: 26,
    } as any);

    vi.mocked(PerformerProfileService.updatePerformerProfile).mockRejectedValue(
      new Error('Save failed')
    );

    render(<ProfileTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('26 years')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Error guardando Profile')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ProfileTab {...mockProps} />);

    expect(screen.getByText('Cargando perfil...')).toBeInTheDocument();
  });
});

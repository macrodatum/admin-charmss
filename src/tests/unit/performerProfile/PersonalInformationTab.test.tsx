import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PersonalInformationTab from '../../../components/performerProfile/PersonalInformationTab';
import PerformerProfileService from '../../../app/services/performerProfile.service';

vi.mock('../../../app/services/performerProfile.service');

describe('PersonalInformationTab', () => {
  const mockProps = {
    performerId: '1',
    stageName: 'TestPerformer',
    avatarUrl: 'https://example.com/avatar.jpg',
    rating: 4.5,
    totalShows: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders performer information correctly', async () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      nickName: 'TestNick',
      headLines: 'Test headline',
      showDescription: 'Test description',
    } as any);

    render(<PersonalInformationTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('TestPerformer')).toBeInTheDocument();
      expect(screen.getByText(/4.5/)).toBeInTheDocument();
      expect(screen.getByText(/100 shows/)).toBeInTheDocument();
    });
  });

  it('loads profile data on mount', async () => {
    const mockProfile = {
      nickName: 'TestNick',
      headLines: 'Test headline',
      showDescription: 'Test description',
    };

    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue(mockProfile as any);

    render(<PersonalInformationTab {...mockProps} />);

    await waitFor(() => {
      expect(PerformerProfileService.getPerformerProfile).toHaveBeenCalledWith('1');
    });

    const nicknameInput = await screen.findByDisplayValue('TestNick');
    expect(nicknameInput).toBeInTheDocument();
  });

  it('updates form data when inputs change', async () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      nickName: 'TestNick',
      headLines: 'Test headline',
      showDescription: 'Test description',
    } as any);

    render(<PersonalInformationTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TestNick')).toBeInTheDocument();
    });

    const nicknameInput = screen.getByDisplayValue('TestNick') as HTMLInputElement;
    fireEvent.change(nicknameInput, { target: { value: 'NewNick' } });

    expect(nicknameInput.value).toBe('NewNick');
  });

  it('saves profile data when save button is clicked', async () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      nickName: 'TestNick',
      headLines: 'Test headline',
      showDescription: 'Test description',
    } as any);

    vi.mocked(PerformerProfileService.updatePerformerProfile).mockResolvedValue({} as any);

    render(<PersonalInformationTab {...mockProps} />);

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
    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      nickName: 'TestNick',
      headLines: 'Test headline',
      showDescription: 'Test description',
    } as any);

    vi.mocked(PerformerProfileService.updatePerformerProfile).mockRejectedValue(
      new Error('Save failed')
    );

    render(<PersonalInformationTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('TestNick')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save personal');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Error guardando Personal')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    vi.mocked(PerformerProfileService.getPerformerProfile).mockImplementation(
      () => new Promise(() => {})
    );

    render(<PersonalInformationTab {...mockProps} />);

    expect(screen.getByText('Cargando información personal...')).toBeInTheDocument();
  });
});

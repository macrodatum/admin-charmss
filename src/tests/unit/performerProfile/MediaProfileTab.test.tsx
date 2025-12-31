import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MediaProfileTab from '../../../components/performerProfile/MediaProfileTab';
import { getContentByPerformerProfileId } from '../../../app/services/content.service';
import PerformersService from '../../../app/services/performers.service';

vi.mock('../../../app/services/content.service');
vi.mock('../../../app/services/performers.service');

describe('MediaProfileTab', () => {
  const mockPerformer = {
    id: '1',
    performerProfile: { id: 100 },
    avatar_url: 'https://example.com/avatar.jpg',
  };

  const mockMediaItems = {
    items: [
      {
        id: 1,
        type: 'photo',
        fileURL: 'https://example.com/photo1.jpg',
        fileURLThumb: 'https://example.com/photo1_thumb.jpg',
        assetName: 'Photo 1',
        status: 3,
      },
      {
        id: 2,
        type: 'video',
        fileURL: 'https://example.com/video1.mp4',
        fileURLThumb: 'https://example.com/video1_thumb.jpg',
        assetName: 'Video 1',
        status: 3,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays approved media items', async () => {
    vi.mocked(getContentByPerformerProfileId).mockResolvedValue(mockMediaItems as any);

    render(<MediaProfileTab performer={mockPerformer as any} />);

    await waitFor(() => {
      expect(screen.getByText('Avatar del perfil')).toBeInTheDocument();
      expect(screen.getByText('Video de presentación')).toBeInTheDocument();
    });
  });

  it('filters and displays only approved photos', async () => {
    vi.mocked(getContentByPerformerProfileId).mockResolvedValue(mockMediaItems as any);

    render(<MediaProfileTab performer={mockPerformer as any} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('selects an image when clicked', async () => {
    vi.mocked(getContentByPerformerProfileId).mockResolvedValue(mockMediaItems as any);

    render(<MediaProfileTab performer={mockPerformer as any} />);

    await waitFor(() => {
      expect(screen.getByText('Avatar del perfil')).toBeInTheDocument();
    });

    const imageContainer = screen.getAllByRole('img')[0].parentElement;
    if (imageContainer) {
      fireEvent.click(imageContainer);
    }

    await waitFor(() => {
      expect(screen.getByText('Asignar como Avatar')).not.toBeDisabled();
    });
  });

  it('assigns avatar when button is clicked', async () => {
    vi.mocked(getContentByPerformerProfileId).mockResolvedValue(mockMediaItems as any);
    vi.mocked(PerformersService.assignProfileAsset).mockResolvedValue({
      url: 'https://example.com/new-avatar.jpg',
    } as any);

    render(<MediaProfileTab performer={mockPerformer as any} />);

    await waitFor(() => {
      expect(screen.getByText('Avatar del perfil')).toBeInTheDocument();
    });

    // Select image
    const imageContainer = screen.getAllByRole('img')[0].parentElement;
    if (imageContainer) {
      fireEvent.click(imageContainer);
    }

    // Click assign button
    const assignButton = await screen.findByText('Asignar como Avatar');
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(PerformersService.assignProfileAsset).toHaveBeenCalledWith('1', '1');
      expect(screen.getByText('Avatar asignado correctamente')).toBeInTheDocument();
    });
  });

  it('displays error when assignment fails', async () => {
    vi.mocked(getContentByPerformerProfileId).mockResolvedValue(mockMediaItems as any);
    vi.mocked(PerformersService.assignProfileAsset).mockRejectedValue(new Error('Failed'));

    render(<MediaProfileTab performer={mockPerformer as any} />);

    await waitFor(() => {
      expect(screen.getByText('Avatar del perfil')).toBeInTheDocument();
    });

    // Select image
    const imageContainer = screen.getAllByRole('img')[0].parentElement;
    if (imageContainer) {
      fireEvent.click(imageContainer);
    }

    // Click assign button
    const assignButton = await screen.findByText('Asignar como Avatar');
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(screen.getByText('Error asignando avatar')).toBeInTheDocument();
    });
  });

  it('shows message when no approved media exists', async () => {
    vi.mocked(getContentByPerformerProfileId).mockResolvedValue({ items: [] } as any);

    render(<MediaProfileTab performer={mockPerformer as any} />);

    await waitFor(() => {
      expect(screen.getByText('No hay imágenes aprobadas disponibles')).toBeInTheDocument();
      expect(screen.getByText('No hay videos aprobados disponibles')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    vi.mocked(getContentByPerformerProfileId).mockImplementation(() => new Promise(() => {}));

    render(<MediaProfileTab performer={mockPerformer as any} />);

    expect(screen.getByText('Cargando media...')).toBeInTheDocument();
  });
});

import React from 'react';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ContentApprovalModal from '../../components/performers/ContentApprovalModal';
import * as contentService from '../../app/services/content.service';
import { Performer, PerformerStatusEnum } from '../../app/types/performers.types';

vi.mock('../../app/services/content.service');

const mockPerformer: Performer = {
  id: '2',
  full_name: 'Luis Corredor',
  stage_name: 'lgabrielcor',
  email: 'luis@example.com',
  status: PerformerStatusEnum.Active,
  performerProfile: { id: 1, performerId: 2 },
};

describe('ContentApprovalModal', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading and then renders fetched items', async () => {
    const fakeResp = {
      album: {
        id: 1,
        name: 'Album',
        creationDate: new Date().toISOString(),
        performerProfileId: 1,
        albumType: 0,
        premiumContent: false,
        price: 0,
        totalLike: 0,
        totalComment: 0,
        assets: [],
      },
      items: [
        {
          id: '10',
          type: 'photo',
          fileURLThumb: 'thumb.jpg',
          fileURL: 'file.jpg',
          assetName: 'Test Photo',
          description: 'desc',
          price: 0,
          likes: 0,
          comments: 0,
          isLiked: false,
          creator: { id: '1', username: 'p', avatar: '' },
          createdAt: new Date(),
        },
      ],
    } as unknown as ReturnType<typeof contentService.getContentByPerformerProfileId>;

    (contentService.getContentByPerformerProfileId as unknown as Mock).mockResolvedValue(fakeResp);

    render(<ContentApprovalModal performer={mockPerformer} onClose={vi.fn()} />);

    expect(screen.getByText(/Cargando contenido/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Test Photo')).toBeInTheDocument());
  });

  it('shows error message when service fails', async () => {
    (contentService.getContentByPerformerProfileId as unknown as Mock).mockRejectedValue(
      new Error('fail')
    );

    render(<ContentApprovalModal performer={mockPerformer} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Error al cargar contenido/i)).toBeInTheDocument());
  });

  it('approves and rejects items locally', async () => {
    const fakeResp = {
      album: {
        id: 2,
        name: 'Album 2',
        creationDate: new Date().toISOString(),
        performerProfileId: 1,
        albumType: 0,
        premiumContent: false,
        price: 0,
        totalLike: 0,
        totalComment: 0,
        assets: [],
      },
      items: [
        {
          id: '20',
          type: 'photo',
          fileURLThumb: 'thumb2.jpg',
          fileURL: 'file2.jpg',
          assetName: 'To Approve',
          description: '',
          price: 0,
          likes: 0,
          comments: 0,
          isLiked: false,
          creator: { id: '1', username: 'p', avatar: '' },
          createdAt: new Date(),
        },
      ],
    } as unknown as ReturnType<typeof contentService.getContentByPerformerProfileId>;

    (contentService.getContentByPerformerProfileId as unknown as Mock).mockResolvedValue(fakeResp);

    render(<ContentApprovalModal performer={mockPerformer} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('To Approve')).toBeInTheDocument());

    const approveBtn = screen.getByRole('button', { name: /Aprobar/i });
    fireEvent.click(approveBtn);

    // After approving, badge should show "Aprobado"
    await waitFor(() => expect(screen.getAllByText(/Aprobado/i).length).toBeGreaterThanOrEqual(1));

    const rejectBtn = screen.getByRole('button', { name: /Rechazar/i });
    fireEvent.click(rejectBtn);

    await waitFor(() => expect(screen.getAllByText(/Rechazado/i).length).toBeGreaterThanOrEqual(1));
  });

  it('opens preview modal on item click and does not close parent modal when preview closed', async () => {
    const fakeResp = {
      album: {
        id: 3,
        name: 'Album Preview',
        creationDate: new Date().toISOString(),
        performerProfileId: 1,
        albumType: 0,
        premiumContent: false,
        price: 0,
        totalLike: 0,
        totalComment: 0,
        assets: [],
      },
      items: [
        {
          id: '30',
          type: 'photo',
          fileURLThumb: 'thumb3.jpg',
          fileURL: 'file3.jpg',
          assetName: 'Preview Photo',
          description: 'Preview description',
          price: 0,
          likes: 5,
          comments: 2,
          isLiked: false,
          creator: { id: '1', username: 'previewer', avatar: '' },
          createdAt: new Date(),
          status: 1,
        },
        {
          id: '31',
          type: 'video',
          fileURLThumb: 'thumbvid.jpg',
          fileURL: 'filevid.mp4',
          assetName: 'Preview Video',
          description: '',
          price: 0,
          likes: 10,
          comments: 1,
          isLiked: false,
          creator: { id: '2', username: 'videouser', avatar: '' },
          createdAt: new Date(),
          duration: 35,
          status: 3,
        },
      ],
    } as unknown as ReturnType<typeof contentService.getContentByPerformerProfileId>;

    const onCloseSpy = vi.fn();

    (contentService.getContentByPerformerProfileId as unknown as Mock).mockResolvedValue(fakeResp);

    render(<ContentApprovalModal performer={mockPerformer} onClose={onCloseSpy} />);

    await waitFor(() => expect(screen.getByText('Preview Photo')).toBeInTheDocument());

    // Click on photo item to open preview (click the image to be precise)
    const photoImg = screen.getByAltText('Preview Photo');
    const photoCard = photoImg.closest('div')?.parentElement; // aspect-video > parent is the card
    expect(photoCard).toBeTruthy();
    fireEvent.click(photoCard!);

    // Preview should display metadata (wait for preview close button to appear)
    await waitFor(() => expect(screen.getByLabelText('Cerrar preview')).toBeInTheDocument());
    expect(screen.getByText(/previewer/i)).toBeInTheDocument();
    // details section should be visible
    expect(screen.getByText(/Detalles/i)).toBeInTheDocument();

    // Ensure the shared-layout node exists (Framer Motion layoutId)
    expect(screen.getByTestId('asset-preview-30')).toBeInTheDocument();



    // Editorial status pill should be visible (pending) and numeric 'subido' should NOT be shown
    expect(screen.getByTestId('asset-preview-editorial-30')).toBeInTheDocument();
    expect(screen.queryByTestId('asset-preview-status-30')).toBeNull();

    // Close preview
    const closeBtn = screen.getByLabelText('Cerrar preview');
    fireEvent.click(closeBtn);

    // Parent modal should still be open and onClose not called
    expect(screen.getByText(/Aprobación de Contenido/i)).toBeInTheDocument();
    expect(onCloseSpy).not.toHaveBeenCalled();

    // Open video preview (click its thumbnail container)
    const videoThumb = screen.getByTestId('asset-thumb-31');
    expect(videoThumb).toBeTruthy();
    fireEvent.click(videoThumb);
    await waitFor(() => expect(screen.getByLabelText('Cerrar preview')).toBeInTheDocument());

    // Now editorial pill for video should be visible and numeric status not shown
    expect(screen.getByTestId('asset-preview-editorial-31')).toBeInTheDocument();
    expect(screen.queryByTestId('asset-preview-status-31')).toBeNull();

    // Parent modal should still be open and onClose not called
    expect(screen.getByText(/Aprobación de Contenido/i)).toBeInTheDocument();
    expect(onCloseSpy).not.toHaveBeenCalled();

    // video element should be present with controls
    const videoEl = document.querySelector('video');
    expect(videoEl).toBeTruthy();
    // Close video preview (close button with aria-label)
    const closeVideo = screen.getByLabelText('Cerrar preview');
    fireEvent.click(closeVideo);

    expect(onCloseSpy).not.toHaveBeenCalled();
  });

  it('calls API to approve an item and updates UI on success', async () => {
    const fakeResp = {
      album: {
        id: 4,
        name: 'Album 4',
        creationDate: new Date().toISOString(),
        performerProfileId: 1,
        albumType: 0,
        premiumContent: false,
        price: 0,
        totalLike: 0,
        totalComment: 0,
        assets: [],
      },
      items: [
        {
          id: '40',
          type: 'photo',
          fileURLThumb: 't.jpg',
          fileURL: 'f.jpg',
          assetName: 'To Approve',
          description: '',
          price: 0,
          likes: 0,
          comments: 0,
          isLiked: false,
          creator: { id: '1', username: 'p', avatar: '' },
          createdAt: new Date(),
          status: 1,
        },
      ],
    } as unknown as ReturnType<typeof contentService.getContentByPerformerProfileId>;

    (contentService.getContentByPerformerProfileId as unknown as Mock).mockResolvedValue(fakeResp);
    const updateMock = vi
      .spyOn(contentService as unknown as { updateAssetStatus: Mock }, 'updateAssetStatus')
      .mockResolvedValue(undefined);

    render(<ContentApprovalModal performer={mockPerformer} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('To Approve')).toBeInTheDocument());

    const approvBtn = screen.getByRole('button', { name: /Aprobar/i });
    fireEvent.click(approvBtn);

    // Confirm modal appears
    await waitFor(() => expect(screen.getByText(/Confirmar aprobación/i)).toBeInTheDocument());

    // Accept
    fireEvent.click(screen.getByText(/Aceptar/i));

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith('40', 3));
    // Badge should show Aprobado (statuscode pill present)
    await waitFor(() => expect(screen.getByTestId('asset-statuscode-40')).toBeInTheDocument());

    updateMock.mockRestore();
  });



  it('calls API to reject an item with a reason and updates UI on success', async () => {
    const fakeResp = {
      album: {
        id: 5,
        name: 'Album 5',
        creationDate: new Date().toISOString(),
        performerProfileId: 1,
        albumType: 0,
        premiumContent: false,
        price: 0,
        totalLike: 0,
        totalComment: 0,
        assets: [],
      },
      items: [
        {
          id: '50',
          type: 'photo',
          fileURLThumb: 't2.jpg',
          fileURL: 'f2.jpg',
          assetName: 'To Reject',
          description: '',
          price: 0,
          likes: 0,
          comments: 0,
          isLiked: false,
          creator: { id: '1', username: 'p', avatar: '' },
          createdAt: new Date(),
          status: 1,
        },
      ],
    } as unknown as ReturnType<typeof contentService.getContentByPerformerProfileId>;

    (contentService.getContentByPerformerProfileId as unknown as Mock).mockResolvedValue(fakeResp);
    const updateMock = vi
      .spyOn(contentService as unknown as { updateAssetStatus: Mock }, 'updateAssetStatus')
      .mockResolvedValue(undefined);

    render(<ContentApprovalModal performer={mockPerformer} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('To Reject')).toBeInTheDocument());

    const rejectBtn = screen.getByRole('button', { name: /Rechazar/i });
    fireEvent.click(rejectBtn);

    // Reject modal appears with textarea
    await waitFor(() => expect(screen.getByLabelText('Motivo de rechazo')).toBeInTheDocument());

    const textarea = screen.getByLabelText('Motivo de rechazo') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Causal válida' } });

    // Submit reject
    fireEvent.click(screen.getByText(/Enviar rechazo/i));

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith('50', 2, 'Causal válida'));
    // Badge should show Rechazado (statuscode pill present)
    await waitFor(() => expect(screen.getByTestId('asset-statuscode-50')).toBeInTheDocument());

    updateMock.mockRestore();
  });
});

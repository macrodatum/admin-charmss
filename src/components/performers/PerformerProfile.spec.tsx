import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PerformerProfile from './PerformerProfile';
import PerformerProfileService from '../../app/services/performerProfile.service';
import PerformersService from '../../app/services/performers.service';
import * as ContentService from '../../app/services/content.service';
import { vi } from 'vitest';
import type { AlbumWithContentResponse } from '../../app/services/content.service';
import type { PerformerProfile as PerformerProfileType } from '../../app/types/performers.types';

import type { Performer } from '../../app/types/performers.types';

const mockPerformer: Performer = {
  id: '2',
  stage_name: 'Test Performer',
  avatar_url: 'https://example.com/old.jpg',
  performerProfile: { id: 1 },
};

describe('PerformerProfile - Media profile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads approved images and allows assigning avatar', async () => {
    const assetsResp = {
      items: [
        {
          id: 10,
          type: 'photo',
          fileURL: 'https://example.com/new.jpg',
          fileURLThumb: 'thumb',
          assetName: 'New Photo',
          status: 3,
        },
      ],
    };

    vi.spyOn(ContentService, 'getContentByPerformerProfileId').mockResolvedValue(
      assetsResp as AlbumWithContentResponse
    );
    vi.spyOn(PerformerProfileService, 'getPerformerProfile').mockResolvedValue({
      id: 1,
      nickName: 'x',
    } as PerformerProfileType);

    const updateSpy = vi.spyOn(PerformersService, 'updatePerformer').mockResolvedValue(undefined);

    render(<PerformerProfile performer={mockPerformer} onClose={() => {}} />);

    // open Media profile tab
    const mediaTab = await screen.findByRole('button', { name: /Media profile/i });
    fireEvent.click(mediaTab);

    // waiting for images to be rendered
    await waitFor(() => expect(screen.getByText('Image profile')).toBeInTheDocument());

    // Click on the image (thumbnails rendered as images)
    const img = screen.getByAltText('New Photo');
    fireEvent.click(img);

    const assignBtn = screen.getByRole('button', { name: /Asignar como avatar/i });
    fireEvent.click(assignBtn);

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith('2', { avatar: 'https://example.com/new.jpg' })
    );

    // Avatar image should update (localAvatar)
    expect(screen.getByAltText('avatar')).toHaveAttribute('src', 'https://example.com/new.jpg');
  });

  it('loads approved videos and allows assigning video', async () => {
    const assetsResp = {
      items: [
        {
          id: 55,
          type: 'video',
          fileURL: 'https://example.com/video.mp4',
          fileURLThumb: 'thumb',
          assetName: 'Demo Video',
          status: 3,
        },
      ],
    };

    vi.spyOn(ContentService, 'getContentByPerformerProfileId').mockResolvedValue(
      assetsResp as AlbumWithContentResponse
    );
    vi.spyOn(PerformerProfileService, 'getPerformerProfile').mockResolvedValue({
      id: 1,
      nickName: 'x',
    } as PerformerProfileType);
    const updateProfileSpy = vi
      .spyOn(PerformerProfileService, 'updatePerformerProfile')
      .mockResolvedValue({} as PerformerProfileType);

    render(<PerformerProfile performer={mockPerformer} onClose={() => {}} />);

    const mediaTab = await screen.findByRole('button', { name: /Media profile/i });
    fireEvent.click(mediaTab);

    await waitFor(() => expect(screen.getByText('Video profile')).toBeInTheDocument());

    const thumb = screen.getByAltText('Demo Video');
    fireEvent.click(thumb);

    const assignVideoBtn = screen.getByRole('button', { name: /Asignar como video/i });
    fireEvent.click(assignVideoBtn);

    await waitFor(() => expect(updateProfileSpy).toHaveBeenCalledWith('2', { videoAssetId: 55 }));
  });
});

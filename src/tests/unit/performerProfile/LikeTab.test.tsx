import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LikeTab from '../../../components/performerProfile/LikeTab';
import LikeService from '../../../app/services/like.service';
import PerformerProfileService from '../../../app/services/performerProfile.service';

vi.mock('../../../app/services/like.service');
vi.mock('../../../app/services/performerProfile.service');

describe('LikeTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads likes and profile fields, and saves both', async () => {
    vi.mocked(LikeService.getPerformerLikes).mockResolvedValue({
      performerId: '1',
      preferences: [{ id: 1, category: 'music', value: 'Pop', selected: true }],
    } as any);

    vi.mocked(LikeService.getFavoriteOptions).mockReturnValue({
      favoriteColor: ['Red', 'Blue'],
      favoriteMusic: ['Pop'],
      languages: ['English', 'Spanish'],
    } as any);

    vi.mocked(PerformerProfileService.getPerformerProfile).mockResolvedValue({
      id: 1,
      performerId: 1,
      showDescription: 'Hello world',
      favoriteColor: null,
      languages: null,
    } as any);

    vi.mocked(LikeService.updatePerformerLikes).mockResolvedValue({} as any);
    vi.mocked(PerformerProfileService.updatePerformerProfile).mockResolvedValue({} as any);

    render(<LikeTab performerId={'1'} />);

    await waitFor(() => {
      expect(screen.getByText('Likes')).toBeInTheDocument();
    });

    // Expect a profile textarea prefilled
    const showDesc = await screen.findByDisplayValue('Hello world');
    expect(showDesc).toBeInTheDocument();

    // Change a field and save
    fireEvent.change(showDesc, { target: { value: 'New desc' } });

    // select a favorite color
    const redBtn = await screen.findByRole('button', { name: 'Red' });
    fireEvent.click(redBtn);

    // add a custom favorite color
    const customInput = await screen.findByLabelText('add-favorite-favoriteColor');
    fireEvent.change(customInput, { target: { value: 'Maroon' } });

    const addBtn = await screen.findByLabelText('add-favorite-btn-favoriteColor');
    fireEvent.click(addBtn);

    // select a language
    const englishBtn = await screen.findByRole('button', { name: 'English' });
    fireEvent.click(englishBtn);

    const saveButton = screen.getByText('Save preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(LikeService.updatePerformerLikes).toHaveBeenCalled();
      expect(PerformerProfileService.updatePerformerProfile).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          showDescription: 'New desc',
          favoriteColor: 'Red::Maroon',
          languages: 'English',
        })
      );

      // Also assert id, performerId and roomTopic are not present in the sent payload
      const callArgs = vi.mocked(PerformerProfileService.updatePerformerProfile).mock
        .calls[0][1] as any;
      expect(callArgs.id).toBeUndefined();
      expect(callArgs.performerId).toBeUndefined();
      expect(callArgs.roomTopic).toBeUndefined();
    });
  });
});

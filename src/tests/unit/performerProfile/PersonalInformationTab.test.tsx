import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProfileTab from '../../../components/performerProfile/ProfileTab';
import PerformerProfileService from '../../../app/services/performerProfile.service';
import GeodataService from '../../../app/services/geodata.service';
import type { Performer } from '../../../app/types/performers.types';
import { ZodiacType } from '../../../performers/enums/profile.enums';

vi.mock('../../../app/services/performerProfile.service');
vi.mock('../../../app/services/geodata.service');

describe('ProfileTab (migrated from PersonalInformationTab)', () => {
  const mockPerformer: Performer = {
    id: '1',
    full_name: 'Test Fullname',
    stage_name: 'TestPerformer',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    rating: 4.5,
    total_shows: 100,
    status: 'active',
    performerProfile: {
      nickName: 'TestNick',
      headLines: 'Test headline',
      showDescription: 'Test description',
      age: 30,
      height: 170,
      weight: 65,
      zodiac: ZodiacType.Aries,
      twitterLink: 'https://twitter.com/test',
      instagramLink: 'https://instagram.com/test',
      countryCode: 'Colombia +57',
      id: 0,
      performerId: 0
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders performer info and nickname (read-only) correctly', async () => {
    render(<ProfileTab performer={mockPerformer} />);

    await waitFor(() => {
      expect(screen.getByText('TestPerformer')).toBeInTheDocument();
      expect(screen.getByText(/4.5/)).toBeInTheDocument();
      expect(screen.getByText(/100 shows/)).toBeInTheDocument();
      expect(screen.getByText('TestNick')).toBeInTheDocument();
    });
  });

  it('allows updating other editable fields (twitterLink)', async () => {
    render(<ProfileTab performer={mockPerformer} />);

    const twitterInput = await screen.findByDisplayValue('https://twitter.com/test');
    fireEvent.change(twitterInput, { target: { value: 'https://twitter.com/new' } });
    expect((twitterInput as HTMLInputElement).value).toBe('https://twitter.com/new');
  });

  it('saves profile data when save button is clicked', async () => {
    vi.mocked(PerformerProfileService.updatePerformerProfile).mockResolvedValue({} as any);
    vi.mocked(GeodataService.listCountries).mockResolvedValue([
      { isoCode: 'CO', name: 'Colombia', dialCode: '+57' },
      { isoCode: 'US', name: 'United States', dialCode: '+1' },
    ] as any);

    render(<ProfileTab performer={mockPerformer} />);

    // ensure country selector loaded and initial value is the ISO code
    await waitFor(() => {
      const sel = screen.getByRole('combobox', { name: /Display Country/ }) as HTMLSelectElement;
      expect(sel.value).toBe('CO');
    });

    const saveButton = screen.getByText('Save profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(PerformerProfileService.updatePerformerProfile).toHaveBeenCalledWith('1', {
        languages: null,
        headLines: 'Test headline',
        showDescription: 'Test description',
        turnOns: null,
        expertise: null,
        nickName: 'TestNick',
        age: 30,
        ethnicity: 0,
        sexualPreference: 0,
        zodiac: ZodiacType.Aries,
        height: 170,
        weight: 65,
        hairColor: 2,
        eyeColor: 1,
        pubicHair: null,
        waist: null,
        build: 0,
        bust: null,
        bustName: null,
        hips: null,
        countryCode: 'CO',

        blockCountryOrigin: false,
        mac: null,
        faceBookLink: null,
        twitterLink: 'https://twitter.com/test',
        instagramLink: 'https://instagram.com/test',
        favoriteColor: null,
        favoriteCandies: null,
        favoriteBeverages: null,
        favoriteFood: null,
        favoriteMusic: null,
        favoritePerfumes: null,
        favoriteFashion: null,
        favoriteJewells: null,
        favoritePlaces: null,
        hobbies: null,
        favoriteMovies: null,
        favoriteBooks: null,
      });
    });

    expect(await screen.findByText('Profile guardado correctamente')).toBeInTheDocument();
  });

  it('displays error message when save fails', async () => {
    vi.mocked(PerformerProfileService.updatePerformerProfile).mockRejectedValue(
      new Error('Save failed')
    );

    render(<ProfileTab performer={mockPerformer} />);

    const saveButton = screen.getByText('Save profile');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Error guardando Profile')).toBeInTheDocument();
    });
  });

  it('does not show loading state (profile is available on performer prop)', () => {
    render(<ProfileTab performer={mockPerformer} />);

    expect(screen.queryByText('Cargando información personal...')).not.toBeInTheDocument();
  });
});

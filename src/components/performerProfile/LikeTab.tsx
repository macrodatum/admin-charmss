import React, { useState, useEffect } from 'react';
import { Heart, Plus } from 'lucide-react';
import LikeService, { type LikePreference } from '../../app/services/like.service';
import PerformerProfileService from '../../app/services/performerProfile.service';
import type { PerformerProfile } from '../../app/types/performers.types';

interface LikeTabProps {
  performerId: string;
}

export default function LikeTab({ performerId }: LikeTabProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<LikePreference[]>([]);

  // Profile text fields (short textareas, max 100 chars)
  const [profile, setProfile] = useState<Partial<PerformerProfile> | null>(null);
  const [profileFields, setProfileFields] = useState<Partial<PerformerProfile>>({
    showDescription: '',
    // favoriteColor/Candies/Beverages/Food/Music will be handled with tag pickers (selectedFavorites)
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

  // Selections for favorite pickers (store as arrays, persist as delimiter-separated strings)
  const [selectedFavorites, setSelectedFavorites] = useState<Record<string, string[]>>({
    favoriteColor: [],
    favoriteCandies: [],
    favoriteBeverages: [],
    favoriteFood: [],
    favoriteMusic: [],
    languages: [],
  });

  // Per-field custom input values (for adding custom favorite options)
  const [newFavoriteCustom, setNewFavoriteCustom] = useState<Record<string, string>>({});

  // Delimiter to persist multi-value favorites as a single string in backend
  const FAVORITE_DELIMITER = '::';

  // Cargar preferencias y perfil al montar
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        const [likes, fetchedProfile] = await Promise.all([
          LikeService.getPerformerLikes(performerId),
          PerformerProfileService.getPerformerProfile(performerId),
        ]);

        setPreferences(likes.preferences);
        setProfile(fetchedProfile);

        // Fill profile fields (ensure strings and limit to 100 in UI)
        setProfileFields({
          showDescription: fetchedProfile.showDescription ?? '',
          favoriteColor: fetchedProfile.favoriteColor ?? null,
          favoriteCandies: fetchedProfile.favoriteCandies ?? null,
          favoriteBeverages: fetchedProfile.favoriteBeverages ?? null,
          favoriteFood: fetchedProfile.favoriteFood ?? null,
          favoriteMusic: fetchedProfile.favoriteMusic ?? null,
          favoritePerfumes: fetchedProfile.favoritePerfumes ?? null,
          favoriteFashion: fetchedProfile.favoriteFashion ?? null,
          favoriteJewells: fetchedProfile.favoriteJewells ?? null,
          favoritePlaces: fetchedProfile.favoritePlaces ?? null,
          hobbies: fetchedProfile.hobbies ?? null,
          favoriteMovies: fetchedProfile.favoriteMovies ?? null,
          favoriteBooks: fetchedProfile.favoriteBooks ?? null,
        });

        // Initialize selected favorite pickers from profile (delimiter-separated strings)
        setSelectedFavorites({
          favoriteColor: fetchedProfile.favoriteColor
            ? (fetchedProfile.favoriteColor as string)
                .split(FAVORITE_DELIMITER)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          favoriteCandies: fetchedProfile.favoriteCandies
            ? (fetchedProfile.favoriteCandies as string)
                .split(FAVORITE_DELIMITER)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          favoriteBeverages: fetchedProfile.favoriteBeverages
            ? (fetchedProfile.favoriteBeverages as string)
                .split(FAVORITE_DELIMITER)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          favoriteFood: fetchedProfile.favoriteFood
            ? (fetchedProfile.favoriteFood as string)
                .split(FAVORITE_DELIMITER)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          favoriteMusic: fetchedProfile.favoriteMusic
            ? (fetchedProfile.favoriteMusic as string)
                .split(FAVORITE_DELIMITER)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          languages: fetchedProfile.languages
            ? (fetchedProfile.languages as string)
                .split(FAVORITE_DELIMITER)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        });
      } catch (error) {
        console.error('Error loading preferences or profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [performerId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      // Update likes
      await LikeService.updatePerformerLikes(performerId, {
        preferences,
      });

      // Build a payload similar to ProfileTab: only the allowed performerProfile fields
      // Merge updated values into the full profile object and send the entire performerProfile
      const updatedProfile: Partial<PerformerProfile> = {
        ...(profile ?? {}),
        showDescription: (profileFields.showDescription ?? '').slice(0, 100) || null,
        favoriteColor:
          selectedFavorites.favoriteColor && selectedFavorites.favoriteColor.length > 0
            ? selectedFavorites.favoriteColor.join(FAVORITE_DELIMITER)
            : null,
        favoriteCandies:
          selectedFavorites.favoriteCandies && selectedFavorites.favoriteCandies.length > 0
            ? selectedFavorites.favoriteCandies.join(FAVORITE_DELIMITER)
            : null,
        favoriteBeverages:
          selectedFavorites.favoriteBeverages && selectedFavorites.favoriteBeverages.length > 0
            ? selectedFavorites.favoriteBeverages.join(FAVORITE_DELIMITER)
            : null,
        favoriteFood:
          selectedFavorites.favoriteFood && selectedFavorites.favoriteFood.length > 0
            ? selectedFavorites.favoriteFood.join(FAVORITE_DELIMITER)
            : null,
        favoriteMusic:
          selectedFavorites.favoriteMusic && selectedFavorites.favoriteMusic.length > 0
            ? selectedFavorites.favoriteMusic.join(FAVORITE_DELIMITER)
            : null,
        languages:
          selectedFavorites.languages && selectedFavorites.languages.length > 0
            ? selectedFavorites.languages.join(FAVORITE_DELIMITER)
            : profile?.languages ?? null,
        favoritePerfumes: profileFields.favoritePerfumes ?? null,
        favoriteFashion: profileFields.favoriteFashion ?? null,
        favoriteJewells: profileFields.favoriteJewells ?? null,
        favoritePlaces: profileFields.favoritePlaces ?? null,
        hobbies: profileFields.hobbies ?? null,
        favoriteMovies: profileFields.favoriteMovies ?? null,
        favoriteBooks: profileFields.favoriteBooks ?? null,
      };

      // Remove server-managed identifiers before sending
      const sanitized = { ...updatedProfile } as Partial<PerformerProfile>;
      delete (sanitized as any).id;
      delete (sanitized as any).performerId;

      const saved = await PerformerProfileService.updatePerformerProfile(performerId, sanitized);

      // Reflect saved profile in local state
      setProfile(saved);

      setSaveMessage('Preferences and profile saved successfully');
    } catch (err) {
      console.error('Error saving likes/profile:', err);
      setSaveMessage('Error saving preferences and profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
        <Heart className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Likes</h3>
      </div>

      {/* Show description full-width under header */}
      <div className="w-full">
        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Show description
        </label>
        <textarea
          value={profileFields.showDescription ?? ''}
          onChange={(e) =>
            setProfileFields((prev) => ({ ...prev, showDescription: e.target.value.slice(0, 100) }))
          }
          rows={3}
          maxLength={100}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm h-20"
        />
      </div>

      {/* Favorite pickers (tag selection) */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Favorites</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(LikeService.getFavoriteOptions()).map(([field, options]) => (
            <div key={field}>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set([...(options as string[]), ...((selectedFavorites as any)[field] || [])])
                ).map((opt) => {
                  const isSelected = (selectedFavorites as any)[field]?.includes(opt) ?? false;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedFavorites((prev) => {
                          const cur = prev[field as keyof typeof prev] || [];
                          if (cur.includes(opt)) {
                            return { ...prev, [field]: cur.filter((c) => c !== opt) };
                          }
                          return { ...prev, [field]: [...cur, opt] };
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  aria-label={`add-favorite-${field}`}
                  type="text"
                  value={(newFavoriteCustom as any)[field] ?? ''}
                  onChange={(e) =>
                    setNewFavoriteCustom((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  placeholder="Add custom..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
                <button
                  onClick={() => {
                    const value = ((newFavoriteCustom as any)[field] || '').trim();
                    if (!value) return;
                    setSelectedFavorites((prev) => {
                      const cur = prev[field as keyof typeof prev] || [];
                      if (cur.includes(value)) return prev;
                      return { ...prev, [field]: [...cur, value] };
                    });
                    setNewFavoriteCustom((prev) => ({ ...prev, [field]: '' }));
                  }}
                  className="px-3 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                  aria-label={`add-favorite-btn-${field}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile short text fields: two per row on md+, one per row on mobile */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          About me & preferences
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'favoritePerfumes', label: 'Favorite perfumes' },
            { key: 'favoriteFashion', label: 'Favorite fashion' },
            { key: 'favoriteJewells', label: 'Favorite jewells' },
            { key: 'favoritePlaces', label: 'Favorite places' },
            { key: 'hobbies', label: 'Hobbies' },
            { key: 'favoriteMovies', label: 'Favorite movies' },
            { key: 'favoriteBooks', label: 'Favorite books' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
              </label>
              <textarea
                value={(profileFields as any)[field.key] ?? ''}
                onChange={(e) =>
                  setProfileFields((prev) => ({
                    ...prev,
                    [field.key]: e.target.value.slice(0, 100),
                  }))
                }
                rows={2}
                maxLength={100}
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm h-14"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50 hover:bg-pink-700 transition-colors"
        >
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
      </div>
      {saveMessage && (
        <p
          className={`text-sm ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}
        >
          {saveMessage}
        </p>
      )}
    </div>
  );
}

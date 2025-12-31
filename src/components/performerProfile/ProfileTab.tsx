import React, { useState, useEffect } from 'react';
import PerformerProfileService from '../../app/services/performerProfile.service';
import type { PerformerProfile as PerformerProfileType } from '../../app/types/performers.types';

interface ProfileTabProps {
  performerId: string;
}

export default function ProfileTab({ performerId }: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    age: 26,
    height: 165,
    weight: 60,
    zodiac: 'Sagittarius',
    ethnicity: 'White',
    sexualPreference: 'Straight',
    hairColor: 'Brown',
    eyeColor: 'Green',
    build: 'Slender',
    country: 'Colombia +57',
    twitterLink: '',
    instagramLink: '',
  });

  // Cargar datos del perfil al montar
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await PerformerProfileService.getPerformerProfile(performerId);
        setFormData((prev) => ({
          ...prev,
          age: profile.age || prev.age,
          height: profile.height || prev.height,
          weight: profile.weight || prev.weight,
          country: profile.countryCode || prev.country,
          twitterLink: profile.twitterLink || prev.twitterLink,
          instagramLink: profile.instagramLink || prev.instagramLink,
        }));
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [performerId]);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload: Partial<PerformerProfileType> = {
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        zodiac: formData.zodiac as unknown as number,
        twitterLink: formData.twitterLink,
        instagramLink: formData.instagramLink,
        countryCode: formData.country,
      };
      await PerformerProfileService.updatePerformerProfile(performerId, payload);
      setSaveMessage('Profile guardado correctamente');
    } catch {
      setSaveMessage('Error guardando Profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <div className="relative">
            <input
              type="range"
              min="18"
              max="50"
              value={formData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {formData.age} years
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height
          </label>
          <div className="relative">
            <input
              type="range"
              min="150"
              max="180"
              value={formData.height}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {formData.height} cms
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weight
          </label>
          <div className="relative">
            <input
              type="range"
              min="45"
              max="80"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {formData.weight} kl
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zodiac
          </label>
          <select
            value={formData.zodiac}
            onChange={(e) => handleInputChange('zodiac', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Sagittarius">Sagittarius</option>
            <option value="Aries">Aries</option>
            <option value="Taurus">Taurus</option>
            <option value="Gemini">Gemini</option>
            <option value="Cancer">Cancer</option>
            <option value="Leo">Leo</option>
            <option value="Virgo">Virgo</option>
            <option value="Libra">Libra</option>
            <option value="Scorpio">Scorpio</option>
            <option value="Capricorn">Capricorn</option>
            <option value="Aquarius">Aquarius</option>
            <option value="Pisces">Pisces</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ethnicity
          </label>
          <select
            value={formData.ethnicity}
            onChange={(e) => handleInputChange('ethnicity', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="White">White</option>
            <option value="Black">Black</option>
            <option value="Asian">Asian</option>
            <option value="Hispanic">Hispanic</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sexual Preference
          </label>
          <select
            value={formData.sexualPreference}
            onChange={(e) => handleInputChange('sexualPreference', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Straight">Straight</option>
            <option value="Gay">Gay</option>
            <option value="Bisexual">Bisexual</option>
            <option value="Lesbian">Lesbian</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hair Color
          </label>
          <select
            value={formData.hairColor}
            onChange={(e) => handleInputChange('hairColor', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Brown">Brown</option>
            <option value="Black">Black</option>
            <option value="Blonde">Blonde</option>
            <option value="Red">Red</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Eye Color
          </label>
          <select
            value={formData.eyeColor}
            onChange={(e) => handleInputChange('eyeColor', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Green">Green</option>
            <option value="Brown">Brown</option>
            <option value="Blue">Blue</option>
            <option value="Hazel">Hazel</option>
            <option value="Gray">Gray</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Build
          </label>
          <select
            value={formData.build}
            onChange={(e) => handleInputChange('build', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Slender">Slender</option>
            <option value="Athletic">Athletic</option>
            <option value="Average">Average</option>
            <option value="Curvy">Curvy</option>
            <option value="Plus Size">Plus Size</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Colombia +57">Colombia +57</option>
            <option value="USA +1">USA +1</option>
            <option value="Mexico +52">Mexico +52</option>
            <option value="Argentina +54">Argentina +54</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            TwitterLink
          </label>
          <input
            type="text"
            value={formData.twitterLink}
            onChange={(e) => handleInputChange('twitterLink', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            InstagramLink
          </label>
          <input
            type="text"
            value={formData.instagramLink}
            onChange={(e) => handleInputChange('instagramLink', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50 hover:bg-pink-700 transition-colors"
        >
          {saving ? 'Guardando...' : 'Save profile'}
        </button>
      </div>
      {saveMessage && (
        <p
          className={`text-sm ${
            saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {saveMessage}
        </p>
      )}
    </div>
  );
}

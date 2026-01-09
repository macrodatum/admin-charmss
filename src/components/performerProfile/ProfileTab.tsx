import React, { useState } from 'react';
import { Star } from 'lucide-react';
import PerformerProfileService from '../../app/services/performerProfile.service';
import type { PerformerProfile as PerformerProfileType, Performer } from '../../app/types/performers.types';
import {
  ZodiacType,
  EthnicityType,
  SexualPreferenceType,
  HairColorType,
  EyeColorType,
  BuildType,
} from '../../performers/enums/profile.enums';
import CountrySelector from '../ui/CountrySelector';

interface ProfileTabProps {
  performer: Performer;
}

export default function ProfileTab({ performer }: ProfileTabProps) {
  const performerId = performer.id;
  const profile = performer.performerProfile || ({} as Partial<PerformerProfileType>);
  const stageName = performer.stage_name;
  const avatarUrl = performer.avatar;
  const rating = performer.rating ?? 0;
  const totalShows = performer.total_shows ?? 0;

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Default to numeric enum values where appropriate
  // Default to numeric enum values where appropriate
  const [formData, setFormData] = useState({
    age: (profile.age as number) ?? 26,
    height: (profile.height as number) ?? 165,
    weight: (profile.weight as number) ?? 60,
    zodiac: typeof profile.zodiac === 'number' ? (profile.zodiac as number) : ZodiacType.Saggitarius,
    ethnicity: typeof profile.ethnicity === 'number' ? (profile.ethnicity as number) : EthnicityType.White,
    sexualPreference:
      typeof profile.sexualPreference === 'number' ? (profile.sexualPreference as number) : SexualPreferenceType.Straight,
    hairColor: typeof profile.hairColor === 'number' ? (profile.hairColor as number) : HairColorType.Brown,
    eyeColor: typeof profile.eyeColor === 'number' ? (profile.eyeColor as number) : EyeColorType.Green,
    build: typeof profile.build === 'number' ? (profile.build as number) : BuildType.Slender,
    // store country as an ISO code (e.g. 'CO') instead of full text
    country: typeof profile.countryCode === 'string' && /^[A-Z]{2}$/.test(profile.countryCode) ? profile.countryCode : 'CO',
    twitterLink: (profile.twitterLink as string) ?? '',
    instagramLink: (profile.instagramLink as string) ?? '',
    // Personal information fields previously in PersonalInformationTab
    headline: (profile.headLines as string) ?? '',
    myLive: (profile.showDescription as string) ?? 'Welcome! Share your story and connect with fans.',
  });

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      // Build payload containing only the permitted fields (no extra keys)
      const payload: Partial<PerformerProfileType> = {
        languages: (profile.languages as string) ?? null,
        headLines: formData.headline ?? profile.headLines ?? null,
        showDescription: formData.myLive ?? profile.showDescription ?? null,
        turnOns: profile.turnOns ?? null,
        expertise: profile.expertise ?? null,
        nickName: profile.nickName ?? stageName,

        age: formData.age,
        ethnicity: formData.ethnicity as number,
        sexualPreference: formData.sexualPreference as number,
        zodiac: formData.zodiac as number,
        height: formData.height,
        weight: formData.weight,
        hairColor: formData.hairColor as number,
        eyeColor: formData.eyeColor as number,
        pubicHair: profile.pubicHair ?? null,
        waist: profile.waist ?? null,
        build: formData.build as number,
        bust: profile.bust ?? null,
        bustName: profile.bustName ?? null,
        hips: profile.hips ?? null,

        countryCode: formData.country,

        blockCountryOrigin: profile.blockCountryOrigin ?? false,
        mac: profile.mac ?? null,
        faceBookLink: profile.faceBookLink ?? null,
        twitterLink: formData.twitterLink,
        instagramLink: formData.instagramLink,

        favoriteColor: profile.favoriteColor ?? null,
        favoriteCandies: profile.favoriteCandies ?? null,
        favoriteBeverages: profile.favoriteBeverages ?? null,
        favoriteFood: profile.favoriteFood ?? null,
        favoriteMusic: profile.favoriteMusic ?? null,
        favoritePerfumes: profile.favoritePerfumes ?? null,
        favoriteFashion: profile.favoriteFashion ?? null,
        favoriteJewells: profile.favoriteJewells ?? null,
        favoritePlaces: profile.favoritePlaces ?? null,
        hobbies: profile.hobbies ?? null,
        favoriteMovies: profile.favoriteMovies ?? null,
        favoriteBooks: profile.favoriteBooks ?? null,
      };

      await PerformerProfileService.updatePerformerProfile(performerId, payload);
      setSaveMessage('Profile guardado correctamente');
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveMessage('Error guardando Profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          <img
            src={avatarUrl || '/icons/default-avatar.svg'}
            alt={stageName}
            className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {stageName}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base flex items-center justify-center md:justify-start gap-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            {rating.toFixed(1)} • {totalShows} shows
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          NickName
        </label>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {profile.nickName || stageName}
        </h2>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Headline
        </label>
        <textarea
          value={formData.headline}
          onChange={(e) => handleInputChange('headline', e.target.value)}
          rows={2}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          My live
        </label>
        <textarea
          value={formData.myLive}
          onChange={(e) => handleInputChange('myLive', e.target.value)}
          rows={2}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
        />
      </div>

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
            onChange={(e) => handleInputChange('zodiac', parseInt(e.target.value))}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value={ZodiacType.Saggitarius}>Saggitarius</option>
            <option value={ZodiacType.Aries}>Aries</option>
            <option value={ZodiacType.Taurus}>Taurus</option>
            <option value={ZodiacType.Gemini}>Gemini</option>
            <option value={ZodiacType.Cancer}>Cancer</option>
            <option value={ZodiacType.Leo}>Leo</option>
            <option value={ZodiacType.Virgo}>Virgo</option>
            <option value={ZodiacType.Libra}>Libra</option>
            <option value={ZodiacType.Scorpio}>Scorpio</option>
            <option value={ZodiacType.Capricorn}>Capricorn</option>
            <option value={ZodiacType.Aquarius}>Aquarius</option>
            <option value={ZodiacType.Pisces}>Pisces</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ethnicity
          </label>
          <select
            value={formData.ethnicity}
            onChange={(e) => handleInputChange('ethnicity', parseInt(e.target.value))}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value={EthnicityType.White}>White</option>
            <option value={EthnicityType.Black}>Black</option>
            <option value={EthnicityType.Asian}>Asian</option>
            <option value={EthnicityType.Hispanic}>Hispanic</option>
            <option value={EthnicityType.Roma}>Mixed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sexual Preference
          </label>
          <select
            value={formData.sexualPreference}
            onChange={(e) => handleInputChange('sexualPreference', parseInt(e.target.value))}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value={SexualPreferenceType.Straight}>Straight</option>
            <option value={SexualPreferenceType.Gay}>Gay</option>
            <option value={SexualPreferenceType.Bisexual}>Bisexual</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hair Color
          </label>
          <select
            value={formData.hairColor}
            onChange={(e) => handleInputChange('hairColor', parseInt(e.target.value))}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value={HairColorType.Brown}>Brown</option>
            <option value={HairColorType.Black}>Black</option>
            <option value={HairColorType.Blond}>Blonde</option>
            <option value={HairColorType.Red}>Red</option>
            <option value={HairColorType.Dyed}>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Eye Color
          </label>
          <select
            value={formData.eyeColor}
            onChange={(e) => handleInputChange('eyeColor', parseInt(e.target.value))}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value={EyeColorType.Green}>Green</option>
            <option value={EyeColorType.Brown}>Brown</option>
            <option value={EyeColorType.Blue}>Blue</option>
            <option value={EyeColorType.Hazel}>Hazel</option>
            <option value={EyeColorType.Grey}>Gray</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Build
          </label>
          <select
            value={formData.build}
            onChange={(e) => handleInputChange('build', parseInt(e.target.value))}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value={BuildType.Slender}>Slender</option>
            <option value={BuildType.Athletic}>Athletic</option>
            <option value={BuildType.Curvaceous}>Curvy</option>
            <option value={BuildType.Few_extra_pounds}>Few extra pounds</option>
            <option value={BuildType.Big_beautiful_woman}>Plus Size</option>
          </select>
        </div>

        <div>
          {/* Country selector */}
          <CountrySelector
            label="Display Country"
            id="countryCode"
            value={formData.country}
            onChange={(c) => handleInputChange('country', c)}
            error={null}
            required
          />
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

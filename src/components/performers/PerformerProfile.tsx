import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
} from 'lucide-react';
import {
  Performer,
  PerformerProfile as PerformerProfileType,
} from '../../app/types/performers.types';
import PerformerProfileService from '../../app/services/performerProfile.service';
import { getContentByPerformerProfileId } from '../../app/services/content.service';
import PerformersService from '../../app/services/performers.service';

interface PerformerProfileProps {
  performer: Performer | null;
  onClose: () => void;
}

export default function PerformerProfile({ performer, onClose }: PerformerProfileProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [_profileDataFromApi, setProfileDataFromApi] = useState<PerformerProfileType | null>(null);

  const [profileData, setProfileData] = useState({
    nickname: performer?.stage_name ?? '',
    headline: performer?.bio ?? '',
    myLive: 'Welcome! Share your story and connect with fans.',
    age: 26,
    height: 165,
    weight: 60,
    zodiac: 'Sagittarius',
    ethnicity: 'White',
    sexualPreference: 'Straight',
    hairColor: 'Brown',
    eyeColor: 'Green',
    build: 'Slender',
    country: performer?.country ?? '',
    twitterLink: '',
    instagramLink: '',
    videoCallRate: 18,
    streamingRate: 30,
  });

  // Media selection states
  interface LocalMediaItem {
    id: string;
    type: 'photo' | 'video';
    fileURL: string;
    thumbnail?: string;
    assetName?: string;
    statusCode?: number;
  }

  const [mediaItems, setMediaItems] = useState<LocalMediaItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(performer?.avatar_url);

  // load media items for performer profile
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!performer?.performerProfile?.id) return setMediaItems([]);
      try {
        const resp = await getContentByPerformerProfileId(performer.performerProfile.id);
        const items = resp?.items ?? [];
        const mapped = items.map((it) => ({
          id: String(it.id),
          type: it.type as 'photo' | 'video',
          fileURL: it.fileURL ?? it.fileURLThumb ?? '',
          thumbnail: it.fileURLThumb ?? undefined,
          assetName: it.assetName,
          statusCode: it.status,
        }));
        if (mounted) setMediaItems(mapped);
      } catch (error) {
        console.error('Error loading media items:', error);
        if (mounted) setMediaItems([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [performer?.performerProfile?.id]);

  const assignAvatar = async () => {
    if (!selectedImageId || !performer?.id) return;
    setAssignError(null);
    setAssignSuccess(null);
    setAssignLoading(true);
    try {
      const item = mediaItems.find((m) => m.id === selectedImageId);
      if (!item) throw new Error('Asset not found');
      // Assign avatar using the new endpoint
      const result = await PerformersService.assignProfileAsset(performer.id, item.id);
      if (result.url) {
        setLocalAvatar(result.url);
      } else {
        setLocalAvatar(item.fileURL);
      }
      setAssignSuccess('Avatar asignado correctamente');
    } catch (err) {
      console.error(err);
      setAssignError('Error asignando avatar');
    } finally {
      setAssignLoading(false);
    }
  };

  const assignVideo = async () => {
    if (!selectedVideoId || !performer?.id) return;
    setAssignError(null);
    setAssignSuccess(null);
    setAssignLoading(true);
    try {
      const item = mediaItems.find((m) => m.id === selectedVideoId);
      if (!item) throw new Error('Asset not found');
      // Assign video using the new endpoint
      await PerformersService.assignProfileAsset(performer.id, item.id);
      // update local state
      setProfileDataFromApi((prev) => (prev ? { ...prev, videoAssetId: Number(item.id) } : prev));
      setAssignSuccess('Video asignado correctamente');
    } catch (err) {
      console.error(err);
      setAssignError('Error asignando video');
    } finally {
      setAssignLoading(false);
    }
  };

  // Cargar datos del perfil cuando se abre el modal
  useEffect(() => {
    const fetchProfile = async () => {
      if (!performer?.id) return;

      setLoading(true);
      try {
        const profile = await PerformerProfileService.getPerformerProfile(performer.id);
        setProfileDataFromApi(profile);

        // Actualizar los datos locales con los datos del backend
        setProfileData((prev) => ({
          ...prev,
          nickname: profile.nickName || prev.nickname,
          headline: profile.headLines || prev.headline,
          myLive: profile.showDescription || prev.myLive,
          age: profile.age || prev.age,
          height: profile.height || prev.height,
          weight: profile.weight || prev.weight,
          country: profile.countryCode || prev.country,
          twitterLink: profile.twitterLink || prev.twitterLink,
          instagramLink: profile.instagramLink || prev.instagramLink,
        }));
      } catch (error) {
        console.error('Error loading performer profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [performer?.id]);

  // Render even when performer is null; individual fields use optional chaining

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'profile', label: 'Profile' },
    { id: 'like', label: 'I like' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'media', label: 'Media profile' },
    { id: 'payments', label: 'Payments' },
    { id: 'sales', label: 'Sales' },
  ];

  const handleInputChange = (field: string, value: unknown) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          <img
            src={
              performer?.avatar_url ||
              '/icons/default-avatar.svg'
            }
            alt={performer?.stage_name ?? 'Profile'}
            className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {performer?.stage_name ?? '—'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base flex items-center justify-center md:justify-start gap-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            {performer
              ? `${(performer.rating ?? 0).toFixed(1)} • ${performer.total_shows ?? 0} shows`
              : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            NickName
          </label>
          <input
            type="text"
            value={profileData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Headline</label>
        <textarea
          value={profileData.headline}
          onChange={(e) => handleInputChange('headline', e.target.value)}
          rows={2}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">My live</label>
        <textarea
          value={profileData.myLive}
          onChange={(e) => handleInputChange('myLive', e.target.value)}
          rows={2}
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
        />
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age</label>
          <div className="relative">
            <input
              type="range"
              min="18"
              max="50"
              value={profileData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {profileData.age} years
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height</label>
          <div className="relative">
            <input
              type="range"
              min="150"
              max="180"
              value={profileData.height}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {profileData.height} cms
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight</label>
          <div className="relative">
            <input
              type="range"
              min="45"
              max="80"
              value={profileData.weight}
              onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {profileData.weight} kl
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zodiac</label>
          <select
            value={profileData.zodiac}
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
            value={profileData.ethnicity}
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
            value={profileData.sexualPreference}
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
            value={profileData.hairColor}
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
            value={profileData.eyeColor}
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
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Build</label>
          <select
            value={profileData.build}
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
            value={profileData.country}
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
            value={profileData.twitterLink}
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
            value={profileData.instagramLink}
            onChange={(e) => handleInputChange('instagramLink', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            VideoCallMinute
          </label>
          <div className="relative">
            <input
              type="range"
              min="10"
              max="50"
              value={profileData.videoCallRate}
              onChange={(e) => handleInputChange('videoCallRate', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {profileData.videoCallRate} tokens - 2.7 dtrs
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Streaming_Minute
          </label>
          <div className="relative">
            <input
              type="range"
              min="20"
              max="60"
              value={profileData.streamingRate}
              onChange={(e) => handleInputChange('streamingRate', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-gray-900 dark:text-white font-medium text-sm md:text-base">
              {profileData.streamingRate} tokens - 4.5 dtrs
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentsTab = () => {
    const weeklyData = [
      { week: 12, amount: 0.09, status: 'GENERATED' },
      { week: 11, amount: 0.09, status: 'GENERATED' },
      { week: 10, amount: 1.98, status: 'GENERATED' },
      { week: 3, amount: 0.09, status: 'GENERATED' },
      { week: 17, amount: 0.09, status: 'GENERATED' },
    ];

    const paymentMethods = [
      { name: 'Bank Transfer', fee: '2%', minPayout: '$50' },
      { name: 'PayPal', fee: '3%', minPayout: '$20' },
      { name: 'Cryptocurrency', fee: '1%', minPayout: '$10' },
      { name: 'Wire Transfer', fee: '$15', minPayout: '$100' },
    ];

    const recentTransactions = [
      { date: '2025-01-15', type: 'Private Show', amount: 45.5, status: 'Completed' },
      { date: '2025-01-14', type: 'Tips', amount: 23.75, status: 'Completed' },
      { date: '2025-01-14', type: 'Video Call', amount: 67.2, status: 'Completed' },
      { date: '2025-01-13', type: 'Gifts', amount: 12.3, status: 'Pending' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Total Earnings</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">$234.50</p>
              </div>
              <div className="p-2 rounded-lg bg-green-600">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">This Week</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">$67.30</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-600">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Pending</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">$45.30</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-600">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Available</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">$189.20</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-600">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">Weekly Payments</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <select className="bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="Semana 33, 2025">Semana 33, 2025</option>
                  <option value="Semana 32, 2025">Semana 32, 2025</option>
                  <option value="Semana 31, 2025">Semana 31, 2025</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  <div>Week</div>
                  <div>Amount US$</div>
                  <div>Method</div>
                  <div>Status</div>
                </div>

                {weeklyData.map((payment, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-xs text-gray-900 dark:text-white py-1">
                    <div>{payment.week}</div>
                    <div>${payment.amount.toFixed(2)}</div>
                    <div>Bank</div>
                    <div className="text-green-600 dark:text-green-400">{payment.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium text-sm">{method.name}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs">
                        Fee: {method.fee} | Min: {method.minPayout}
                      </div>
                    </div>
                    <button className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 text-xs">Configure</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index} className="text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700">
                    <td className="py-2">{transaction.date}</td>
                    <td className="py-2">{transaction.type}</td>
                    <td className="py-2 text-right">${transaction.amount.toFixed(2)}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'Completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSalesTab = () => {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <p className="text-lg font-medium">Sales Analytics</p>
        <p className="text-sm mt-2">Detailed sales data will appear here</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-slate-800 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-20 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 border-4 border-pink-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Cargando perfil...</p>
            </div>
          </div>
        )}

        <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Management - {performer?.stage_name ?? ''}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex overflow-x-auto scrollbar-hide border-t border-gray-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-pink-600 text-pink-600 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'pricing' && renderPricingTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
          {activeTab === 'like' && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <p>I like section - Coming soon</p>
            </div>
          )}
          {activeTab === 'media' && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Image profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Selecciona una única imagen Aprobada (status = 3) para asignarla como avatar.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/** Render approved photos */}
                  {_profileDataFromApi &&
                    mediaItems &&
                    mediaItems
                      .filter((m) => m.type === 'photo' && m.statusCode === 3)
                      .map((m) => (
                        <div
                          key={m.id}
                          className={`relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 border ${
                            selectedImageId === m.id ? 'border-pink-600 border-2 ring-2 ring-pink-300' : 'border-gray-200'
                          }`}
                        >
                          <img src={m.fileURL} alt={m.assetName} className="w-full h-40 object-cover" />
                          <button
                            onClick={() => setSelectedImageId(m.id)}
                            className={`absolute bottom-0 left-0 right-0 py-2 text-sm font-medium transition-all duration-300 ${
                              selectedImageId === m.id
                                ? 'bg-pink-600 text-white'
                                : 'bg-white bg-opacity-90 text-gray-700 hover:bg-pink-500 hover:text-white'
                            }`}
                          >
                            {selectedImageId === m.id ? (
                              <span className="flex items-center justify-center gap-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Seleccionada
                              </span>
                            ) : (
                              'Seleccionar'
                            )}
                          </button>
                        </div>
                      ))}
                </div>

                <div className="mt-4">
                  <button
                    onClick={assignAvatar}
                    disabled={!selectedImageId || assignLoading}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50"
                  >
                    {assignLoading ? 'Asignando...' : 'Asignar como avatar'}
                  </button>
                  {assignError && <p className="text-red-500 mt-2">{assignError}</p>}
                  {assignSuccess && <p className="text-green-600 mt-2">{assignSuccess}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Video profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecciona un video Aprobado para asignarlo como video del performer.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mediaItems &&
                    mediaItems
                      .filter((m) => m.type === 'video' && m.statusCode === 3)
                      .map((m) => (
                        <div
                          key={m.id}
                          className={`relative rounded-lg overflow-hidden bg-black shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border ${
                            selectedVideoId === m.id ? 'border-pink-600 border-2 ring-2 ring-pink-300' : 'border-gray-300'
                          }`}
                        >
                          <video 
                            src={m.fileURL} 
                            poster={m.thumbnail}
                            controls
                            className="w-full h-64 md:h-80 object-contain"
                          >
                            Tu navegador no soporta el elemento de video.
                          </video>
                          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                            Video
                          </div>
                          <button
                            onClick={() => setSelectedVideoId(m.id)}
                            className={`absolute bottom-0 left-0 right-0 py-3 text-sm font-medium transition-all duration-300 ${
                              selectedVideoId === m.id
                                ? 'bg-pink-600 text-white'
                                : 'bg-white bg-opacity-90 text-gray-700 hover:bg-pink-500 hover:text-white'
                            }}`}
                          >
                            {selectedVideoId === m.id ? (
                              <span className="flex items-center justify-center gap-1">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Seleccionado
                              </span>
                            ) : (
                              'Seleccionar'
                            )}
                          </button>
                        </div>
                      ))}
                </div>

                <div className="mt-4">
                  <button
                    onClick={assignVideo}
                    disabled={!selectedVideoId || assignLoading}
                    className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50"
                  >
                    {assignLoading ? 'Asignando...' : 'Asignar como video'}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Avatar actual</h4>
                  <img 
                    src={localAvatar || performer?.avatar_url || 'https://via.placeholder.com/150'} 
                    alt="avatar" 
                    className="w-full max-w-xs rounded-lg object-cover shadow-md" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Video actual</h4>
                  {(() => {
                    const currentVideo = _profileDataFromApi?.videoAssetId 
                      ? mediaItems.find(m => m.type === 'video' && Number(m.id) === _profileDataFromApi.videoAssetId)
                      : null;
                    
                    return currentVideo ? (
                      <video 
                        src={currentVideo.fileURL}
                        poster={currentVideo.thumbnail}
                        controls
                        className="w-full max-w-xs h-64 rounded-lg object-contain bg-black shadow-md"
                      >
                        Tu navegador no soporta el elemento de video.
                      </video>
                    ) : (
                      <div className="w-full max-w-xs h-48 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                        {_profileDataFromApi?.videoAssetId 
                          ? `Video ID ${_profileDataFromApi.videoAssetId} no encontrado en assets`
                          : 'Sin video asignado'}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'sales' && renderSalesTab()}
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Save className="w-4 h-4" />
            <span>Save changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}

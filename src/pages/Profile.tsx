import React, { useState } from 'react';
import {
  Save,
  Upload,
  Link as LinkIcon,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
} from 'lucide-react';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'personal' | 'profile' | 'like' | 'pricing' | 'media' | 'payments' | 'sales'
  >('personal');

  interface ProfileDataType {
    nickname: string;
    headline: string;
    myLive: string;
    age: number;
    height: number;
    weight: number;
    zodiac: string;
    ethnicity: string;
    sexualPreference: string;
    hairColor: string;
    eyeColor: string;
    build: string;
    country: string;
    twitterLink: string;
    instagramLink: string;
    videoCallRate: number;
    streamingRate: number;
  }

  const [profileData, setProfileData] = useState<ProfileDataType>({
    nickname: 'Zafira',
    headline:
      'Hello, welcome, I am an influencer and I love that you follow me on my social networks so that you are updated on all my daily activities, which by the way are very fun.',
    myLive:
      'With me you will always find new adventures, some humor, company, fun and above all a girl who likes to enjoy life, as well as meeting interesting people from all over the world.',
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
    videoCallRate: 18,
    streamingRate: 30,
  });

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'profile', label: 'Profile' },
    { id: 'like', label: 'I like' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'media', label: 'Media profile' },
    { id: 'payments', label: 'Payments' },
    { id: 'sales', label: 'Sales' },
  ];

  const handleInputChange = <K extends keyof ProfileDataType>(
    field: K,
    value: ProfileDataType[K]
  ) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          <img
            src="/icons/default-avatar.svg"
            alt="Profile"
            className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
          />
          <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-pink-600 hover:bg-pink-700 p-1 md:p-2 rounded-full transition-colors">
            <Upload className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Zafira</h2>
          <p className="text-gray-400 text-sm md:text-base">
            Your profile - English show information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            NickName
          </label>
          <input
            type="text"
            value={profileData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Headline</label>
        <textarea
          value={profileData.headline}
          onChange={(e) => handleInputChange('headline', e.target.value)}
          rows={2}
          className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">My live</label>
        <textarea
          value={profileData.myLive}
          onChange={(e) => handleInputChange('myLive', e.target.value)}
          rows={2}
          className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
        />
      </div>

      <div className="bg-blue-600 p-3 md:p-4 rounded-lg">
        <button className="flex items-center space-x-2 text-white">
          <LinkIcon className="w-4 h-4" />
          <span className="text-sm md:text-base">Enable your telegram</span>
        </button>
        <p className="text-xs md:text-sm text-blue-100 mt-2">
          You must have telegram on your phone, Android, iPhone. When you press the button, open the
          telegram, click start, with this register your telegram to receive notifications from
          LiveCharmss
        </p>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Age</label>
          <div className="relative">
            <input
              type="range"
              min="18"
              max="50"
              value={profileData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-white font-medium text-sm md:text-base">
              {profileData.age} years
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Height</label>
          <div className="relative">
            <input
              type="range"
              min="150"
              max="180"
              value={profileData.height}
              onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-white font-medium text-sm md:text-base">
              {profileData.height} cms
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Weight</label>
          <div className="relative">
            <input
              type="range"
              min="45"
              max="80"
              value={profileData.weight}
              onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-white font-medium text-sm md:text-base">
              {profileData.weight} kl
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Zodiac</label>
          <select
            value={profileData.zodiac}
            onChange={(e) => handleInputChange('zodiac', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
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
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Ethnicity
          </label>
          <select
            value={profileData.ethnicity}
            onChange={(e) => handleInputChange('ethnicity', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="White">White</option>
            <option value="Black">Black</option>
            <option value="Asian">Asian</option>
            <option value="Hispanic">Hispanic</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Sexual Preference
          </label>
          <select
            value={profileData.sexualPreference}
            onChange={(e) => handleInputChange('sexualPreference', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Straight">Straight</option>
            <option value="Gay">Gay</option>
            <option value="Bisexual">Bisexual</option>
            <option value="Lesbian">Lesbian</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Hair Color
          </label>
          <select
            value={profileData.hairColor}
            onChange={(e) => handleInputChange('hairColor', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Brown">Brown</option>
            <option value="Black">Black</option>
            <option value="Blonde">Blonde</option>
            <option value="Red">Red</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Eye Color
          </label>
          <select
            value={profileData.eyeColor}
            onChange={(e) => handleInputChange('eyeColor', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Green">Green</option>
            <option value="Brown">Brown</option>
            <option value="Blue">Blue</option>
            <option value="Hazel">Hazel</option>
            <option value="Gray">Gray</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Build</label>
          <select
            value={profileData.build}
            onChange={(e) => handleInputChange('build', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Slender">Slender</option>
            <option value="Athletic">Athletic</option>
            <option value="Average">Average</option>
            <option value="Curvy">Curvy</option>
            <option value="Plus Size">Plus Size</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Display Country
          </label>
          <select
            value={profileData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="Colombia +57">Colombia +57</option>
            <option value="USA +1">USA +1</option>
            <option value="Mexico +52">Mexico +52</option>
            <option value="Argentina +54">Argentina +54</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            TwitterLink
          </label>
          <input
            type="text"
            value={profileData.twitterLink}
            onChange={(e) => handleInputChange('twitterLink', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            InstagramLink
          </label>
          <input
            type="text"
            value={profileData.instagramLink}
            onChange={(e) => handleInputChange('instagramLink', e.target.value)}
            className="w-full bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            VideoCallMinute
          </label>
          <div className="relative">
            <input
              type="range"
              min="10"
              max="50"
              value={profileData.videoCallRate}
              onChange={(e) => handleInputChange('videoCallRate', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-white font-medium text-sm md:text-base">
              {profileData.videoCallRate} tokens - 2.7 dtrs
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
            Streaming_Minute
          </label>
          <div className="relative">
            <input
              type="range"
              min="20"
              max="60"
              value={profileData.streamingRate}
              onChange={(e) => handleInputChange('streamingRate', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center mt-2 text-white font-medium text-sm md:text-base">
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
        {/* Earnings Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-slate-700 rounded-lg p-3 md:p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Total Earnings</p>
                <p className="text-lg md:text-xl font-bold text-white">$234.50</p>
              </div>
              <div className="p-2 rounded-lg bg-green-600">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 md:p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">This Week</p>
                <p className="text-lg md:text-xl font-bold text-white">$67.30</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-600">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 md:p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Pending</p>
                <p className="text-lg md:text-xl font-bold text-white">$45.30</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-600">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3 md:p-4 border border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Available</p>
                <p className="text-lg md:text-xl font-bold text-white">$189.20</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-600">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Weekly Payments */}
          <div className="bg-slate-700 rounded-lg border border-slate-600 p-3 md:p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm md:text-base font-semibold">Weekly Payments</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select className="bg-slate-600 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-pink-500">
                  <option value="Semana 33, 2025">Semana 33, 2025</option>
                  <option value="Semana 32, 2025">Semana 32, 2025</option>
                  <option value="Semana 31, 2025">Semana 31, 2025</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-600 p-3 rounded-lg">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-400 mb-2">
                  <div>Week</div>
                  <div>Amount US$</div>
                  <div>Method</div>
                  <div>Status</div>
                </div>

                {weeklyData.map((payment, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-xs text-white py-1">
                    <div>{payment.week}</div>
                    <div>${payment.amount.toFixed(2)}</div>
                    <div>Bank</div>
                    <div className="text-green-400">{payment.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-slate-700 rounded-lg border border-slate-600 p-3 md:p-4">
            <h3 className="text-sm md:text-base font-semibold mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="bg-slate-600 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium text-sm">{method.name}</div>
                      <div className="text-gray-400 text-xs">
                        Fee: {method.fee} | Min: {method.minPayout}
                      </div>
                    </div>
                    <button className="text-pink-400 hover:text-pink-300 text-xs">Configure</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-slate-600">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index} className="text-white border-b border-slate-600/50">
                    <td className="py-2">{transaction.date}</td>
                    <td className="py-2">{transaction.type}</td>
                    <td className="py-2 text-right">${transaction.amount.toFixed(2)}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'Completed'
                            ? 'bg-green-600 text-green-100'
                            : 'bg-yellow-600 text-yellow-100'
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

  const SalesAnalyticsTab = () => {
    const [selectedWeek, setSelectedWeek] = useState('33');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const weeklyData = [
      {
        week: '33',
        period: 'Aug 14-20, 2025',
        totalEarnings: 234.5,
        privateShows: { amount: 120.3, count: 8, avgDuration: 15 },
        tips: { amount: 45.2, count: 23, avgAmount: 1.97 },
        videos: { amount: 35.0, count: 5, avgPrice: 7.0 },
        photos: { amount: 18.5, count: 12, avgPrice: 1.54 },
        gifts: { amount: 15.5, count: 7, avgValue: 2.21 },
      },
      {
        week: '32',
        period: 'Aug 7-13, 2025',
        totalEarnings: 189.75,
        privateShows: { amount: 95.2, count: 6, avgDuration: 12 },
        tips: { amount: 52.3, count: 28, avgAmount: 1.87 },
        videos: { amount: 28.0, count: 4, avgPrice: 7.0 },
        photos: { amount: 14.25, count: 9, avgPrice: 1.58 },
        gifts: { amount: 0.0, count: 0, avgValue: 0 },
      },
    ];

    const categories = [
      { id: 'all', label: 'All Categories', icon: '📊' },
      { id: 'privateShows', label: 'Private Shows', icon: '🎥' },
      { id: 'tips', label: 'Tips', icon: '💰' },
      { id: 'videos', label: 'Videos', icon: '📹' },
      { id: 'photos', label: 'Photos', icon: '📸' },
      { id: 'gifts', label: 'Gifts', icon: '🎁' },
    ];

    const currentWeekData = weeklyData.find((week) => week.week === selectedWeek) || weeklyData[0];
    const previousWeekData =
      weeklyData.find((week) => week.week === (parseInt(selectedWeek) - 1).toString()) ||
      weeklyData[1];

    type CategoryKey = 'privateShows' | 'tips' | 'videos' | 'photos' | 'gifts';

    interface CategoryData {
      amount: number;
      count?: number;
      avgDuration?: number;
      avgAmount?: number;
      avgPrice?: number;
      avgValue?: number;
    }

    interface WeeklyProfileData {
      week: string;
      period: string;
      totalEarnings: number;
      privateShows: CategoryData;
      tips: CategoryData;
      videos: CategoryData;
      photos: CategoryData;
      gifts: CategoryData;
    }

    const calculateTrend = (category: 'total' | CategoryKey) => {
      const currentValue =
        category === 'total'
          ? currentWeekData.totalEarnings
          : (currentWeekData as WeeklyProfileData)[category]?.amount || 0;
      const previousValue =
        category === 'total'
          ? previousWeekData.totalEarnings
          : (previousWeekData as WeeklyProfileData)[category]?.amount || 0;

      if (previousValue === 0) return { change: '0.0', isPositive: true };

      const change = ((currentValue - previousValue) / previousValue) * 100;
      return { change: change.toFixed(1), isPositive: change >= 0 };
    };

    const getRecommendations = () => {
      const last7Weeks = weeklyData.slice(0, 7);
      const avgEarnings = last7Weeks.reduce((sum, week) => sum + week.totalEarnings, 0) / 7;
      const bestCategory = (Object.entries(currentWeekData) as [string, unknown][])
        .filter(([key]) => !['week', 'period', 'totalEarnings'].includes(key))
        .sort(([, a], [, b]) => {
          const aAmount = (a as CategoryData).amount ?? 0;
          const bAmount = (b as CategoryData).amount ?? 0;
          return bAmount - aAmount;
        })[0];

      return [
        {
          type: 'success',
          title: 'Top Performer',
          message: `${bestCategory[0]} generated $${(
            (bestCategory[1] as CategoryData).amount ?? 0
          ).toFixed(2)} this week`,
          action: 'Focus more time on this category',
        },
        {
          type: 'info',
          title: 'Weekly Average',
          message: `Your 7-week average is $${avgEarnings.toFixed(2)}`,
          action:
            currentWeekData.totalEarnings > avgEarnings
              ? 'Great job! Above average'
              : 'Try to increase engagement',
        },
        {
          type: 'warning',
          title: 'Growth Opportunity',
          message: 'Videos have the highest per-item value',
          action: 'Consider creating more premium video content',
        },
      ];
    };

    return (
      <div className="space-y-6">
        {/* Header con filtros */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white">Sales Analytics</h3>
            <p className="text-gray-400 text-sm">
              Detailed breakdown of your earnings and performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {weeklyData.map((week) => (
                <option key={week.week} value={week.week}>
                  {week.period}
                </option>
              ))}
            </select>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Resumen semanal */}
        <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-lg border border-pink-500/30 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-semibold text-lg md:text-xl">Week Summary</h4>
              <p className="text-pink-300 text-sm">{currentWeekData.period}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-white">
                ${currentWeekData.totalEarnings.toFixed(2)}
              </div>
              <div
                className={`text-sm flex items-center justify-end space-x-1 ${
                  calculateTrend('total').isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <span>{calculateTrend('total').isPositive ? '↗' : '↘'}</span>
                <span>{calculateTrend('total').change}% vs last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Desglose por categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(currentWeekData)
            .filter(([key]) => !['week', 'period', 'totalEarnings'].includes(key))
            .filter(([key]) => selectedCategory === 'all' || selectedCategory === key)
            .map(([category, data]) => {
              const categoryData = data as CategoryData;
              const trend = calculateTrend(category as 'total' | CategoryKey);

              return (
                <div key={category} className="bg-slate-700 rounded-lg border border-slate-600 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium capitalize text-sm">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        trend.isPositive
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {trend.isPositive ? '+' : ''}
                      {trend.change}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Revenue</span>
                      <span className="text-white font-semibold">
                        ${categoryData.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">Count</span>
                      <span className="text-gray-300">{categoryData.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-xs">
                        {category === 'privateShows' ? 'Avg Duration' : 'Avg Value'}
                      </span>
                      <span className="text-gray-300">
                        {category === 'privateShows'
                          ? `${categoryData.avgDuration}min`
                          : `$${
                              categoryData.avgAmount ||
                              categoryData.avgPrice ||
                              categoryData.avgValue ||
                              0
                            }`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Recomendaciones */}
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getRecommendations().map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  rec.type === 'success'
                    ? 'bg-green-900/20 border-green-500'
                    : rec.type === 'info'
                    ? 'bg-blue-900/20 border-blue-500'
                    : 'bg-yellow-900/20 border-yellow-500'
                }`}
              >
                <h5 className="text-white font-medium text-sm mb-1">{rec.title}</h5>
                <p className="text-gray-300 text-xs mb-2">{rec.message}</p>
                <p className="text-gray-400 text-xs italic">{rec.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Profile Management</h1>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-shrink-0 px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-3 md:p-6">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'pricing' && renderPricingTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
          {activeTab === 'like' && (
            <div className="text-center py-4 md:py-8 text-gray-400">
              <p>I like section - Coming soon</p>
            </div>
          )}
          {activeTab === 'media' && (
            <div className="text-center py-4 md:py-8 text-gray-400">
              <p>Media profile section - Coming soon</p>
            </div>
          )}
          {activeTab === 'sales' && <SalesAnalyticsTab />}
        </div>

        <div className="border-t border-slate-700 p-3 md:p-6">
          <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 md:px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm md:text-base">
            <Save className="w-4 h-4" />
            <span>Save changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

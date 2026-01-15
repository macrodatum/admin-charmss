import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import PerformerProfileService from '../../app/services/performerProfile.service';
import type {
  PerformerProfile as PerformerProfileType,
  Performer,
} from '../../app/types/performers.types';

interface PersonalInformationTabProps {
  performer: Performer;
}

export default function PersonalInformationTab({ performer }: PersonalInformationTabProps) {
  const performerId = performer.id;
  const stageName = performer.stage_name;
  const avatarUrl = performer.avatar;
  const rating = performer.rating ?? 0;
  const totalShows = performer.total_shows ?? 0;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nickname: '',
    headline: '',
    myLive: '',
  });

  // Cargar datos del perfil al montar
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = performer.performerProfile;
        setFormData({
          nickname: profile?.nickName || stageName,
          headline: profile?.headLines || '',
          myLive: profile?.showDescription || 'Welcome! Share your story and connect with fans.',
        });
      } catch (error) {
        console.error('Error loading personal info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload: Partial<PerformerProfileType> = {
        nickName: formData.nickname,
        headLines: formData.headline,
        showDescription: formData.myLive,
      };
      await PerformerProfileService.updatePerformerProfile(performerId, payload);
      setSaveMessage('Personal guardado correctamente');
    } catch (err) {
      console.error('Error saving personal info:', err);
      setSaveMessage('Error guardando Personal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando información personal...</p>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            NickName
          </label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
          />
        </div>
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

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50 hover:bg-pink-700 transition-colors"
        >
          {saving ? 'Guardando...' : 'Save personal'}
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

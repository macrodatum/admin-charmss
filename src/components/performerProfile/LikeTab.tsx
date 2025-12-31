import React, { useState, useEffect } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import LikeService, { type LikePreference } from '../../app/services/like.service';

interface LikeTabProps {
  performerId: string;
}

export default function LikeTab({ performerId }: LikeTabProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<LikePreference[]>([]);
  const [customPreferences, setCustomPreferences] = useState<string[]>([]);
  const [newCustom, setNewCustom] = useState('');

  const categories = LikeService.getAvailableCategories();

  // Cargar preferencias al montar
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        const data = await LikeService.getPerformerLikes(performerId);
        setPreferences(data.preferences);
        setCustomPreferences(data.customPreferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [performerId]);

  const togglePreference = (category: string, value: string) => {
    const existing = preferences.find((p) => p.category === category && p.value === value);

    if (existing) {
      setPreferences((prev) =>
        prev.map((p) =>
          p.category === category && p.value === value ? { ...p, selected: !p.selected } : p
        )
      );
    } else {
      setPreferences((prev) => [
        ...prev,
        {
          id: Date.now(),
          category,
          value,
          selected: true,
        },
      ]);
    }
  };

  const addCustomPreference = () => {
    if (newCustom.trim() && !customPreferences.includes(newCustom.trim())) {
      setCustomPreferences((prev) => [...prev, newCustom.trim()]);
      setNewCustom('');
    }
  };

  const removeCustomPreference = (value: string) => {
    setCustomPreferences((prev) => prev.filter((p) => p !== value));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await LikeService.updatePerformerLikes(performerId, {
        preferences,
        customPreferences,
      });
      setSaveMessage('Preferencias guardadas correctamente');
    } catch {
      setSaveMessage('Error guardando preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando preferencias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
        <Heart className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Cosas que me gustan</h3>
      </div>

      {Object.entries(categories).map(([categoryKey, items]) => (
        <div key={categoryKey} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {categoryKey}
          </h4>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => {
              const pref = preferences.find(
                (p) => p.category === categoryKey && p.value === item
              );
              const isSelected = pref?.selected ?? false;

              return (
                <button
                  key={item}
                  onClick={() => togglePreference(categoryKey, item)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Preferencias personalizadas
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCustom}
            onChange={(e) => setNewCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomPreference()}
            placeholder="Agregar preferencia personalizada..."
            className="flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
          <button
            onClick={addCustomPreference}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {customPreferences.map((pref) => (
            <div
              key={pref}
              className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white rounded-full text-sm"
            >
              <span>{pref}</span>
              <button
                onClick={() => removeCustomPreference(pref)}
                className="hover:bg-pink-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
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
          {saving ? 'Guardando...' : 'Save preferences'}
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

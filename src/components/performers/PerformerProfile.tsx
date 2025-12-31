import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Performer } from '../../app/types/performers.types';
import PersonalInformationTab from '../performerProfile/PersonalInformationTab';
import ProfileTab from '../performerProfile/ProfileTab';
import LikeTab from '../performerProfile/LikeTab';
import PricingTab from '../performerProfile/PricingTab';
import MediaProfileTab from '../performerProfile/MediaProfileTab';
import PaymentsTab from '../performerProfile/PaymentsTab';
import SalesTab from '../performerProfile/SalesTab';

interface PerformerProfileProps {
  performer: Performer | null;
  onClose: () => void;
}

export default function PerformerProfile({ performer, onClose }: PerformerProfileProps) {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'profile', label: 'Profile' },
    { id: 'like', label: 'I like' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'media', label: 'Media profile' },
    { id: 'payments', label: 'Payments' },
    { id: 'sales', label: 'Sales' },
  ];

  if (!performer) {
    return null;
  }

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Profile Management - {performer.stage_name}
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
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalInformationTab performer={performer} />
          )}
          {activeTab === 'profile' && <ProfileTab performerId={performer.id} />}
          {activeTab === 'like' && <LikeTab performerId={performer.id} />}
          {activeTab === 'pricing' && <PricingTab performerId={performer.id} />}
          {activeTab === 'media' && (
            <MediaProfileTab performer={performer} />
          )}
          {activeTab === 'payments' && <PaymentsTab performerId={performer.id} />}
          {activeTab === 'sales' && <SalesTab performerId={performer.id} />}
        </div>
      </div>
    </div>
  );
}

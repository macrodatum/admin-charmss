import React from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const notifications = [
    {
      id: 1,
      user: 'Elizabethrous',
      avatar:
        '/icons/default-avatar.svg',
      message: 'está en línea',
      description: "Hello, I'm Elizabethrous! Follow me in livecharmss",
      time: 'Hace 514d',
      type: 'online',
      actionText: 'Ver perfil',
    },
    {
      id: 2,
      user: 'Scart',
      avatar:
        '/icons/default-avatar.svg',
      message: 'ha iniciado un show',
      description:
        '🔥 **Dare to cross the line...** 🔥 Your desires whisper in the dark, waiting to be heard. Do you dare to answer the call? Come, dive into a conversation where words burn, where every sentence is a touch, and every response, an electrifying',
      time: 'Hace 527d',
      type: 'show',
      actionText: 'Ver show',
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />

      {/* Notification Panel */}
      <div className="fixed md:absolute right-0 top-0 md:top-full md:mt-2 w-full md:w-96 h-full md:h-auto max-h-screen md:max-h-[500px] bg-slate-800 border-l md:border border-slate-700 md:rounded-lg shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-pink-500" />
            <h3 className="text-white font-semibold">Notifications</h3>
            <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">2</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-b border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={notification.avatar}
                  alt={notification.user}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium text-sm">{notification.user}</h4>
                    <span className="text-xs text-gray-400">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="text-green-400">{notification.user}</span>{' '}
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-3">
                    {notification.description}
                  </p>
                  <button className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded text-xs transition-colors">
                    {notification.actionText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button className="w-full text-center text-pink-500 hover:text-pink-400 text-sm transition-colors">
            Marcar todas como leídas
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;

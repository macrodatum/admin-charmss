import React, { useState } from 'react';
import { Search, Plus, Phone, Video, MoreVertical } from 'lucide-react';
import ChatComponent from '../components/ChatComponent';

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState(0);

  const chats = [
    {
      id: 1,
      name: 'dancequeen',
      avatar:
        '/icons/default-avatar.svg',
      lastMessage: 'Thanks for the amazing show! 💕',
      time: '10:32 AM',
      unread: 2,
      online: true,
      isGroup: true,
      members: 234,
    },
    {
      id: 2,
      name: 'viewer123',
      avatar:
        '/icons/default-avatar.svg',
      lastMessage: 'Are you available for a private show?',
      time: '10:33 AM',
      unread: 0,
      online: true,
      isGroup: false,
    },
    {
      id: 3,
      name: 'premium_fan',
      avatar:
        '/icons/default-avatar.svg',
      lastMessage: 'Can we schedule another session?',
      time: '9:45 AM',
      unread: 1,
      online: false,
      isGroup: false,
    },
    {
      id: 4,
      name: 'Live Stream Chat',
      avatar:
        '/icons/default-avatar.svg',
      lastMessage: 'Welcome everyone! 🎉',
      time: '9:30 AM',
      unread: 15,
      online: true,
      isGroup: true,
      members: 156,
    },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row bg-slate-900">
      {/* Chat List */}
      <div className="w-full lg:w-80 bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col max-h-64 lg:max-h-none">
        <div className="p-3 md:p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-semibold text-white">Messages</h2>
            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(index)}
              className={`p-3 md:p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${
                selectedChat === index ? 'bg-slate-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                  />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-medium truncate text-sm md:text-base">
                        {chat.name}
                      </h3>
                      {chat.isGroup && (
                        <span className="text-xs text-gray-400">({chat.members})</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{chat.time}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{chat.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {chats[selectedChat]?.isGroup ? (
          <ChatComponent title={chats[selectedChat]?.name} isPublic={true} className="h-full" />
        ) : (
          <>
            {/* Private Chat Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={chats[selectedChat]?.avatar}
                    alt={chats[selectedChat]?.name}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-medium text-sm md:text-base">
                      {chats[selectedChat]?.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400">
                      {chats[selectedChat]?.online ? 'Online' : 'Last seen 2h ago'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            <ChatComponent title={chats[selectedChat]?.name} isPublic={false} className="flex-1" />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;

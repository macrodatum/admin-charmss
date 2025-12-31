import React, { useState } from 'react';
import { Send, Smile, Paperclip, Image, Gift } from 'lucide-react';

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  time: string;
  type: 'message' | 'tip' | 'gift' | 'join';
  amount?: number;
  avatar?: string;
}

interface ChatComponentProps {
  title?: string;
  isPublic?: boolean;
  className?: string;
  showTabs?: boolean;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  title = 'Public chat',
  isPublic = true,
  className = '',
  showTabs = true,
}) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

  const publicMessages: ChatMessage[] = [
    {
      id: 1,
      user: 'dancequeen',
      message: "Hi there! I'm currently live streaming! What brings you here today? 😊",
      time: '10:32 AM',
      type: 'message',
      avatar:
        '/icons/default-avatar.svg',
    },
    {
      id: 2,
      user: 'viewer123',
      message: 'Your dance moves are amazing! Where did you learn to dance like that?',
      time: '10:33 AM',
      type: 'message',
    },
    {
      id: 3,
      user: 'premium_fan',
      message: 'sent a tip',
      time: '10:34 AM',
      type: 'tip',
      amount: 25,
    },
    {
      id: 4,
      user: 'newuser',
      message: 'joined the room',
      time: '10:35 AM',
      type: 'join',
    },
    {
      id: 5,
      user: 'fan_girl',
      message: 'You look absolutely stunning today! 💕',
      time: '10:36 AM',
      type: 'message',
    },
    {
      id: 6,
      user: 'bigtipper',
      message: 'sent a gift',
      time: '10:37 AM',
      type: 'gift',
      amount: 50,
    },
  ];

  const privateMessages: ChatMessage[] = [
    {
      id: 1,
      user: 'premium_fan',
      message: 'Hey beautiful, are you available for a private show?',
      time: '10:30 AM',
      type: 'message',
      avatar:
        '/icons/default-avatar.svg',
    },
    {
      id: 2,
      user: 'You',
      message: "Hi! Yes, I'm available. What did you have in mind?",
      time: '10:31 AM',
      type: 'message',
    },
  ];

  const messages = activeTab === 'public' ? publicMessages : privateMessages;

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  const getMessageStyle = (msg: ChatMessage) => {
    switch (msg.type) {
      case 'tip':
        return 'bg-yellow-600/20 border-l-4 border-yellow-500';
      case 'gift':
        return 'bg-pink-600/20 border-l-4 border-pink-500';
      case 'join':
        return 'bg-green-600/20 border-l-4 border-green-500';
      default:
        return '';
    }
  };

  const getMessageIcon = (msg: ChatMessage) => {
    switch (msg.type) {
      case 'tip':
        return <span className="text-yellow-500">💰</span>;
      case 'gift':
        return <Gift className="w-4 h-4 text-pink-500" />;
      case 'join':
        return <span className="text-green-500">👋</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-lg flex flex-col h-full ${className}`}
    >
      {/* Chat Header */}
      <div className="p-3 border-b border-slate-700">
        {isPublic && showTabs ? (
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'public'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Public chat</span>
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'private'
                  ? 'bg-pink-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              <span>Private messages</span>
            </button>
          </div>
        ) : (
          <h3 className="text-white font-medium">{title}</h3>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 rounded-lg ${getMessageStyle(msg)}`}>
            <div className="flex items-start space-x-2">
              {msg.avatar && (
                <img
                  src={msg.avatar}
                  alt={msg.user}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`text-sm font-medium ${
                      msg.user === 'dancequeen'
                        ? 'text-pink-400'
                        : msg.user === 'You'
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {msg.user === 'You' ? '' : '@'}
                    {msg.user}
                  </span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                  {getMessageIcon(msg)}
                </div>
                <div className="text-sm text-white">
                  {msg.type === 'tip' && (
                    <span className="text-yellow-400 font-medium">sent a tip of ${msg.amount}</span>
                  )}
                  {msg.type === 'gift' && (
                    <span className="text-pink-400 font-medium">
                      sent a gift worth ${msg.amount}
                    </span>
                  )}
                  {msg.type === 'join' && (
                    <span className="text-green-400 font-medium">joined the room</span>
                  )}
                  {msg.type === 'message' && msg.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Paperclip className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Image className="w-4 h-4 text-gray-400" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full bg-slate-700 text-white px-3 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-600 rounded transition-colors">
              <Smile className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            className="bg-pink-600 hover:bg-pink-700 p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-3 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;

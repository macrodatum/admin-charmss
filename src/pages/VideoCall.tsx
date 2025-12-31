import React, { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Camera, Settings } from 'lucide-react';
import ChatComponent from '../components/ChatComponent';

const VideoCall: React.FC = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [callDuration, _setCallDuration] = useState('00:00');

  const incomingCalls = [
    {
      id: 1,
      user: 'premium_fan',
      avatar:
        '/icons/default-avatar.svg',
      rate: '$2.7/min',
      waiting: '2 min',
    },
    {
      id: 2,
      user: 'viewer123',
      avatar:
        '/icons/default-avatar.svg',
      rate: '$2.7/min',
      waiting: '1 min',
    },
  ];

  const handleAcceptCall = (_callId: number) => {
    setIsInCall(true);
  };

  const handleRejectCall = (_callId: number) => {
    // Handle call rejection
  };

  const handleEndCall = () => {
    setIsInCall(false);
  };

  if (isInCall) {
    return (
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row">
        {/* Video Call Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-3 md:p-4 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <img
                src="/icons/default-avatar.svg"
                alt="User"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full"
              />
              <div>
                <h3 className="text-white font-medium text-sm md:text-base">premium_fan</h3>
                <p className="text-xs md:text-sm text-gray-400">
                  Private Video Call • {callDuration}
                </p>
              </div>
            </div>
            <div className="text-green-500 font-medium text-sm md:text-base">$2.7/min</div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 p-3 md:p-4">
            {/* User Video */}
            <div className="bg-slate-800 rounded-lg aspect-video relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                    <span className="text-xl md:text-2xl font-bold text-white">PF</span>
                  </div>
                  <p className="text-white text-base md:text-lg">premium_fan</p>
                </div>
              </div>
            </div>

            {/* Your Video */}
            <div className="bg-slate-800 rounded-lg aspect-video relative overflow-hidden">
              {cameraEnabled ? (
                <div className="w-full h-full bg-gradient-to-br from-pink-900 to-purple-900 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto mb-2 md:mb-4" />
                    <p className="text-white text-base md:text-lg">Your Camera</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-2 md:mb-4" />
                    <p className="text-gray-400 text-base md:text-lg">Camera Off</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="bg-slate-800 border-t border-slate-700 p-3 md:p-4">
            <div className="flex items-center justify-center space-x-3 md:space-x-4">
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-2 md:p-3 rounded-full transition-colors ${
                  cameraEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {cameraEnabled ? (
                  <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />
                ) : (
                  <VideoOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-2 md:p-3 rounded-full transition-colors ${
                  micEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {micEnabled ? (
                  <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
                ) : (
                  <MicOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
                )}
              </button>

              <button className="hidden md:block p-2 md:p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors">
                <Settings className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>

              <button
                onClick={handleEndCall}
                className="p-2 md:p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              >
                <PhoneOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-full lg:w-80 h-64 lg:h-full border-t lg:border-t-0 lg:border-l border-slate-700">
          <ChatComponent title="Private Chat" isPublic={false} className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Video Calls</h1>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs md:text-sm text-gray-400">Available for calls</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Incoming Calls */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Incoming Calls</span>
            <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
              {incomingCalls.length}
            </span>
          </h3>

          <div className="space-y-4">
            {incomingCalls.map((call) => (
              <div key={call.id} className="bg-slate-700 p-3 md:p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={call.avatar}
                      alt={call.user}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                    />
                    <div>
                      <h4 className="text-white font-medium text-sm md:text-base">{call.user}</h4>
                      <p className="text-xs md:text-sm text-gray-400">Waiting for {call.waiting}</p>
                    </div>
                  </div>
                  <div className="text-green-500 font-medium text-sm">{call.rate}</div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-3">
                  <button
                    onClick={() => handleAcceptCall(call.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleRejectCall(call.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Settings */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Call Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
                Video Call Rate
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value="18"
                  className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
                <span className="text-gray-400 text-sm">tokens/min</span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mt-1">≈ $2.7/min</p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
                Auto-accept calls
              </label>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-300 text-sm">
                  Automatically accept calls from premium members
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
                Call Quality
              </label>
              <select className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm">
                <option value="hd">HD (720p)</option>
                <option value="fhd">Full HD (1080p)</option>
                <option value="sd">SD (480p)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
                Availability
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-300 text-sm">Available for video calls</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300 text-sm">Show availability status to users</span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg transition-colors text-sm md:text-base">
            Save Settings
          </button>
        </div>
      </div>

      {/* Call History */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Recent Calls</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-xs md:text-sm border-b border-slate-700">
                <th className="pb-3">User</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Earnings</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700">
                <td className="py-3 text-white text-xs md:text-sm">premium_fan</td>
                <td className="py-3 text-gray-300 text-xs md:text-sm">15:30</td>
                <td className="py-3 text-green-500 font-medium text-xs md:text-sm">$41.85</td>
                <td className="py-3 text-gray-300 text-xs md:text-sm">2025-01-15</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="py-3 text-white text-xs md:text-sm">viewer123</td>
                <td className="py-3 text-gray-300 text-xs md:text-sm">8:45</td>
                <td className="py-3 text-green-500 font-medium text-xs md:text-sm">$23.63</td>
                <td className="py-3 text-gray-300 text-xs md:text-sm">2025-01-14</td>
                <td className="py-3">
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">
                    Completed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

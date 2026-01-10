import React, { useState, useEffect } from 'react';
import { X, Camera, Mic, MicOff, CameraOff, Eye, DollarSign, Users, Clock } from 'lucide-react';
import StreamingChat from './StreamingChat';
import { Performer } from '../../app/types/performers.types';

interface StreamingModalProps {
  performer: Performer;
  onClose: () => void;
}

const StreamingModal: React.FC<StreamingModalProps> = ({ performer, onClose }) => {
  const [isLive] = useState(performer.status === 'active');
  const [viewers, _setViewers] = useState<number | null>(
    () => Math.floor(Math.random() * 200) + 50
  );
  const [tips, _setTips] = useState<number | null>(() =>
    parseFloat((Math.random() * 500).toFixed(2))
  );
  const [followers, _setFollowers] = useState<number | null>(() => Math.floor(Math.random() * 50));
  const [streamingTime, setStreamingTime] = useState('0:00');
  const [cameraEnabled] = useState(true);
  const [micEnabled] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setStreamingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="modal-backdrop-dark modal-backdrop-adaptative">
      <div className="bg-slate-900 dark:bg-slate-900 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img
              src={performer.avatar || '/icons/default-avatar.svg'}
              alt={performer.stage_name || 'Avatar'}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-500"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{performer.stage_name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {isLive && (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{viewers} viewers</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-800 rounded-lg border border-slate-700 aspect-video relative overflow-hidden">
                {cameraEnabled ? (
                  <div className="w-full h-full bg-linear-to-br from-pink-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-white mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold">
                        {performer.stage_name}'s Stream
                      </p>
                      <p className="text-gray-300 text-sm">Live stream preview</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                    <div className="text-center">
                      <CameraOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">Camera Disabled</p>
                    </div>
                  </div>
                )}

                {isLive && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${cameraEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                      {cameraEnabled ? (
                        <Camera className="w-4 h-4 text-white" />
                      ) : (
                        <CameraOff className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${micEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                      {micEnabled ? (
                        <Mic className="w-4 h-4 text-white" />
                      ) : (
                        <MicOff className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{streamingTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Eye className="w-4 h-4" />
                    <span>Viewers</span>
                  </div>
                  <div className="text-white text-2xl font-bold">{viewers ?? 0}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Tips Today</span>
                  </div>
                  <div className="text-green-500 text-2xl font-bold">
                    ${tips?.toFixed(2) ?? '0.00'}
                  </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span>New Followers</span>
                  </div>
                  <div className="text-blue-500 text-2xl font-bold">{followers ?? 0}</div>
                </div>
              </div>

              {isLive && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Stream Stats</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Tips:</span>
                      <span className="text-green-500 font-medium">$45.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Private Requests:</span>
                      <span className="text-pink-500 font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stream Quality:</span>
                      <span className="text-white font-medium">HD 720p</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Connection:</span>
                      <span className="text-green-500 font-medium">Excellent</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="h-full">
                <StreamingChat
                  room={`performer_${performer.id}`}
                  performerName={performer.stage_name || 'Performer'}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingModal;

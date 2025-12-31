import React, { useState, useRef } from 'react';
import { Camera, Video, Upload, Calendar, Clock, X, RotateCcw } from 'lucide-react';

interface StoryPayload {
  id: string;
  type: 'photo' | 'video';
  file: File;
  comment: string;
  publishDate: string;
  publishTime: string;
  duration: number;
  createdAt: string;
}

interface StoryCreatorProps {
  onClose: () => void;
  onPublish: (story: StoryPayload) => void;
}

const StoryCreator: React.FC<StoryCreatorProps> = ({ onClose, onPublish }) => {
  const [contentType, setContentType] = useState<'photo' | 'video'>('photo');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [comment, setComment] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('');
  const [duration, setDuration] = useState('24');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const durations = [
    { value: '1', label: '1 hora' },
    { value: '6', label: '6 horas' },
    { value: '12', label: '12 horas' },
    { value: '24', label: '24 horas' },
    { value: '48', label: '2 días' },
    { value: '72', label: '3 días' },
    { value: '168', label: '1 semana' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: contentType === 'video',
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            stopCamera();
          }
        });
      }
    }
  };

  const startRecording = async () => {
    if (streamRef.current) {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], 'video.webm', { type: 'video/webm' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer for recording
      const timer = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 15) {
            stopRecording();
            clearInterval(timer);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  const handlePublish = () => {
    if (!selectedFile || !comment.trim()) return;

    const story = {
      id: Date.now().toString(),
      type: contentType,
      file: selectedFile,
      comment: comment.trim(),
      publishDate: publishDate || new Date().toISOString().split('T')[0],
      publishTime: publishTime || new Date().toTimeString().split(' ')[0].slice(0, 5),
      duration: parseInt(duration),
      createdAt: new Date().toISOString(),
    };

    onPublish(story);
    onClose();
  };

  const resetContent = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setComment('');
    stopCamera();
  };

  return (
    <div className="modal-backdrop-dark">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 md:p-6 text-center border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Crear Historia</h2>
          <p className="text-white/70 text-sm">Comparte tu felicidad con el mundo</p>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Content Type Selection */}
          <div>
            <h3 className="text-white font-semibold mb-3">Tipo de contenido</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setContentType('photo');
                  resetContent();
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  contentType === 'photo'
                    ? 'bg-pink-600 border-pink-500 text-white'
                    : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                }`}
              >
                <Camera className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Foto</span>
              </button>
              <button
                onClick={() => {
                  setContentType('video');
                  resetContent();
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  contentType === 'video'
                    ? 'bg-pink-600 border-pink-500 text-white'
                    : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Video</span>
              </button>
            </div>
          </div>

          {/* Media Preview/Capture Area */}
          <div className="bg-black rounded-xl overflow-hidden aspect-video relative">
            {previewUrl ? (
              <div className="relative w-full h-full">
                {contentType === 'photo' ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={previewUrl} className="w-full h-full object-cover" controls muted />
                )}
                <button
                  onClick={resetContent}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : isStreaming ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                {isRecording && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    REC {recordingTime}s / 15s
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Vista previa del contenido</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!selectedFile && !isStreaming && (
              <>
                <button
                  onClick={startCamera}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>{contentType === 'photo' ? 'Tomar Foto' : 'Grabar Video'}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Subir desde galería</span>
                </button>
              </>
            )}

            {isStreaming && !selectedFile && (
              <div className="flex space-x-3">
                {contentType === 'photo' ? (
                  <button
                    onClick={takePhoto}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Capturar Foto
                  </button>
                ) : (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 text-white py-3 rounded-xl font-medium transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}
                  >
                    {isRecording ? 'Detener' : 'Grabar'}
                  </button>
                )}
                <button
                  onClick={() => {
                    stopCamera();
                    resetContent();
                  }}
                  className="px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div>
            <h3 className="text-white font-semibold mb-3">Comentario</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte lo que te hace feliz... ✨"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl p-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              maxLength={200}
            />
            <div className="text-right text-white/50 text-xs mt-1">{comment.length}/200</div>
          </div>

          {/* Scheduling Section */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">Programación</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Publicar el:</label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Hora:</label>
                <input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Duración:</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {durations.map((dur) => (
                    <option key={dur.value} value={dur.value} className="bg-slate-800">
                      {dur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={!selectedFile || !comment.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            <Clock className="w-5 h-5" />
            <span>Programar Historia</span>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={contentType === 'photo' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default StoryCreator;

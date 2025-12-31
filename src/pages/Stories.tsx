import React, { useState } from 'react';
import { Plus, BarChart3, Calendar } from 'lucide-react';
import StoryCreator from '../components/stories/StoryCreator';
import StoryViewer from '../components/stories/StoryViewer';
import StoryGrid from '../components/stories/StoryGrid';

interface Story {
  id: string;
  type: 'photo' | 'video';
  url: string;
  comment: string;
  publishDate: string;
  publishTime: string;
  duration: number;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isActive: boolean;
  timeRemaining: string;
}

const Stories: React.FC = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'grid' | 'analytics' | 'scheduled'>('grid');

  // Mock data - in a real app this would come from an API
  const [stories, setStories] = useState<Story[]>([
    {
      id: '1',
      type: 'photo',
      url: '/icons/default-avatar.svg',
      comment:
        '¡Qué día tan hermoso! ☀️ Disfrutando de la playa y sintiendo la brisa del mar. La vida es bella cuando sabes apreciar los pequeños momentos. 🌊✨',
      publishDate: '2025-01-15',
      publishTime: '14:30',
      duration: 24,
      createdAt: '2025-01-15T14:30:00Z',
      views: 1234,
      likes: 89,
      comments: 23,
      isActive: true,
      timeRemaining: '18h restantes',
    },
    {
      id: '2',
      type: 'video',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      comment:
        '¡Bailando mi canción favorita! 💃 La música siempre me pone de buen humor. ¿Cuál es tu canción para bailar? 🎵',
      publishDate: '2025-01-14',
      publishTime: '20:15',
      duration: 24,
      createdAt: '2025-01-14T20:15:00Z',
      views: 2156,
      likes: 156,
      comments: 45,
      isActive: true,
      timeRemaining: '6h restantes',
    },
    {
      id: '3',
      type: 'photo',
      url: '/icons/default-avatar.svg',
      comment:
        'Momento de relajación con mi café favorito ☕ A veces necesitamos parar y disfrutar de las cosas simples de la vida.',
      publishDate: '2025-01-13',
      publishTime: '09:00',
      duration: 24,
      createdAt: '2025-01-13T09:00:00Z',
      views: 892,
      likes: 67,
      comments: 12,
      isActive: false,
      timeRemaining: 'Expirada',
    },
  ]);

  const handleCreateStory = () => {
    setShowCreator(true);
  };

  interface NewStoryPayload {
    type: 'photo' | 'video';
    file: File;
    comment: string;
    publishDate?: string;
    publishTime?: string;
    duration: number;
  }

  const handlePublishStory = (newStory: NewStoryPayload) => {
    const story: Story = {
      id: Date.now().toString(),
      type: newStory.type,
      url: URL.createObjectURL(newStory.file),
      comment: newStory.comment,
      publishDate: newStory.publishDate || new Date().toISOString().split('T')[0],
      publishTime: newStory.publishTime || new Date().toTimeString().slice(0, 5),
      duration: newStory.duration,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
      isActive: true,
      timeRemaining: `${newStory.duration}h restantes`,
    };
    setStories((prev) => [story, ...prev]);
  };

  const handleStoryClick = (index: number) => {
    setCurrentStoryIndex(index);
    setShowViewer(true);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setShowViewer(false);
    }
  };

  const handlePreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const activeStories = stories.filter((story) => story.isActive);
  const totalViews = stories.reduce((sum, story) => sum + story.views, 0);
  const totalLikes = stories.reduce((sum, story) => sum + story.likes, 0);
  const totalComments = stories.reduce((sum, story) => sum + story.comments, 0);

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{stories.length}</div>
          <div className="text-gray-400 text-sm">Total Historias</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Total Vistas</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{totalLikes}</div>
          <div className="text-gray-400 text-sm">Total Likes</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{totalComments}</div>
          <div className="text-gray-400 text-sm">Comentarios</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Rendimiento de Historias</h3>
        <div className="space-y-4">
          {stories.slice(0, 5).map((story, _index) => (
            <div key={story.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={story.url} alt="Story" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <div className="text-white text-sm font-medium line-clamp-1">{story.comment}</div>
                  <div className="text-gray-400 text-xs">
                    {story.publishDate} • {story.type}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{story.views}</div>
                <div className="text-gray-400 text-xs">vistas</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScheduled = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-semibold mb-2">Historias Programadas</h3>
        <p className="text-gray-400 mb-6">
          Aquí aparecerán las historias que hayas programado para publicar más tarde
        </p>
        <button
          onClick={handleCreateStory}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Programar Historia
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Historias</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Comparte momentos especiales con tus seguidores
          </p>
        </div>
        <button
          onClick={handleCreateStory}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center space-x-2 hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Historia</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Historias Activas</p>
              <p className="text-lg md:text-2xl font-bold text-white">{activeStories.length}</p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-green-600">
              <div className="w-4 h-4 md:w-6 md:h-6 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Vistas Totales</p>
              <p className="text-lg md:text-2xl font-bold text-white">
                {totalViews.toLocaleString()}
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-blue-600">
              <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Engagement</p>
              <p className="text-lg md:text-2xl font-bold text-white">
                {totalViews > 0
                  ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-pink-600">
              <div className="w-4 h-4 md:w-6 md:h-6 text-white">💖</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Promedio Vistas</p>
              <p className="text-lg md:text-2xl font-bold text-white">
                {stories.length > 0 ? Math.round(totalViews / stories.length) : 0}
              </p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-purple-600">
              <div className="w-4 h-4 md:w-6 md:h-6 text-white">📊</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-4 md:px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'grid'
                ? 'bg-pink-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Mis Historias
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 md:px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'bg-pink-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Analíticas
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 md:px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'scheduled'
                ? 'bg-pink-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Programadas
          </button>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'grid' && (
            <StoryGrid
              stories={stories}
              onStoryClick={handleStoryClick}
              onCreateStory={handleCreateStory}
            />
          )}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'scheduled' && renderScheduled()}
        </div>
      </div>

      {/* Story Creator Modal */}
      {showCreator && (
        <StoryCreator onClose={() => setShowCreator(false)} onPublish={handlePublishStory} />
      )}

      {/* Story Viewer Modal */}
      {showViewer && (
        <StoryViewer
          stories={stories}
          currentIndex={currentStoryIndex}
          onClose={() => setShowViewer(false)}
          onNext={handleNextStory}
          onPrevious={handlePreviousStory}
        />
      )}
    </div>
  );
};

export default Stories;

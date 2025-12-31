import React, { useState } from 'react';
import { Upload, Image, Eye, Heart, Download, Trash2, Edit, Plus } from 'lucide-react';

const Photos: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Photos', count: 24 },
    { id: 'public', label: 'Public', count: 12 },
    { id: 'premium', label: 'Premium', count: 8 },
    { id: 'private', label: 'Private', count: 4 },
  ];

  const photos = [
    {
      id: 1,
      url: '/icons/default-avatar.svg',
      title: 'Sunset Portrait',
      category: 'premium',
      views: 892,
      likes: 156,
      earnings: 45.5,
      uploadDate: '2025-01-15',
    },
    {
      id: 2,
      url: '/icons/default-avatar.svg',
      title: 'Studio Session',
      category: 'public',
      views: 456,
      likes: 89,
      earnings: 0,
      uploadDate: '2025-01-14',
    },
    {
      id: 3,
      url: '/icons/default-avatar.svg',
      title: 'Fashion Shoot',
      category: 'premium',
      views: 743,
      likes: 198,
      earnings: 67.2,
      uploadDate: '2025-01-13',
    },
    {
      id: 4,
      url: '/icons/default-avatar.svg',
      title: 'Behind the Scenes',
      category: 'private',
      views: 234,
      likes: 67,
      earnings: 89.3,
      uploadDate: '2025-01-12',
    },
  ];

  const filteredPhotos =
    selectedCategory === 'all'
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Photo Gallery</h1>
        <button className="bg-pink-600 hover:bg-pink-700 text-white px-3 md:px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm md:text-base">
          <Upload className="w-4 h-4" />
          <span className="hidden md:inline">Upload Photos</span>
          <span className="md:hidden">Upload</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Total Photos</p>
              <p className="text-lg md:text-2xl font-bold text-white">24</p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-blue-600">
              <Image className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Total Views</p>
              <p className="text-lg md:text-2xl font-bold text-white">2,325</p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-green-600">
              <Eye className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Total Likes</p>
              <p className="text-lg md:text-2xl font-bold text-white">510</p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-pink-600">
              <Heart className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Photo Earnings</p>
              <p className="text-lg md:text-2xl font-bold text-white">$202.00</p>
            </div>
            <div className="p-2 md:p-3 rounded-lg bg-purple-600">
              <Download className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 md:p-6">
        <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                selectedCategory === category.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="bg-slate-700 rounded-lg overflow-hidden group">
              <div className="relative aspect-square">
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 md:p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-1 md:p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button className="p-1 md:p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-1 md:top-2 left-1 md:left-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      photo.category === 'premium'
                        ? 'bg-yellow-600 text-white'
                        : photo.category === 'private'
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {photo.category.charAt(0).toUpperCase() + photo.category.slice(1)}
                  </span>
                </div>

                {/* Lock Icon for Premium/Private */}
                {(photo.category === 'premium' || photo.category === 'private') && (
                  <div className="absolute top-1 md:top-2 right-1 md:right-2">
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-xs">🔒</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2 md:p-4">
                <h3 className="text-white font-medium mb-2 text-sm md:text-base">{photo.title}</h3>
                <div className="flex items-center justify-between text-xs md:text-sm text-gray-400 mb-2">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{photo.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{photo.likes}</span>
                    </div>
                  </div>
                  {photo.earnings > 0 && (
                    <span className="text-green-500 font-medium text-xs md:text-sm">
                      ${photo.earnings}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{photo.uploadDate}</p>
              </div>
            </div>
          ))}

          {/* Upload New Photo Card */}
          <div className="bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 hover:border-pink-500 transition-colors cursor-pointer group">
            <div className="aspect-square flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-8 h-8 md:w-12 md:h-12 text-gray-400 group-hover:text-pink-500 mx-auto mb-2 transition-colors" />
                <p className="text-gray-400 group-hover:text-pink-500 transition-colors text-xs md:text-sm">
                  Upload New Photo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Performance Analytics */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Photo Performance</h3>

        <div className="space-y-4">
          {photos.slice(0, 5).map((photo, _index) => (
            <div
              key={photo.id}
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
                  />
                  <div className="absolute top-1 right-1">
                    <span
                      className={`px-1 py-0.5 rounded text-xs font-medium ${
                        photo.category === 'premium'
                          ? 'bg-yellow-600 text-white'
                          : photo.category === 'private'
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {photo.category.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm md:text-base line-clamp-1">
                    {photo.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs md:text-sm text-gray-400">
                    <span>{photo.uploadDate}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        photo.category === 'premium'
                          ? 'bg-yellow-600 text-white'
                          : photo.category === 'private'
                          ? 'bg-red-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {photo.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-white font-medium">{photo.views.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-medium">{photo.likes}</div>
                    <div className="text-gray-400 text-xs">likes</div>
                  </div>
                  {photo.earnings > 0 && (
                    <div className="text-center">
                      <div className="text-green-500 font-medium">${photo.earnings}</div>
                      <div className="text-gray-400 text-xs">earned</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-purple-400 font-medium">
                      {photo.views > 0 ? ((photo.likes / photo.views) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-gray-400 text-xs">engagement</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-700 rounded-lg">
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-white">
              {(photos.reduce((sum, photo) => sum + photo.views, 0) / photos.length).toFixed(0)}
            </div>
            <div className="text-gray-400 text-xs md:text-sm">Avg Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-pink-400">
              {(photos.reduce((sum, photo) => sum + photo.likes, 0) / photos.length).toFixed(0)}
            </div>
            <div className="text-gray-400 text-xs md:text-sm">Avg Likes</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-green-400">
              $
              {(
                photos.reduce((sum, photo) => sum + photo.earnings, 0) /
                  photos.filter((p) => p.earnings > 0).length || 0
              ).toFixed(2)}
            </div>
            <div className="text-gray-400 text-xs md:text-sm">Avg Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-lg md:text-xl font-bold text-purple-400">
              {photos.filter((p) => p.category === 'premium' || p.category === 'private').length}
            </div>
            <div className="text-gray-400 text-xs md:text-sm">Premium Photos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photos;

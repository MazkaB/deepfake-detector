import React, { useState } from 'react';

const VideoPlayer = ({ videoUrl, className = "", style = {} }) => {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadError = () => {
    setLoadError(true);
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setLoadError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const fullVideoUrl = videoUrl.startsWith('http') 
    ? videoUrl 
    : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${videoUrl}`;

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={style}>
        <div className="text-center p-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Video Unavailable</h3>
          <p className="text-gray-500 text-sm">
            The video could not be loaded. It may have been cleaned up from the server.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading video...</p>
          </div>
        </div>
      )}
      <video
        controls
        className="w-full rounded-lg shadow-sm"
        style={{ maxHeight: '400px' }}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleLoadError}
        preload="metadata"
      >
        <source src={fullVideoUrl} type="video/mp4" />
        <source src={fullVideoUrl} type="video/webm" />
        <source src={fullVideoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
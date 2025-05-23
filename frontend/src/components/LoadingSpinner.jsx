import React from 'react';

const LoadingSpinner = ({ status, filename }) => {
  const getStatusMessage = () => {
    if (!status) return 'Initializing...';
    
    switch (status.status) {
      case 'queued':
        return 'Video uploaded successfully, queued for processing...';
      case 'processing':
        if (status.progress < 30) return 'Extracting frames from video...';
        if (status.progress < 60) return 'Analyzing video properties...';
        if (status.progress < 90) return 'Running AI detection on frames...';
        return 'Finalizing results...';
      default:
        return 'Processing video...';
    }
  };

  const getProgressColor = () => {
    if (!status) return 'bg-gray-200';
    
    if (status.progress < 30) return 'bg-blue-500';
    if (status.progress < 60) return 'bg-yellow-500';
    if (status.progress < 90) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const progress = status?.progress || 0;

  return (
    <div className="text-center space-y-6">
      {/* Main Loading Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-indigo-600">
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          Analyzing Video
        </h3>
        <p className="text-gray-600">
          {getStatusMessage()}
        </p>
        {filename && (
          <p className="text-sm text-gray-500">
            File: {filename}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Processing Steps
          </h4>
          <div className="space-y-3">
            {/* Step 1: Frame Extraction */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 30 ? 'bg-green-500 text-white' : 
                progress >= 10 ? 'bg-blue-500 text-white' : 
                'bg-gray-200 text-gray-400'
              }`}>
                {progress >= 30 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">1</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Extract Frames</p>
                <p className="text-xs text-gray-500">Extracting key frames from video</p>
              </div>
            </div>

            {/* Step 2: Video Analysis */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 60 ? 'bg-green-500 text-white' : 
                progress >= 30 ? 'bg-yellow-500 text-white' : 
                'bg-gray-200 text-gray-400'
              }`}>
                {progress >= 60 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">2</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Analyze Properties</p>
                <p className="text-xs text-gray-500">Processing video metadata and properties</p>
              </div>
            </div>

            {/* Step 3: AI Detection */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 90 ? 'bg-green-500 text-white' : 
                progress >= 60 ? 'bg-orange-500 text-white' : 
                'bg-gray-200 text-gray-400'
              }`}>
                {progress >= 90 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">3</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">AI Detection</p>
                <p className="text-xs text-gray-500">Running Vision Transformer analysis</p>
              </div>
            </div>

            {/* Step 4: Generate Results */}
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress >= 100 ? 'bg-green-500 text-white' : 
                progress >= 90 ? 'bg-green-400 text-white' : 
                'bg-gray-200 text-gray-400'
              }`}>
                {progress >= 100 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">4</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Generate Results</p>
                <p className="text-xs text-gray-500">Compiling final analysis report</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="text-sm text-gray-500 max-w-md mx-auto">
        <p>
          This process typically takes 1-3 minutes depending on video length and complexity.
          Please keep this tab open while processing.
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
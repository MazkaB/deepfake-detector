import React from 'react';

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  const {
    overall_prediction,
    fake_percentage,
    total_frames_analyzed,
    fake_frames_count,
    real_frames_count,
    video_info
  } = results;

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (mb) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  // Get confidence level
  const getConfidenceLevel = (percentage) => {
    if (percentage >= 80 || percentage <= 20) return 'High';
    if (percentage >= 60 || percentage <= 40) return 'Medium';
    return 'Low';
  };

  // Get prediction color (updated for flipped logic)
  const getPredictionColor = () => {
    return overall_prediction === 'Fake' ? 'text-red-600' : 'text-green-600';
  };

  // Get background color for main result (updated for flipped logic)
  const getBackgroundColor = () => {
    return overall_prediction === 'Fake' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  };

  const confidenceLevel = getConfidenceLevel(fake_percentage);

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <div className={`rounded-lg border-2 p-8 text-center ${getBackgroundColor()}`}>
        <div className="space-y-4">
          {/* Prediction Icon */}
          <div className="flex justify-center">
            {overall_prediction === 'Fake' ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Main Result */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Video appears to be{' '}
              <span className={getPredictionColor()}>
                {overall_prediction}
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              {fake_percentage.toFixed(1)}% of frames detected as deepfake content
            </p>
          </div>

          {/* Confidence Level */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              confidenceLevel === 'High' ? 'bg-green-500' :
              confidenceLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            {confidenceLevel} Confidence
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Frames */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-10 0h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Frames Analyzed</p>
              <p className="text-2xl font-semibold text-gray-900">{total_frames_analyzed}</p>
            </div>
          </div>
        </div>

        {/* Fake Frames */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fake Frames</p>
              <p className="text-2xl font-semibold text-gray-900">{fake_frames_count}</p>
            </div>
          </div>
        </div>

        {/* Real Frames */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Real Frames</p>
              <p className="text-2xl font-semibold text-gray-900">{real_frames_count}</p>
            </div>
          </div>
        </div>

        {/* Fake Percentage */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fake Percentage</p>
              <p className="text-2xl font-semibold text-gray-900">{fake_percentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Information */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Video Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-lg text-gray-900">{formatDuration(video_info.duration)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Frame Rate</p>
              <p className="text-lg text-gray-900">{video_info.fps.toFixed(1)} FPS</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Resolution</p>
              <p className="text-lg text-gray-900">{video_info.width} × {video_info.height}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Frames</p>
              <p className="text-lg text-gray-900">{video_info.frame_count.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">File Size</p>
              <p className="text-lg text-gray-900">{formatFileSize(video_info.size_mb)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Summary</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Analyzed {total_frames_analyzed} frames using Vision Transformer AI model
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Detection confidence: {confidenceLevel} ({fake_percentage > 50 ? (100 - fake_percentage).toFixed(1) : fake_percentage.toFixed(1)}% margin)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              Frame-by-frame analysis reveals {fake_frames_count} potentially manipulated frames out of {total_frames_analyzed} analyzed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
import React, { useState, useCallback } from 'react';
import VideoUploader from './components/VideoUploader';
import ResultsDisplay from './components/ResultsDisplay';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { uploadVideo, checkJobStatus, getJobResults } from './services/api';
import './styles/App.css';

function App() {
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'processing', 'results'
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Handle video upload
  const handleVideoUpload = useCallback(async (file) => {
    try {
      setError(null);
      setCurrentView('processing');
      
      // Upload video
      const response = await uploadVideo(file);
      const newJobId = response.job_id;
      setJobId(newJobId);
      
      // Start polling for status
      pollJobStatus(newJobId);
      
    } catch (err) {
      setError(err.message || 'Upload failed');
      setCurrentView('upload');
    }
  }, []);

  // Poll job status
  const pollJobStatus = useCallback(async (jobId) => {
    try {
      const status = await checkJobStatus(jobId);
      setJobStatus(status);
      
      if (status.status === 'completed') {
        // Get results
        const resultsData = await getJobResults(jobId);
        setResults(resultsData.results);
        setCurrentView('results');
      } else if (status.status === 'error') {
        setError(status.error || 'Processing failed');
        setCurrentView('upload');
      } else {
        // Continue polling
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      setError(err.message || 'Status check failed');
      setCurrentView('upload');
    }
  }, []);

  // Reset to upload view
  const handleReset = useCallback(() => {
    setCurrentView('upload');
    setJobId(null);
    setJobStatus(null);
    setResults(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900">
                  🎭 Deepfake Detector
                </h1>
              </div>
            </div>
            {currentView !== 'upload' && (
              <button
                onClick={handleReset}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload View */}
        {currentView === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Upload Video for Deepfake Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload a video file to analyze whether it contains deepfake content. 
                Our AI model will examine each frame and provide detailed results.
              </p>
            </div>
            
            <VideoUploader onUpload={handleVideoUpload} />
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Analysis</h3>
                <p className="text-gray-600">Advanced frame-by-frame analysis using Vision Transformer technology</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Results</h3>
                <p className="text-gray-600">Get confidence scores, frame analysis, and interactive visualizations</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Processing</h3>
                <p className="text-gray-600">Quick analysis with real-time progress updates and efficient processing</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing View */}
        {currentView === 'processing' && (
          <div className="max-w-2xl mx-auto">
            <LoadingSpinner 
              status={jobStatus} 
              filename={jobStatus?.filename}
            />
          </div>
        )}

        {/* Results View */}
        {currentView === 'results' && results && (
          <div className="space-y-8">
            <ResultsDisplay results={results} />
            <Dashboard results={results} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Deepfake Detector. Powered by SamsanTech</p>
            <p className="mt-2">For educational and research purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
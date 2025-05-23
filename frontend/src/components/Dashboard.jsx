import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import VideoPlayer from './VideoPlayer';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ results }) => {
  if (!results || !results.frame_results) return null;

  const { 
    frame_results, 
    fake_percentage, 
    total_frames_analyzed, 
    fake_frames_count, 
    real_frames_count, 
    video_info, 
    video_url 
  } = results;

  // Prepare data for timeline chart
  const timelineData = useMemo(() => {
    const labels = frame_results.map((frame, index) => `${frame.timestamp.toFixed(1)}s`);
    const confidenceData = frame_results.map(frame => frame.confidence * 100);
    const predictionData = frame_results.map(frame => frame.prediction === 'Fake' ? 100 : 0);

    return {
      labels,
      datasets: [
        {
          label: 'Confidence Level (%)',
          data: confidenceData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Deepfake Detection',
          data: predictionData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: false,
          stepped: true,
        }
      ]
    };
  }, [frame_results]);

  // Prepare data for confidence distribution
  const confidenceDistribution = useMemo(() => {
    const ranges = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
    const counts = [0, 0, 0, 0, 0];

    frame_results.forEach(frame => {
      const confidence = frame.confidence * 100;
      if (confidence <= 20) counts[0]++;
      else if (confidence <= 40) counts[1]++;
      else if (confidence <= 60) counts[2]++;
      else if (confidence <= 80) counts[3]++;
      else counts[4]++;
    });

    return {
      labels: ranges,
      datasets: [
        {
          label: 'Number of Frames',
          data: counts,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(156, 163, 175, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(16, 185, 129, 0.8)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(156, 163, 175)',
            'rgb(34, 197, 94)',
            'rgb(16, 185, 129)',
          ],
          borderWidth: 1,
        }
      ]
    };
  }, [frame_results]);

  // Prepare data for overall prediction pie chart
  const overallData = useMemo(() => ({
    labels: ['Real Frames', 'Fake Frames'],
    datasets: [
      {
        data: [real_frames_count, fake_frames_count],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      }
    ]
  }), [real_frames_count, fake_frames_count]);

  // Chart options
  const timelineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Frame-by-Frame Analysis Timeline'
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (seconds)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Confidence Level (%)'
        },
        min: 0,
        max: 100
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Confidence Level Distribution'
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Confidence Range'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Frames'
        }
      }
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Overall Frame Classification'
      },
    },
  };

  // Calculate statistics
  const avgConfidence = frame_results.reduce((sum, frame) => sum + frame.confidence, 0) / frame_results.length;
  const maxConfidence = Math.max(...frame_results.map(frame => frame.confidence));
  const minConfidence = Math.min(...frame_results.map(frame => frame.confidence));

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive Analysis Dashboard</h2>
        <p className="text-gray-600">Detailed frame-by-frame analysis and statistics</p>
      </div>

      {/* Video Player Section */}
      {video_url && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analyzed Video</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player */}
            <div className="space-y-4">
              <VideoPlayer 
                videoUrl={video_url}
                className="w-full"
                fps={video_info.fps}
                overallPrediction={results.overall_prediction}
              />
              <div className="text-sm text-gray-500 text-center">
                Original uploaded video with detection results and FPS overlay
              </div>
            </div>
            
            {/* Video Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Detection Results</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Classification:</span>
                    <span className={`font-semibold ${
                      results.overall_prediction === 'Fake' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {results.overall_prediction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold">{fake_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frames Analyzed:</span>
                    <span className="font-semibold">{total_frames_analyzed}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Video Properties</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frame Rate:</span>
                    <span className="font-semibold">{video_info.fps.toFixed(1)} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolution:</span>
                    <span className="font-semibold">{video_info.width} × {video_info.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {Math.floor(video_info.duration / 60)}:{(video_info.duration % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Frames:</span>
                    <span className="font-semibold">{video_info.frame_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Frame Classification</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-600">Fake Frames:</span>
                    <span className="font-semibold text-red-600">{fake_frames_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Real Frames:</span>
                    <span className="font-semibold text-green-600">{real_frames_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{(avgConfidence * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Average Confidence</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{(maxConfidence * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Highest Confidence</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{(minConfidence * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Lowest Confidence</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Line data={timelineData} options={timelineOptions} />
        </div>

        {/* Overall Classification Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <Doughnut data={overallData} options={doughnutOptions} />
        </div>
      </div>

      {/* Confidence Distribution Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <Bar data={confidenceDistribution} options={barOptions} />
      </div>

      {/* Frame Details Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Frame-by-Frame Details</h3>
          <p className="text-sm text-gray-500 mt-1">Detailed analysis results for each analyzed frame</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frame #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {frame_results.slice(0, 20).map((frame, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {frame.frame_number + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {frame.timestamp.toFixed(2)}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      frame.prediction === 'Fake' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {frame.prediction}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(frame.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(frame.probability * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {frame_results.length > 20 && (
            <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-500">
              Showing first 20 frames of {frame_results.length} total analyzed frames
            </div>
          )}
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Analysis Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Detection Model</h4>
            <ul className="space-y-1">
              <li>• Vision Transformer (ViT) based architecture</li>
              <li>• Pre-trained on ImageNet with custom deepfake head</li>
              <li>• Input resolution: 224×224 pixels</li>
              <li>• Binary classification (Real vs Fake)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Analysis Process</h4>
            <ul className="space-y-1">
              <li>• Frame extraction from uploaded video</li>
              <li>• Preprocessing and normalization</li>
              <li>• Individual frame classification</li>
              <li>• Confidence scoring and aggregation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
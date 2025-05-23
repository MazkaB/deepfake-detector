import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || error.response.statusText || 'Server error';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

/**
 * Upload video file for analysis
 * @param {File} file - Video file to upload
 * @returns {Promise<Object>} Upload response with job_id
 */
export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('video', file);
  
  try {
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for upload
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Check job processing status
 * @param {string} jobId - Job ID to check
 * @returns {Promise<Object>} Job status information
 */
export const checkJobStatus = async (jobId) => {
  try {
    const response = await api.get(`/api/status/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
};

/**
 * Get job results
 * @param {string} jobId - Job ID to get results for
 * @returns {Promise<Object>} Analysis results
 */
export const getJobResults = async (jobId) => {
  try {
    const response = await api.get(`/api/results/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Results fetch error:', error);
    throw error;
  }
};

/**
 * Get health status of the API
 * @returns {Promise<Object>} Health check response
 */
export const getHealthStatus = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * List all jobs (for debugging)
 * @returns {Promise<Object>} List of all jobs
 */
export const listJobs = async () => {
  try {
    const response = await api.get('/api/jobs');
    return response.data;
  } catch (error) {
    console.error('Jobs list error:', error);
    throw error;
  }
};

/**
 * Utility function to poll job status until completion
 * @param {string} jobId - Job ID to poll
 * @param {Function} onStatusUpdate - Callback for status updates
 * @param {number} interval - Polling interval in milliseconds (default: 2000)
 * @returns {Promise<Object>} Final job results
 */
export const pollJobUntilComplete = async (jobId, onStatusUpdate = null, interval = 2000) => {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const status = await checkJobStatus(jobId);
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
        
        if (status.status === 'completed') {
          try {
            const results = await getJobResults(jobId);
            resolve(results);
          } catch (error) {
            reject(error);
          }
        } else if (status.status === 'error') {
          reject(new Error(status.error || 'Job processing failed'));
        } else {
          // Continue polling
          setTimeout(poll, interval);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    poll();
  });
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {boolean} Whether file is valid
 */
export const validateVideoFile = (file) => {
  const supportedFormats = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  // Check file size
  if (file.size > maxSize) {
    throw new Error('File size must be less than 100MB');
  }
  
  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!supportedFormats.includes(fileExtension)) {
    throw new Error(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`);
  }
  
  return true;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default api;
import os
import uuid
import time
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import threading
from datetime import datetime

from model_loader import DeepfakeDetector
from video_processor import VideoProcessor

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
MODEL_PATH = 'models/vision_transformer_model.pth'
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables for job tracking
jobs = {}  # Store job status and results
detector = None  # Will be initialized on first use
video_processor = VideoProcessor()

def initialize_model():
    """Initialize the deepfake detection model"""
    global detector
    if detector is None:
        try:
            detector = DeepfakeDetector(MODEL_PATH)
            print("Model initialized successfully")
        except Exception as e:
            print(f"Error initializing model: {e}")
            detector = None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

def process_video_job(job_id, video_path):
    """Background job to process video"""
    global jobs, detector
    
    try:
        # Update job status
        jobs[job_id]['status'] = 'processing'
        jobs[job_id]['progress'] = 10
        jobs[job_id]['video_path'] = video_path  # Store video path for later serving
        
        # Process video and extract frames
        def progress_callback(progress):
            jobs[job_id]['progress'] = min(30 + progress * 0.3, 60)
        
        video_results = video_processor.process_video_for_analysis(
            video_path, 
            progress_callback
        )
        
        if 'error' in video_results:
            jobs[job_id]['status'] = 'error'
            jobs[job_id]['error'] = video_results['error']
            return
        
        jobs[job_id]['progress'] = 60
        
        # Initialize model if not already done
        if detector is None:
            initialize_model()
            
        if detector is None:
            jobs[job_id]['status'] = 'error'
            jobs[job_id]['error'] = 'Model initialization failed'
            return
        
        # Process frames through the model
        frames_data = video_results['frames_data']
        frame_results = []
        
        total_frames = len(frames_data)
        fake_count = 0
        
        for i, (frame, timestamp) in enumerate(frames_data):
            # Update progress
            progress = 60 + (i / total_frames) * 35
            jobs[job_id]['progress'] = int(progress)
            
            # Get prediction for this frame
            prediction = detector.predict_single_frame(frame)
            
            frame_result = {
                'frame_number': i,
                'timestamp': timestamp,
                'prediction': prediction['prediction'],
                'confidence': prediction['confidence'],
                'probability': prediction['probability']
            }
            
            frame_results.append(frame_result)
            
            if prediction['prediction'] == 'Fake':
                fake_count += 1
        
        # Calculate overall results
        fake_percentage = (fake_count / total_frames) * 100 if total_frames > 0 else 0
        overall_prediction = "Fake" if fake_percentage > 50 else "Real"
        
        # Compile final results
        final_results = {
            'overall_prediction': overall_prediction,
            'fake_percentage': fake_percentage,
            'total_frames_analyzed': total_frames,
            'fake_frames_count': fake_count,
            'real_frames_count': total_frames - fake_count,
            'video_info': video_results['video_info'],
            'frame_results': frame_results,
            'processing_time': video_results['processing_time'],
            'video_url': f'/api/video/{job_id}'  # Add video URL for frontend
        }
        
        jobs[job_id]['status'] = 'completed'
        jobs[job_id]['progress'] = 100
        jobs[job_id]['results'] = final_results
        
    except Exception as e:
        jobs[job_id]['status'] = 'error'
        jobs[job_id]['error'] = str(e)
        print(f"Error processing video {job_id}: {e}")
    
    # Don't delete video file immediately - keep it for serving

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_video():
    """Upload video for analysis"""
    try:
        # Check if file is present
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported'}), 400
        
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Save file
        filename = secure_filename(f"{job_id}_{file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Initialize job tracking
        jobs[job_id] = {
            'status': 'queued',
            'progress': 0,
            'created_at': datetime.now().isoformat(),
            'filename': file.filename
        }
        
        # Start processing in background
        threading.Thread(
            target=process_video_job, 
            args=(job_id, file_path)
        ).start()
        
        return jsonify({
            'job_id': job_id,
            'status': 'queued',
            'message': 'Video uploaded successfully and queued for processing'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get job processing status"""
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    return jsonify({
        'job_id': job_id,
        'status': job['status'],
        'progress': job.get('progress', 0),
        'created_at': job['created_at'],
        'filename': job.get('filename', ''),
        'error': job.get('error', None)
    })

@app.route('/api/results/<job_id>', methods=['GET'])
def get_job_results(job_id):
    """Get job results"""
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    if job['status'] != 'completed':
        return jsonify({'error': 'Job not completed yet'}), 400
    
    return jsonify({
        'job_id': job_id,
        'status': job['status'],
        'results': job['results']
    })

@app.route('/api/video/<job_id>', methods=['GET'])
def serve_video(job_id):
    """Serve the processed video file"""
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = jobs[job_id]
    
    if 'video_path' not in job or not os.path.exists(job['video_path']):
        return jsonify({'error': 'Video file not found'}), 404
    
    try:
        # Determine MIME type based on file extension
        file_ext = os.path.splitext(job['video_path'])[1].lower()
        mime_types = {
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.mkv': 'video/x-matroska',
            '.wmv': 'video/x-ms-wmv',
            '.flv': 'video/x-flv'
        }
        
        mime_type = mime_types.get(file_ext, 'video/mp4')
        
        return send_file(
            job['video_path'],
            as_attachment=False,
            mimetype=mime_type
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    """List all jobs (for debugging)"""
    return jsonify({
        'jobs': [{
            'job_id': job_id,
            'status': job['status'],
            'progress': job.get('progress', 0),
            'created_at': job['created_at'],
            'filename': job.get('filename', '')
        } for job_id, job in jobs.items()]
    })

def cleanup_old_videos():
    """Clean up old video files (older than 1 hour)"""
    current_time = time.time()
    to_remove = []
    
    for job_id, job in jobs.items():
        if 'video_path' in job and os.path.exists(job['video_path']):
            # Check if job is older than 1 hour
            created_time = datetime.fromisoformat(job['created_at']).timestamp()
            if current_time - created_time > 3600:  # 1 hour
                try:
                    os.remove(job['video_path'])
                    to_remove.append(job_id)
                except:
                    pass
    
    # Remove old job entries
    for job_id in to_remove:
        if job_id in jobs:
            del jobs[job_id]

@app.route('/api/cleanup', methods=['POST'])
def manual_cleanup():
    """Manual cleanup endpoint"""
    cleanup_old_videos()
    return jsonify({'message': 'Cleanup completed'})

@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({'error': 'File too large. Maximum size is 100MB'}), 413

@app.errorhandler(500)
def internal_server_error(error):
    """Handle internal server errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Initialize model on startup
    print("Starting Flask server...")
    print(f"Model path: {MODEL_PATH}")
    
    # Check if model file exists
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file not found at {MODEL_PATH}")
        print("Please ensure the vision_transformer_model.pth file is in the models/ directory")
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)
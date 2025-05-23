import cv2
import numpy as np
from PIL import Image
import os
import time

class VideoProcessor:
    """Handle video processing operations"""
    
    def __init__(self):
        self.supported_formats = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv']
    
    def is_supported_format(self, filename):
        """Check if the video format is supported"""
        ext = os.path.splitext(filename)[1].lower()
        return ext in self.supported_formats
    
    def get_video_info(self, video_path):
        """Get basic information about the video"""
        try:
            cap = cv2.VideoCapture(video_path)
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = frame_count / fps if fps > 0 else 0
            
            cap.release()
            
            return {
                'fps': fps,
                'frame_count': frame_count,
                'width': width,
                'height': height,
                'duration': duration,
                'size_mb': os.path.getsize(video_path) / (1024 * 1024)
            }
            
        except Exception as e:
            print(f"Error getting video info: {e}")
            return None
    
    def extract_frames(self, video_path, max_frames=100, skip_frames=1):
        """
        Extract frames from video for analysis
        
        Args:
            video_path: Path to video file
            max_frames: Maximum number of frames to extract
            skip_frames: Number of frames to skip between extractions
            
        Returns:
            list: List of PIL Images
        """
        frames = []
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                raise ValueError("Could not open video file")
            
            frame_count = 0
            extracted_count = 0
            
            while cap.isOpened() and extracted_count < max_frames:
                ret, frame = cap.read()
                
                if not ret:
                    break
                
                # Skip frames based on skip_frames parameter
                if frame_count % (skip_frames + 1) == 0:
                    # Convert BGR to RGB (OpenCV uses BGR)
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Convert to PIL Image
                    pil_image = Image.fromarray(frame_rgb)
                    frames.append(pil_image)
                    extracted_count += 1
                
                frame_count += 1
            
            cap.release()
            
        except Exception as e:
            print(f"Error extracting frames: {e}")
            
        return frames
    
    def extract_frames_with_timestamps(self, video_path, max_frames=100):
        """
        Extract frames with their timestamps
        
        Args:
            video_path: Path to video file
            max_frames: Maximum number of frames to extract
            
        Returns:
            list: List of tuples (PIL Image, timestamp_seconds)
        """
        frames_with_timestamps = []
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                raise ValueError("Could not open video file")
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Calculate frame skip to get evenly distributed frames
            skip_frames = max(1, total_frames // max_frames)
            
            frame_indices = range(0, total_frames, skip_frames)[:max_frames]
            
            for frame_idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if ret:
                    # Calculate timestamp
                    timestamp = frame_idx / fps if fps > 0 else 0
                    
                    # Convert BGR to RGB
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_image = Image.fromarray(frame_rgb)
                    
                    frames_with_timestamps.append((pil_image, timestamp))
            
            cap.release()
            
        except Exception as e:
            print(f"Error extracting frames with timestamps: {e}")
            
        return frames_with_timestamps
    
    def process_video_for_analysis(self, video_path, progress_callback=None):
        """
        Process entire video for deepfake analysis
        
        Args:
            video_path: Path to video file
            progress_callback: Optional callback function for progress updates
            
        Returns:
            dict: Processing results
        """
        start_time = time.time()
        
        # Get video info
        video_info = self.get_video_info(video_path)
        if not video_info:
            return {'error': 'Could not process video'}
        
        # Extract frames with timestamps
        frames_with_timestamps = self.extract_frames_with_timestamps(
            video_path, 
            max_frames=min(100, video_info['frame_count'])
        )
        
        if progress_callback:
            progress_callback(50)  # 50% progress after frame extraction
        
        # Prepare results
        results = {
            'video_info': video_info,
            'frames_extracted': len(frames_with_timestamps),
            'frames_data': frames_with_timestamps,
            'processing_time': time.time() - start_time
        }
        
        if progress_callback:
            progress_callback(100)  # 100% progress
        
        return results
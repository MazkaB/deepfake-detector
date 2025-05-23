# Deepfake Detection Web Application

A comprehensive web application for detecting deepfake content in videos using a pre-trained Vision Transformer (ViT) model. The application provides real-time analysis, interactive dashboards, and detailed frame-by-frame results.

## 🚀 Features

- **Video Upload**: Drag & drop or click to upload video files
- **AI-Powered Detection**: Uses Vision Transformer model for accurate deepfake detection
- **Real-time Processing**: Live progress updates during video analysis
- **Interactive Dashboard**: Charts and visualizations of detection results
- **Frame-by-Frame Analysis**: Detailed confidence scores for each analyzed frame
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **RESTful API**: Clean API endpoints for integration with other systems

## 🏗️ Architecture

- **Frontend**: React.js with TailwindCSS for styling
- **Backend**: Flask API server with PyTorch for model inference
- **AI Model**: Vision Transformer (ViT) pre-trained for deepfake detection
- **Video Processing**: OpenCV for frame extraction and analysis

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager
- At least 4GB RAM (8GB recommended)
- GPU support optional but recommended for faster processing

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd deepfake-detector
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create models directory and add your model
mkdir models
# Place your vision_transformer_model.pth file in the models/ directory
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Model Setup

Place your pre-trained Vision Transformer model file (`vision_transformer_model.pth`) in the `backend/models/` directory.

**Important**: Ensure your model file is named exactly `vision_transformer_model.pth` or update the path in `backend/app.py`.

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```
The backend will start at `http://localhost:5000`

2. **Start the Frontend Development Server**:
```bash
cd frontend
npm start
```
The frontend will start at `http://localhost:3000`

### Production Mode

1. **Build the Frontend**:
```bash
cd frontend
npm run build
```

2. **Run Backend with Gunicorn**:
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📁 Project Structure

```
deepfake-detector/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── model_loader.py        # Model loading and inference
│   ├── video_processor.py     # Video processing utilities
│   ├── requirements.txt       # Python dependencies
│   └── models/
│       └── vision_transformer_model.pth  # Your pre-trained model
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoUploader.jsx
│   │   │   ├── ResultsDisplay.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── App.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── uploads/                   # Temporary video storage
└── README.md
```

## 🔧 Configuration

### Backend Configuration

Create a `.env` file in the backend directory:

```env
FLASK_ENV=development
FLASK_DEBUG=True
MODEL_PATH=models/vision_transformer_model.pth
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=104857600  # 100MB in bytes
```

### Frontend Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAX_FILE_SIZE=100
```

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload video for analysis |
| GET | `/api/status/{job_id}` | Check processing status |
| GET | `/api/results/{job_id}` | Get analysis results |
| GET | `/api/jobs` | List all jobs (debug) |

### Example Usage

#### Upload Video
```bash
curl -X POST -F "video=@sample.mp4" http://localhost:5000/api/upload
```

#### Check Status
```bash
curl http://localhost:5000/api/status/{job_id}
```

#### Get Results
```bash
curl http://localhost:5000/api/results/{job_id}
```

## 🎯 Usage Instructions

1. **Upload Video**:
   - Open the application in your browser
   - Drag and drop a video file or click to browse
   - Supported formats: MP4, AVI, MOV, MKV, WMV, FLV
   - Maximum file size: 100MB

2. **Monitor Progress**:
   - Watch real-time progress updates
   - View processing steps and estimated completion time

3. **View Results**:
   - See overall prediction (Real/Fake) with confidence percentage
   - Review detailed frame-by-frame analysis
   - Explore interactive charts and visualizations

4. **Analyze Dashboard**:
   - View confidence distribution across frames
   - See timeline analysis of detection results
   - Export results for further analysis

## 🔍 Model Information

The application uses a Vision Transformer (ViT) model with the following specifications:

- **Architecture**: ViT-Base with patch size 16
- **Input Size**: 224×224 pixels
- **Output**: Binary classification (Real vs Fake)
- **Training**: Pre-trained on ImageNet, fine-tuned for deepfake detection
- **Accuracy**: Varies based on video quality and deepfake technique

## 🛡️ Security Considerations

- Files are temporarily stored and automatically deleted after processing
- No user data is permanently stored
- API endpoints include basic validation and error handling
- Consider adding authentication for production use

## 🐛 Troubleshooting

### Common Issues

1. **Model Loading Error**:
   - Ensure `vision_transformer_model.pth` is in the correct location
   - Check file permissions and disk space

2. **Video Upload Fails**:
   - Verify file format is supported
   - Check file size is under 100MB
   - Ensure stable internet connection

3. **Processing Hangs**:
   - Check backend logs for errors
   - Verify sufficient RAM and CPU resources
   - Consider reducing video resolution

4. **Frontend Build Fails**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Logs

- Backend logs: Check console output where Flask is running
- Frontend logs: Check browser developer console
- Processing logs: Monitor backend console during video analysis

## 📈 Performance Optimization

### For Better Performance:

1. **GPU Acceleration**:
   - Install CUDA-compatible PyTorch
   - Ensure GPU drivers are updated

2. **Memory Management**:
   - Reduce max_frames in video processing
   - Process videos in smaller batches

3. **Caching**:
   - Implement Redis for job status caching
   - Cache model weights for faster loading

## 🔮 Future Enhancements

- [ ] Support for batch video processing
- [ ] Real-time video stream analysis
- [ ] User authentication and session management
- [ ] Model performance metrics and A/B testing
- [ ] Advanced visualization options
- [ ] Export results to PDF/CSV
- [ ] Integration with cloud storage services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Vision Transformer (ViT) architecture by Google Research
- PyTorch and timm libraries for model implementation
- React and TailwindCSS for frontend development
- OpenCV for video processing capabilities

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation and troubleshooting guides
- Review logs for specific error messages

---

**Note**: This application is for educational and research purposes. Always verify results with multiple detection methods for critical applications.
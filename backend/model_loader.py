import torch
import torch.nn as nn
import timm
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

class ViTModel(nn.Module):
    """Vision Transformer model for deepfake detection"""
    def __init__(self):
        super(ViTModel, self).__init__()
        self.model_name = "Vision Transformer"
        # Use timm to load a pre-trained ViT model
        self.model = timm.create_model('vit_base_patch16_224', pretrained=True)
        
        # Replace the head with a custom classifier
        self.model.head = nn.Sequential(
            nn.Linear(self.model.head.in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1)
        )
    
    def forward(self, x):
        return self.model(x)

class DeepfakeDetector:
    """Main class for loading and using the deepfake detection model"""
    
    def __init__(self, model_path, device='cpu'):
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        self.model = self._load_model(model_path)
        self.transform = self._get_transform()
        
    def _load_model(self, model_path):
        """Load the pre-trained Vision Transformer model"""
        try:
            model = ViTModel()
            model.load_state_dict(torch.load(model_path, map_location=self.device))
            model.to(self.device)
            model.eval()
            print(f"Model loaded successfully on {self.device}")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def _get_transform(self):
        """Get image preprocessing transforms"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def predict_single_frame(self, image):
        """
        Predict if a single frame is deepfake or real
        
        Args:
            image: PIL Image or numpy array
            
        Returns:
            dict: {'probability': float, 'prediction': str, 'confidence': float}
        """
        try:
            # Convert numpy array to PIL Image if needed
            if isinstance(image, np.ndarray):
                image = Image.fromarray(image)
            
            # Ensure RGB format
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Preprocess image
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                output = self.model(input_tensor).squeeze()
                probability = torch.sigmoid(output).item()
                
            # Determine prediction and confidence (flipped logic)
            prediction = "Real" if probability > 0.5 else "Fake"
            confidence = probability if probability > 0.5 else (1 - probability)
            
            return {
                'probability': probability,
                'prediction': prediction,
                'confidence': confidence
            }
            
        except Exception as e:
            print(f"Error in prediction: {e}")
            return {
                'probability': 0.5,
                'prediction': "Error",
                'confidence': 0.0
            }
    
    def predict_frames(self, frames):
        """
        Predict multiple frames
        
        Args:
            frames: List of PIL Images or numpy arrays
            
        Returns:
            list: List of prediction dictionaries
        """
        results = []
        for frame in frames:
            result = self.predict_single_frame(frame)
            results.append(result)
        return results
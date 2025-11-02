import sys
import json
from PIL import Image
import os
import warnings
warnings.filterwarnings('ignore')

# Try to import TensorFlow, fall back to basic analysis if not available
try:
    import numpy as np
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow warnings
    os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN warnings
    
    # Import TensorFlow
    import tensorflow as tf
    from tensorflow import keras
    
    # Suppress additional warnings
    tf.get_logger().setLevel('ERROR')
    
    # Create TrueDivide layer class that matches the saved model's expectations
    class TrueDivide(keras.layers.Layer):
        """Custom layer for TrueDivide operation used in the model
        
        This layer performs element-wise division: output = input / divisor
        The divisor (127.5) is passed as a second argument during the functional API call.
        """
        def __init__(self, divisor=255.0, **kwargs):
            super(TrueDivide, self).__init__(**kwargs)
            self.divisor = float(divisor)
        
        def call(self, inputs, training=None, **kwargs):
            """Perform the division operation"""
            return tf.divide(inputs, self.divisor)
        
        @classmethod
        def from_config(cls, config):
            """Create layer from config, extracting divisor from inbound nodes if needed"""
            # The divisor might be in the config or we use default
            divisor = config.pop('divisor', 255.0)
            return cls(divisor=divisor, **config)
        
        def get_config(self):
            config = super().get_config()
            config['divisor'] = self.divisor
            return config
    
    TENSORFLOW_AVAILABLE = True
except Exception as e:
    TENSORFLOW_AVAILABLE = False
    print(f"TensorFlow not available: {e}", file=sys.stderr)

def load_model_safely(model_name='injured_dog_model.h5'):
    """Load a model with error handling"""
    try:
        # Check if it's an absolute path or relative path
        if os.path.isabs(model_name):
            model_path = model_name
        else:
            model_path = os.path.join(os.path.dirname(__file__), model_name)
        
        if not os.path.exists(model_path):
            print(f"Model file not found: {model_path}", file=sys.stderr)
            return None
        
        print(f"Loading model from: {model_path}", file=sys.stderr)
        
        # Try loading with safe_mode=False first (more permissive)
        try:
            model = keras.models.load_model(
                model_path,
                custom_objects={'TrueDivide': TrueDivide},
                compile=False,
                safe_mode=False
            )
            print(f"✅ Model loaded successfully: {os.path.basename(model_path)}", file=sys.stderr)
            return model
        except Exception as e1:
            print(f"Failed with safe_mode=False: {e1}", file=sys.stderr)
            # Try with default safe_mode
            model = keras.models.load_model(
                model_path,
                custom_objects={'TrueDivide': TrueDivide},
                compile=False
            )
            print(f"✅ Model loaded successfully: {os.path.basename(model_path)}", file=sys.stderr)
            return model
        
    except Exception as e:
        print(f"❌ Model loading error for {model_name}: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None

def predict_with_tensorflow(image_path, model):
    """Use TensorFlow model for prediction"""
    try:
        # Load and preprocess image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))  # Standard input size
        img_array = np.array(img, dtype=np.float32)
        
        # Normalize pixel values
        img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        prediction = model.predict(img_array, verbose=0)
        
        # Interpret results (adjust based on your model's output)
        # Assuming binary classification: [healthy_prob, injured_prob]
        if len(prediction[0]) == 2:
            injured_prob = float(prediction[0][1])
            is_injured = injured_prob > 0.5
            confidence = injured_prob if is_injured else (1 - injured_prob)
        else:
            # Single output (probability of injury)
            injured_prob = float(prediction[0][0])
            is_injured = injured_prob > 0.5
            confidence = injured_prob if is_injured else (1 - injured_prob)
        
        return {
            'is_injured': bool(is_injured),
            'confidence': float(confidence),
            'status': 'injured' if is_injured else 'healthy'
        }
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        return None

def predict_injury(image_path):
    """Main function to predict if dog is injured"""
    if not TENSORFLOW_AVAILABLE:
        print("Using fallback: TensorFlow not available", file=sys.stderr)
        return analyze_image_basic(image_path)
    
    # Try to load and use the model
    model = load_model_safely('injured_dog_model.h5')
    
    if model is None:
        print("Using fallback: Model loading failed", file=sys.stderr)
        return analyze_image_basic(image_path)
    
    # Use TensorFlow model
    print("✅ Using injury detection model", file=sys.stderr)
    result = predict_with_tensorflow(image_path, model)
    
    if result is None:
        print("Using fallback: Prediction failed", file=sys.stderr)
        return analyze_image_basic(image_path)
    
    return result

def analyze_image_basic(image_path):
    """Fallback: Basic image analysis without TensorFlow"""
    try:
        from PIL import ImageStat
        import numpy as np
        
        img = Image.open(image_path).convert('RGB')
        stat = ImageStat.Stat(img)
        
        # Get statistics
        r_avg, g_avg, b_avg = stat.mean
        r_std, g_std, b_std = stat.stddev
        
        # Convert to numpy for analysis
        img_array = np.array(img)
        
        # Calculate multiple heuristics
        # 1. Red dominance (wounds/blood)
        red_dominance = r_avg / (g_avg + b_avg + 1)
        
        # 2. Color variance (injuries often have irregular patterns)
        total_variance = (r_std + g_std + b_std) / 3
        
        # 3. Red channel intensity in bright areas
        bright_pixels = img_array[img_array[:,:,0] > 150]
        high_red_ratio = len(bright_pixels) / (img_array.shape[0] * img_array.shape[1]) if len(bright_pixels) > 0 else 0
        
        # 4. Darkness (injuries/matted fur may be darker)
        brightness = (r_avg + g_avg + b_avg) / 3
        
        # Combine heuristics with weights
        injury_score = 0.0
        
        # Red dominance check (blood/wounds)
        if red_dominance > 1.08:
            injury_score += (red_dominance - 1.0) * 0.4
        
        # High variance suggests irregular patterns
        if total_variance > 50:
            injury_score += min(total_variance / 200, 0.3)
        
        # Bright red areas
        if high_red_ratio > 0.1:
            injury_score += high_red_ratio * 0.2
        
        # Very dark or very bright (unusual)
        if brightness < 80 or brightness > 200:
            injury_score += 0.15
        
        # Normalize score to 0-1 range
        injury_score = min(1.0, injury_score)
        
        # Decision threshold
        is_injured = injury_score > 0.35
        confidence = injury_score if is_injured else (1.0 - injury_score)
        
        # Ensure confidence is reasonable (not too extreme)
        confidence = max(0.55, min(0.85, confidence))
        
        return {
            'is_injured': bool(is_injured),
            'confidence': float(confidence),
            'status': 'injured' if is_injured else 'healthy'
        }
    except Exception as e:
        return {
            'is_injured': False,
            'confidence': 0.5,
            'status': 'unknown',
            'error': str(e)
        }

def predict_ai_generated(image_path):
    """Detect if image is AI-generated using the dog_ai_detector model"""
    if not TENSORFLOW_AVAILABLE:
        print("Using fallback: TensorFlow not available for AI detection", file=sys.stderr)
        return {
            'is_ai_generated': False,
            'confidence': 0.5,
            'status': 'unknown'
        }
    
    # Try to load the AI detector model from Desktop
    ai_detector_path = r"C:\Users\Epari Subhransi\Desktop\dog_ai_detector.h5"
    model = load_model_safely(ai_detector_path)
    
    if model is None:
        print("Warning: AI detector model not loaded, using conservative default", file=sys.stderr)
        return {
            'is_ai_generated': False,
            'confidence': 0.5,
            'status': 'unknown'
        }
    
    try:
        # Load and preprocess image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))  # Standard input size
        img_array = np.array(img, dtype=np.float32)
        
        # Normalize pixel values
        img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Make prediction
        print("✅ Using AI-generated detection model", file=sys.stderr)
        prediction = model.predict(img_array, verbose=0)
        
        # Interpret results
        # Assuming binary classification or single probability output
        if len(prediction[0]) == 2:
            # [real_prob, ai_prob]
            ai_prob = float(prediction[0][1])
        else:
            # Single output (probability of being AI-generated)
            ai_prob = float(prediction[0][0])
        
        is_ai = ai_prob > 0.5
        confidence = ai_prob if is_ai else (1 - ai_prob)
        
        return {
            'is_ai_generated': bool(is_ai),
            'confidence': float(confidence),
            'status': 'ai_generated' if is_ai else 'real'
        }
    
    except Exception as e:
        print(f"AI detection prediction error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return {
            'is_ai_generated': False,
            'confidence': 0.5,
            'status': 'unknown',
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No image path provided'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(json.dumps({'error': 'Image file not found'}))
        sys.exit(1)
    
    # Run predictions
    injury_result = predict_injury(image_path)
    ai_result = predict_ai_generated(image_path)
    
    # Combine results
    result = {
        'injury_detection': injury_result,
        'ai_detection': ai_result
    }
    
    print(json.dumps(result))

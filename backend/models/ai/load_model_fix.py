"""
Helper script to convert the problematic .h5 model to a working format
"""
import tensorflow as tf
from tensorflow import keras
import sys
import os

# Register TrueDivide properly
@keras.saving.register_keras_serializable(package="keras.ops")
def TrueDivide(x, y):
    """TrueDivide operation wrapper"""
    return tf.divide(x, y)

# Try to load and re-save the model
model_path = os.path.join(os.path.dirname(__file__), 'injured_dog_model.h5')

try:
    print(f"Loading model from: {model_path}")
    
    # Load with custom objects
    with keras.utils.custom_object_scope({'TrueDivide': TrueDivide}):
        model = keras.models.load_model(model_path, compile=False)
    
    print("✅ Model loaded successfully!")
    print(f"Model summary:")
    model.summary()
    
    # Save in new format
    new_path = os.path.join(os.path.dirname(__file__), 'injured_dog_model_fixed')
    model.save(new_path)
    print(f"✅ Model saved to: {new_path}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

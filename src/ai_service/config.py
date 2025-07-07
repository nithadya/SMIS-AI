"""
Configuration settings for the AI prediction service.
"""
import os
from datetime import datetime, timedelta

# Database Configuration
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL', 'https://ghnlwaxzzqxlegrrdrhz.supabase.co')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY', 'your-anon-key')

# Model Configuration
MODEL_CONFIG = {
    'random_state': 42,
    'test_size': 0.2,
    'cv_folds': 5
}

# Feature Configuration
TEMPORAL_FEATURES = ['month', 'year', 'day_of_week', 'is_holiday']
SPATIAL_FEATURES = ['district', 'region']
CATEGORICAL_FEATURES = ['program_type', 'school_type']
NUMERICAL_FEATURES = ['historical_registrations', 'campaign_count']

# Sri Lanka Districts
SL_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

# Synthetic Data Configuration
SYNTHETIC_DATA_CONFIG = {
    'start_date': datetime(2020, 1, 1),
    'end_date': datetime.now(),
    'min_registrations': 5,
    'max_registrations': 100,
    'seasonal_factors': {
        1: 1.5,  # January (New Year intake)
        2: 0.8,
        3: 1.3,  # March intake
        4: 0.7,
        5: 0.6,
        6: 0.5,
        7: 0.4,
        8: 1.4,  # August (Second semester)
        9: 0.9,
        10: 0.7,
        11: 0.6,
        12: 0.5
    }
}

# Model Training Configuration
TRAINING_CONFIG = {
    'batch_size': 32,
    'epochs': 100,
    'early_stopping_patience': 10,
    'learning_rate': 0.001
}

# Prediction Configuration
PREDICTION_CONFIG = {
    'confidence_threshold': 0.8,
    'prediction_horizon': 12  # months
} 
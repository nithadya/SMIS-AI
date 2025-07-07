"""Configuration settings for the AI prediction service."""

# Sri Lankan districts
SL_DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

# Model configuration
MODEL_CONFIG = {
    'model_params': {
        'n_estimators': 200,
        'max_depth': 15,
        'min_samples_split': 5,
        'min_samples_leaf': 2,
        'max_features': 'sqrt',
        'bootstrap': True,
        'random_state': 42,
        'n_jobs': -1
    },
    'test_size': 0.2,
    'random_state': 42,
    'cv_folds': 5
}

# Feature categories
CATEGORICAL_FEATURES = [
    'district',
    'is_weekend',
    'is_month_start',
    'is_month_end',
    'is_campaign_active',
    'month',
    'quarter',
    'year',
    'day_of_week'
]

NUMERICAL_FEATURES = [
    'day_of_month',
    'days_to_month_end',
    'rolling_mean_7d',
    'rolling_std_7d',
    'rolling_mean_30d',
    'rolling_std_30d'
]

# Logging configuration
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'standard',
            'stream': 'ext://sys.stdout'
        },
        'file': {
            'class': 'logging.FileHandler',
            'level': 'INFO',
            'formatter': 'standard',
            'filename': 'logs/prediction.log',
            'mode': 'a'
        }
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True
        }
    }
}

# Evaluation metrics configuration
METRICS_CONFIG = {
    'output_dir': 'metrics',
    'filename_prefix': 'evaluation_metrics',
    'metrics': [
        'mean_squared_error',
        'mean_absolute_error',
        'r2_score',
        'explained_variance_score'
    ]
}

# Model persistence configuration
MODEL_PERSISTENCE = {
    'model_dir': 'models',
    'filename_prefix': 'registration_predictor'
} 
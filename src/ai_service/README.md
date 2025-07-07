# SMIS AI Prediction Service

This service provides AI-powered predictions for student registrations across different districts in Sri Lanka.

## Features

- District-wise student registration predictions
- Confidence scoring for predictions
- Seasonal trend analysis
- Feature importance analysis
- Model performance evaluation

## Project Structure

```
ai_service/
├── config.py           # Configuration settings
├── data_handler.py     # Data processing and synthetic data generation
├── model.py           # ML model implementation
├── pipeline.py        # Pipeline orchestration
├── requirements.txt   # Python dependencies
└── README.md         # This file
```

## Installation

1. Create a Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### Training the Model

```python
from ai_service.pipeline import PredictionPipeline

# Initialize pipeline
pipeline = PredictionPipeline(model_path='models/registration_predictor.joblib')

# Train model (uses synthetic data by default)
metrics = pipeline.train_pipeline()
print(f"Training metrics: {metrics}")
```

### Making Predictions

```python
# Generate predictions for next 12 months
predictions = pipeline.predict_pipeline(months_ahead=12)

# Print predictions
print(predictions.head())
```

### Evaluating Predictions

```python
# Evaluate predictions against actual data
evaluation_metrics = pipeline.evaluate_predictions(actual_data, predictions)
print(f"Evaluation metrics: {evaluation_metrics}")
```

## Model Details

The prediction service uses a Random Forest Regressor with the following features:

### Input Features

- Temporal: month, year, day_of_week, is_holiday
- Spatial: district, region
- Categorical: program_type, school_type
- Numerical: historical_registrations, campaign_count

### Output

- Predicted registration count per district
- Confidence score for each prediction

## Configuration

Key configurations can be modified in `config.py`:

- Model parameters
- Feature definitions
- Prediction thresholds
- Synthetic data generation settings

## Integration with SMIS

This AI service is designed to work with the existing SMIS (Student Management Information System) and provides predictions through:

1. Direct Python API calls
2. Model persistence and loading
3. Evaluation metrics for monitoring

## Development

### Adding New Features

1. Update `config.py` with new feature definitions
2. Modify `data_handler.py` to process new features
3. Retrain model using updated pipeline

### Improving Model Performance

1. Adjust model parameters in `config.py`
2. Modify feature engineering in `data_handler.py`
3. Update model implementation in `model.py`

## Notes

- Currently using synthetic data for training
- Real data integration requires implementing data loading from Supabase
- Model performance metrics are available through the pipeline's evaluation methods

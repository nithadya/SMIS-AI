# ICBT Student Registration Prediction System - ML Pipeline Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Pipeline Architecture](#pipeline-architecture)
4. [Data Processing](#data-processing)
5. [Model Architecture](#model-architecture)
6. [Training Process](#training-process)
7. [Deployment](#deployment)
8. [Maintenance & Updates](#maintenance--updates)

## Overview
The ICBT Student Registration Prediction System uses machine learning to forecast student registrations across different districts in Sri Lanka. The system employs a sophisticated pipeline that processes historical registration data, demographic information, and seasonal patterns to make accurate predictions.

## Technology Stack

### Core Technologies
- **Python 3.9+**: Primary programming language
- **scikit-learn 1.0+**: Machine learning framework
- **pandas 1.4+**: Data manipulation and analysis
- **numpy 1.21+**: Numerical computations
- **FastAPI**: API framework for model serving
- **SQLAlchemy**: Database ORM
- **PostgreSQL**: Primary database

### Supporting Libraries
- **feature-engine**: Feature engineering and preprocessing
- **optuna**: Hyperparameter optimization
- **joblib**: Model serialization
- **pytest**: Testing framework
- **black & flake8**: Code formatting and linting

## Pipeline Architecture

### 1. Data Ingestion Layer
- Raw data collection from multiple sources
- Data validation and quality checks
- Initial cleaning and formatting
- Database storage and versioning

### 2. Feature Engineering Layer
- Temporal feature extraction
- Geographic feature processing
- Economic indicator integration
- Feature scaling and normalization

### 3. Model Layer
- Model training and validation
- Hyperparameter optimization
- Model evaluation and selection
- Model versioning and storage

### 4. Serving Layer
- REST API endpoints
- Real-time prediction serving
- Batch prediction processing
- Model monitoring and logging

## Data Processing

### Data Sources
1. Historical Registration Data
   - Past student registrations
   - Course/program information
   - Temporal patterns

2. Geographic Data
   - District-wise population statistics
   - Urban/rural distribution
   - Economic indicators

3. External Factors
   - Seasonal patterns
   - Economic indices
   - Competition data
   - Holiday periods

### Feature Engineering

#### Temporal Features
- Year and month encoding
- Seasonal decomposition
- Holiday period flags
- Registration trend indicators

#### Geographic Features
- District population density
- Urban/rural ratio
- Economic development index
- Competition density

#### Interaction Features
- Season-district interaction
- Economic-geographic interaction
- Population-program interaction

## Model Architecture

### Primary Model: Gradient Boosting Regressor
- **Algorithm**: XGBoost/LightGBM
- **Objective**: Regression (student count prediction)
- **Loss Function**: Mean Squared Error (MSE)

### Model Components

1. Base Learners
   - Decision trees with controlled depth
   - Feature sampling at each split
   - L1/L2 regularization

2. Ensemble Structure
   - Sequential tree building
   - Gradient-based optimization
   - Feature importance tracking

### Hyperparameters
```python
model_params = {
    'n_estimators': 1000,
    'learning_rate': 0.01,
    'max_depth': 7,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'reg_alpha': 0.1,
    'reg_lambda': 1.0
}
```

## Training Process

### Data Preparation
1. Data splitting (70% train, 15% validation, 15% test)
2. Feature scaling and normalization
3. Missing value imputation
4. Outlier detection and handling

### Training Pipeline
1. Cross-validation setup (5-fold)
2. Hyperparameter optimization using Optuna
3. Model training with early stopping
4. Performance evaluation on validation set

### Model Evaluation
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- R-squared (R²) score
- Feature importance analysis

## Deployment

### Model Serving
1. Model serialization using joblib
2. FastAPI endpoints for predictions
3. Batch prediction capability
4. Real-time prediction API

### Monitoring
- Prediction accuracy tracking
- Data drift detection
- Model performance metrics
- System health monitoring

## Maintenance & Updates

### Regular Updates
1. Monthly model retraining
2. Feature importance analysis
3. Performance metric evaluation
4. Data quality assessment

### Model Versioning
- Git-based version control
- Model artifact versioning
- Feature set versioning
- Documentation updates

### Quality Assurance
1. Automated testing suite
2. Performance benchmarking
3. Code review process
4. Documentation maintenance

## Getting Started with New Data

### Adding New Data
1. Place new data in `data/raw` directory
2. Run data validation scripts
3. Execute feature engineering pipeline
4. Perform model retraining

### Data Format Requirements
```python
required_columns = [
    'registration_date',
    'district',
    'program_type',
    'student_count',
    'economic_index',
    'population_density'
]
```

### Validation Steps
1. Check data completeness
2. Verify data types
3. Handle missing values
4. Validate value ranges

### Retraining Process
1. Merge new data with existing dataset
2. Update feature engineering pipeline
3. Retrain model with updated parameters
4. Validate performance improvements
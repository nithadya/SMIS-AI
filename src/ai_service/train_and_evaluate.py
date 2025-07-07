"""
Script to train and evaluate the AI prediction pipeline.
Handles model training, prediction generation, and evaluation metrics.
"""
import os
from ai_service.pipeline import PredictionPipeline
import logging
import json
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def save_metrics(metrics, filename):
    """Save metrics to a JSON file with timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    metrics_dir = "metrics"
    if not os.path.exists(metrics_dir):
        os.makedirs(metrics_dir)
    
    filepath = os.path.join(metrics_dir, f"{filename}_{timestamp}.json")
    with open(filepath, 'w') as f:
        json.dump(metrics, f, indent=4)
    logger.info(f"Metrics saved to {filepath}")
    return filepath

def main():
    try:
        # Create models directory if it doesn't exist
        models_dir = "models"
        if not os.path.exists(models_dir):
            os.makedirs(models_dir)
        
        # Initialize pipeline
        model_path = os.path.join(models_dir, 'registration_predictor.joblib')
        logger.info("Initializing prediction pipeline...")
        pipeline = PredictionPipeline(model_path=model_path)

        # Train the model
        logger.info("Starting model training...")
        training_results = pipeline.train_pipeline()
        
        # Save training metrics
        training_metrics_file = save_metrics(
            training_results,
            "training_metrics"
        )
        
        logger.info("\nTraining Results:")
        logger.info(f"Metrics: {training_results['metrics']}")
        logger.info(f"Feature Importance: {training_results['feature_importance']}")
        logger.info(f"Data Shape: {training_results['data_shape']}")

        # Generate predictions
        logger.info("\nGenerating predictions...")
        predictions = pipeline.predict_pipeline(months_ahead=12)
        logger.info("\nSample Predictions:")
        logger.info(predictions.head())

        # Evaluate predictions
        logger.info("\nEvaluating predictions...")
        actual_data = pipeline.data_handler.generate_synthetic_data()
        evaluation_metrics = pipeline.evaluate_predictions(actual_data, predictions)
        
        # Save evaluation metrics
        eval_metrics_file = save_metrics(
            evaluation_metrics,
            "evaluation_metrics"
        )

        logger.info("\nEvaluation Metrics:")
        logger.info(f"Mean Squared Error: {evaluation_metrics['mse']:.2f}")
        logger.info(f"Mean Absolute Error: {evaluation_metrics['mae']:.2f}")
        logger.info(f"R² Score: {evaluation_metrics['r2']:.2f}")
        
        logger.info("\nDistrict-wise Metrics:")
        for district, metrics in evaluation_metrics['district_metrics'].items():
            logger.info(f"{district}: MAE={metrics['mae']:.2f}, R²={metrics['r2']:.2f}")

        logger.info("\nPipeline execution completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in pipeline execution: {str(e)}")
        raise

if __name__ == "__main__":
    main() 
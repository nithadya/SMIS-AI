"""
Training and evaluation script for the student registration prediction model.
"""
import logging
import json
from datetime import datetime
import os
from pipeline import PredictionPipeline

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_directory(directory: str) -> None:
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        logger.info(f"Created directory: {directory}")

def main():
    """Main execution function."""
    try:
        logger.info("Starting model training and evaluation...")
        
        # Create output directories
        create_directory('models')
        create_directory('metrics')
        
        # Initialize pipeline
        logger.info("Training model...")
        pipeline = PredictionPipeline()
        
        # Train model
        training_results = pipeline.train_pipeline()
        
        # Log training metrics
        logger.info("\nTraining Metrics:")
        logger.info(f"MSE: {training_results['metrics']['mse']:.2f}")
        logger.info(f"MAE: {training_results['metrics']['mae']:.2f}")
        logger.info(f"R²: {training_results['metrics']['r2']:.2f}")
        logger.info(f"RMSE: {training_results['metrics']['rmse']:.2f}")
        
        # Generate predictions
        logger.info("\nGenerating predictions...")
        predictions = pipeline.predict_pipeline()
        
        # Display sample predictions
        logger.info("\nSample Predictions:")
        logger.info(predictions.head())
        
        # Get actual data for evaluation
        actual_data = pipeline.data_handler.generate_synthetic_data()
        
        # Evaluate predictions
        logger.info("\nEvaluating predictions...")
        evaluation_metrics = pipeline.evaluate_predictions(actual_data, predictions)
        
        # Save metrics
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        metrics_file = f"metrics/evaluation_metrics_{timestamp}.json"
        with open(metrics_file, 'w') as f:
            json.dump(evaluation_metrics, f, indent=4)
        logger.info(f"Metrics saved to {metrics_file}")
        
        # Display evaluation metrics
        logger.info("\nEvaluation Metrics:")
        logger.info(f"Mean Squared Error: {evaluation_metrics['mse']:.2f}")
        logger.info(f"Mean Absolute Error: {evaluation_metrics['mae']:.2f}")
        logger.info(f"R² Score: {evaluation_metrics['r2']:.2f}")
        
        # Display district-wise metrics
        logger.info("\nDistrict-wise Metrics:")
        for district, metrics in evaluation_metrics['district_metrics'].items():
            logger.info(f"{district}: MAE={metrics['mae']:.2f}, R²={metrics['r2']:.2f}")
        
    except Exception as e:
        logger.error(f"Pipeline execution failed: {str(e)}")
        raise

if __name__ == '__main__':
    main() 
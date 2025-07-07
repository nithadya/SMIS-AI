"""
Pipeline orchestrator for student registration prediction.
"""
import pandas as pd
from typing import Dict, Optional
import logging
from data_handler import DataHandler
from model import RegistrationPredictor
from config import PREDICTION_CONFIG

class PredictionPipeline:
    """Orchestrates the end-to-end prediction pipeline."""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize pipeline components.
        
        Args:
            model_path: Path to saved model file (optional)
        """
        self.data_handler = DataHandler()
        self.predictor = RegistrationPredictor()
        self.model_path = model_path
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def train_pipeline(self, use_synthetic: bool = True) -> Dict:
        """
        Train the complete prediction pipeline.
        
        Args:
            use_synthetic: Whether to use synthetic data
            
        Returns:
            Dict containing training metrics and feature importance
        """
        try:
            self.logger.info("Starting pipeline training...")
            
            # Generate or load training data
            raw_data = self.data_handler.generate_synthetic_data()
            
            # Preprocess data
            self.logger.info("Preprocessing data...")
            processed_data = self.data_handler.preprocess_data(raw_data)
            
            # Prepare features
            X = processed_data.drop(['registrations', 'date'], axis=1)
            y = processed_data['registrations']
            
            # Train model
            self.logger.info("Training model...")
            metrics = self.predictor.train(X, y)
            
            # Save model if path specified
            if self.model_path:
                self.logger.info(f"Saving model to {self.model_path}")
                self.predictor.save_model(self.model_path)
            
            self.logger.info("Pipeline training completed successfully!")
            return {
                'metrics': metrics,
                'feature_importance': self.predictor.get_feature_importance(),
                'data_shape': X.shape
            }
            
        except Exception as e:
            self.logger.error(f"Pipeline training failed: {str(e)}")
            raise
    
    def predict_pipeline(self, months_ahead: int = PREDICTION_CONFIG['prediction_horizon']) -> pd.DataFrame:
        """
        Generate predictions for future months.
        
        Args:
            months_ahead: Number of months to predict
            
        Returns:
            DataFrame with predictions and confidence scores
        """
        try:
            self.logger.info(f"Generating predictions for {months_ahead} months...")
            
            # Load model if necessary
            if self.model_path and not self.predictor.is_trained:
                self.logger.info(f"Loading model from {self.model_path}")
                self.predictor = RegistrationPredictor.load_model(self.model_path)
            
            # Generate and process current data
            current_data = self.data_handler.generate_synthetic_data()
            processed_data = self.data_handler.preprocess_data(current_data)
            
            # Generate predictions
            X_pred = processed_data.drop(['registrations', 'date'], axis=1)
            predictions, confidence = self.predictor.predict(X_pred)
            
            # Create results DataFrame
            results = pd.DataFrame({
                'date': processed_data['date'],
                'district': processed_data['district'],  # This is still encoded
                'predicted_registrations': predictions,
                'confidence_score': confidence
            })
            
            # Decode district labels back to original names
            if 'district' in self.data_handler.label_encoders:
                results['district'] = self.data_handler.label_encoders['district'].inverse_transform(
                    results['district'].astype(int)
                )
            
            # Filter by confidence threshold
            confident_predictions = results[
                results['confidence_score'] >= PREDICTION_CONFIG['confidence_threshold']
            ]
            
            self.logger.info("Predictions generated successfully!")
            return confident_predictions
            
        except Exception as e:
            self.logger.error(f"Prediction generation failed: {str(e)}")
            raise
    
    def evaluate_predictions(self, actual_data: pd.DataFrame, predictions: pd.DataFrame) -> Dict:
        """
        Evaluate prediction accuracy.
        
        Args:
            actual_data: DataFrame with actual values
            predictions: DataFrame with predicted values
            
        Returns:
            Dict containing evaluation metrics
        """
        try:
            self.logger.info("Evaluating predictions...")
            
            # Merge actual and predicted data
            evaluation_df = actual_data.merge(
                predictions[['date', 'district', 'predicted_registrations']],
                on=['date', 'district'],
                how='inner'
            )
            
            # Calculate overall metrics
            from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
            
            metrics = {
                'mse': mean_squared_error(
                    evaluation_df['registrations'],
                    evaluation_df['predicted_registrations']
                ),
                'mae': mean_absolute_error(
                    evaluation_df['registrations'],
                    evaluation_df['predicted_registrations']
                ),
                'r2': r2_score(
                    evaluation_df['registrations'],
                    evaluation_df['predicted_registrations']
                )
            }
            
            # Calculate district-wise metrics
            district_metrics = {}
            for district in evaluation_df['district'].unique():
                district_data = evaluation_df[evaluation_df['district'] == district]
                district_metrics[district] = {
                    'mae': mean_absolute_error(
                        district_data['registrations'],
                        district_data['predicted_registrations']
                    ),
                    'r2': r2_score(
                        district_data['registrations'],
                        district_data['predicted_registrations']
                    )
                }
            
            metrics['district_metrics'] = district_metrics
            
            self.logger.info("Evaluation completed successfully!")
            return metrics
            
        except Exception as e:
            self.logger.error(f"Evaluation failed: {str(e)}")
            raise 
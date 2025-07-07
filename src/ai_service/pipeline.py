"""
Pipeline orchestrator for the AI prediction service.
"""
import pandas as pd
from typing import Dict, Optional
from datetime import datetime
import os
import logging
from .data_handler import DataHandler
from .model import RegistrationPredictor
from .config import PREDICTION_CONFIG
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

class PredictionPipeline:
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the prediction pipeline.
        
        Args:
            model_path: Path to a saved model file. If None, a new model will be trained.
        """
        self.data_handler = DataHandler()
        self.predictor = RegistrationPredictor()
        self.model_path = model_path
        
        # Set up logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
    def train_pipeline(self, use_synthetic: bool = True) -> Dict:
        """
        Train the complete pipeline using either real or synthetic data.
        
        Args:
            use_synthetic: Whether to use synthetic data for training.
            
        Returns:
            Dict containing training metrics.
        """
        try:
            self.logger.info("Starting pipeline training...")
            
            # Generate or load data
            if use_synthetic:
                self.logger.info("Generating synthetic data...")
                raw_data = self.data_handler.generate_synthetic_data()
            else:
                # TODO: Implement real data loading from Supabase
                raise NotImplementedError("Real data loading not yet implemented")
            
            # Preprocess data
            self.logger.info("Preprocessing data...")
            processed_data = self.data_handler.preprocess_data(raw_data)
            
            # Prepare features and target
            X = processed_data.drop(['registrations', 'date'], axis=1)
            y = processed_data['registrations']
            
            # Train model
            self.logger.info("Training model...")
            metrics = self.predictor.train(X, y)
            
            # Save model if path is specified
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
            self.logger.error(f"Error in pipeline training: {str(e)}")
            raise
            
    def predict_pipeline(self, months_ahead: int = PREDICTION_CONFIG['prediction_horizon']) -> pd.DataFrame:
        """
        Generate predictions for future months.
        
        Args:
            months_ahead: Number of months to predict ahead.
            
        Returns:
            DataFrame containing predictions and confidence scores.
        """
        try:
            self.logger.info(f"Generating predictions for {months_ahead} months ahead...")
            
            # Load model if path is specified and model isn't trained
            if self.model_path and not self.predictor.feature_importance:
                self.logger.info(f"Loading model from {self.model_path}")
                self.predictor.load_model(self.model_path)
            
            # Generate or load current data
            current_data = self.data_handler.generate_synthetic_data()
            processed_data = self.data_handler.preprocess_data(current_data)
            
            # Generate future predictions
            predictions_df = self.predictor.predict_future(
                processed_data,
                months_ahead=months_ahead
            )
            
            # Filter predictions based on confidence threshold
            confident_predictions = predictions_df[
                predictions_df['confidence_score'] >= PREDICTION_CONFIG['confidence_threshold']
            ]
            
            self.logger.info("Predictions generated successfully!")
            return confident_predictions
            
        except Exception as e:
            self.logger.error(f"Error in prediction pipeline: {str(e)}")
            raise
            
    def evaluate_predictions(self, actual_data: pd.DataFrame, predictions: pd.DataFrame) -> Dict:
        """
        Evaluate the accuracy of predictions against actual data.
        
        Args:
            actual_data: DataFrame containing actual registration data.
            predictions: DataFrame containing predicted registration data.
            
        Returns:
            Dict containing evaluation metrics.
        """
        try:
            self.logger.info("Evaluating predictions...")
            
            # Merge actual and predicted data
            evaluation_df = actual_data.merge(
                predictions[['date', 'district', 'predicted_registrations']],
                on=['date', 'district'],
                how='inner'
            )
            
            # Calculate metrics
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
            district_metrics = evaluation_df.groupby('district').apply(
                lambda x: pd.Series({
                    'mae': mean_absolute_error(
                        x['registrations'],
                        x['predicted_registrations']
                    ),
                    'r2': r2_score(
                        x['registrations'],
                        x['predicted_registrations']
                    )
                })
            ).to_dict()
            
            metrics['district_metrics'] = district_metrics
            
            self.logger.info("Prediction evaluation completed!")
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error in prediction evaluation: {str(e)}")
            raise 
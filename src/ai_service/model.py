"""
Model training and prediction module for the AI prediction service.
"""
import numpy as np
import pandas as pd
from typing import Dict, Tuple, List, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
from datetime import datetime, timedelta
from .config import MODEL_CONFIG, PREDICTION_CONFIG

class RegistrationPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            random_state=MODEL_CONFIG['random_state']
        )
        self.feature_importance = None
        self.metrics = None
        
    def train(self, X: pd.DataFrame, y: pd.Series) -> Dict:
        """
        Train the model and evaluate its performance.
        """
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=MODEL_CONFIG['test_size'],
            random_state=MODEL_CONFIG['random_state']
        )
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Get feature importance
        self.feature_importance = dict(zip(X.columns, self.model.feature_importances_))
        
        # Make predictions on test set
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        self.metrics = {
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred)
        }
        
        # Perform cross-validation
        cv_scores = cross_val_score(
            self.model, X, y,
            cv=MODEL_CONFIG['cv_folds'],
            scoring='r2'
        )
        
        self.metrics['cv_mean'] = cv_scores.mean()
        self.metrics['cv_std'] = cv_scores.std()
        
        return self.metrics
    
    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Make predictions and calculate confidence scores.
        """
        # Make predictions
        predictions = self.model.predict(X)
        
        # Calculate confidence scores using prediction intervals
        confidence_scores = self._calculate_confidence_scores(X, predictions)
        
        return predictions, confidence_scores
    
    def _calculate_confidence_scores(self, X: pd.DataFrame, predictions: np.ndarray) -> np.ndarray:
        """
        Calculate confidence scores for predictions.
        This is a simplified version using the standard deviation of predictions
        from individual trees in the random forest.
        """
        # Get predictions from all trees
        tree_predictions = np.array([tree.predict(X) for tree in self.model.estimators_])
        
        # Calculate standard deviation across trees
        std_devs = np.std(tree_predictions, axis=0)
        
        # Convert to confidence scores (inverse relationship with std dev)
        max_std = np.max(std_devs)
        confidence_scores = 1 - (std_devs / max_std)
        
        return confidence_scores
    
    def predict_future(self, X: pd.DataFrame, months_ahead: int = 12) -> pd.DataFrame:
        """
        Generate predictions for future months.
        """
        future_predictions = []
        last_date = X['date'].max()
        
        for i in range(1, months_ahead + 1):
            # Create future date
            future_date = last_date + timedelta(days=30*i)
            
            # Create prediction data for each district
            for district in X['district'].unique():
                # Get latest data for this district
                district_data = X[X['district'] == district].iloc[-1].copy()
                
                # Update temporal features
                district_data['date'] = future_date
                district_data['month'] = future_date.month
                district_data['year'] = future_date.year
                district_data['day_of_week'] = future_date.weekday()
                
                future_predictions.append(district_data)
        
        future_df = pd.DataFrame(future_predictions)
        predictions, confidence_scores = self.predict(future_df.drop(['date', 'registrations'], axis=1))
        
        future_df['predicted_registrations'] = predictions
        future_df['confidence_score'] = confidence_scores
        
        return future_df
    
    def save_model(self, path: str):
        """Save the trained model to disk."""
        joblib.dump({
            'model': self.model,
            'feature_importance': self.feature_importance,
            'metrics': self.metrics
        }, path)
    
    def load_model(self, path: str):
        """Load a trained model from disk."""
        model_data = joblib.load(path)
        self.model = model_data['model']
        self.feature_importance = model_data['feature_importance']
        self.metrics = model_data['metrics']
        
    def get_feature_importance(self) -> Dict[str, float]:
        """Return feature importance scores."""
        return self.feature_importance if self.feature_importance else {} 
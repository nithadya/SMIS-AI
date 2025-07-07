"""
Machine learning model for student registration prediction.
Implements district-specific RandomForest regressors with confidence scoring.
"""
import numpy as np
import pandas as pd
from typing import Dict, Tuple, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.feature_selection import SelectFromModel
import joblib
from config import MODEL_CONFIG, SL_DISTRICTS

class RegistrationPredictor:
    """Predicts student registrations using district-specific RandomForest models."""
    
    def __init__(self):
        self.models: Dict[str, RandomForestRegressor] = {
            district: RandomForestRegressor(**MODEL_CONFIG['model_params'])
            for district in SL_DISTRICTS
        }
        self.feature_importance: Dict[str, Dict[str, float]] = {}
        self.is_trained: bool = False
        self.cv_scores: Dict[str, Dict[str, float]] = {}
        self.selected_features: Dict[str, list] = {}
        
    def train(self, X: pd.DataFrame, y: pd.Series) -> Dict:
        """
        Train district-specific models and compute performance metrics.
        
        Args:
            X: Feature matrix
            y: Target variable
            
        Returns:
            Dict with performance metrics
        """
        overall_metrics = {
            'district_metrics': {},
            'overall_mae': [],
            'overall_r2': [],
            'feature_importance': {}
        }
        
        # Train separate model for each district
        for district in SL_DISTRICTS:
            # Get district-specific data
            district_mask = X['district'] == self.get_district_code(district)
            X_district = X[district_mask].drop('district', axis=1)
            y_district = y[district_mask]
            
            if len(X_district) < 10:  # Skip if too few samples
                continue
                
            # Feature selection
            selector = SelectFromModel(
                RandomForestRegressor(**MODEL_CONFIG['model_params']),
                prefit=False,
                threshold='mean'
            )
            selector.fit(X_district, y_district)
            selected_features = X_district.columns[selector.get_support()].tolist()
            self.selected_features[district] = selected_features
            
            # Use selected features
            X_district = X_district[selected_features]
            
            # Cross-validation
            cv_mae = -cross_val_score(
                self.models[district], X_district, y_district,
                scoring='neg_mean_absolute_error',
                cv=5
            )
            cv_r2 = cross_val_score(
                self.models[district], X_district, y_district,
                scoring='r2',
                cv=5
            )
            
            self.cv_scores[district] = {
                'cv_mae_mean': cv_mae.mean(),
                'cv_mae_std': cv_mae.std(),
                'cv_r2_mean': cv_r2.mean(),
                'cv_r2_std': cv_r2.std()
            }
            
            # Train final model
        X_train, X_test, y_train, y_test = train_test_split(
                X_district, y_district,
            test_size=MODEL_CONFIG['test_size'],
            random_state=MODEL_CONFIG['random_state']
        )
        
            self.models[district].fit(X_train, y_train)
            y_pred = self.models[district].predict(X_test)
        
            # Store feature importance
            self.feature_importance[district] = dict(
                zip(selected_features, self.models[district].feature_importances_)
            )
        
        # Calculate metrics
            district_metrics = {
            'mse': mean_squared_error(y_test, y_pred),
                'mae': mean_absolute_error(y_test, y_pred),
                'r2': r2_score(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                'cv_scores': self.cv_scores[district],
                'selected_features': selected_features,
                'top_features': dict(sorted(
                    self.feature_importance[district].items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:5])  # Top 5 features
            }
            
            overall_metrics['district_metrics'][district] = district_metrics
            overall_metrics['overall_mae'].append(district_metrics['mae'])
            overall_metrics['overall_r2'].append(district_metrics['r2'])
        
        self.is_trained = True
        
        # Calculate overall metrics
        overall_metrics['mae'] = np.mean(overall_metrics['overall_mae'])
        overall_metrics['r2'] = np.mean(overall_metrics['overall_r2'])
        
        return overall_metrics
    
    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate predictions with confidence scores using district-specific models.
        
        Args:
            X: Feature matrix
            
        Returns:
            Tuple of (predictions, confidence_scores)
        """
        if not self.is_trained:
            raise ValueError("Models must be trained before prediction")
        
        predictions = np.zeros(len(X))
        confidence_scores = np.zeros(len(X))
        
        for district in SL_DISTRICTS:
            district_mask = X['district'] == self.get_district_code(district)
            if not any(district_mask):
                continue
                
            X_district = X[district_mask].drop('district', axis=1)
            
            # Use selected features
            if district in self.selected_features:
                X_district = X_district[self.selected_features[district]]
            
            # Generate predictions from all trees
            tree_preds = np.array([
                tree.predict(X_district)
                for tree in self.models[district].estimators_
            ])
        
            # Calculate mean prediction and standard deviation
            district_predictions = np.mean(tree_preds, axis=0)
            tree_std = np.std(tree_preds, axis=0)
            
            # Calculate relative uncertainty
            relative_uncertainty = tree_std / (np.abs(district_predictions) + 1e-6)
            district_confidence = 1.0 / (1.0 + 2.0 * relative_uncertainty)
            
            # Store predictions and confidence scores
            predictions[district_mask] = district_predictions
            confidence_scores[district_mask] = district_confidence
        
        return predictions, confidence_scores
    
    def get_district_code(self, district: str) -> Optional[int]:
        """Get encoded district value."""
        try:
            return SL_DISTRICTS.index(district)
        except ValueError:
            return None
    
    def save_model(self, path: str) -> None:
        """Save models to disk."""
        if not self.is_trained:
            raise ValueError("Cannot save untrained models")
        joblib.dump(self, path)
    
    @staticmethod
    def load_model(path: str) -> 'RegistrationPredictor':
        """Load models from disk."""
        return joblib.load(path)
    
    def get_feature_importance(self) -> Dict[str, Dict[str, float]]:
        """Get feature importance scores for each district."""
        if not self.is_trained:
            return {}
        return self.feature_importance 
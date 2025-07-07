"""
Data handling and preprocessing for student registration prediction.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from sklearn.preprocessing import LabelEncoder
from config import CATEGORICAL_FEATURES, NUMERICAL_FEATURES, SL_DISTRICTS

class DataHandler:
    """Handles data preprocessing and feature engineering for registration prediction."""
    
    def __init__(self):
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.district_stats: Dict[str, Dict] = {}
        
    def generate_synthetic_data(self, start_date: str, end_date: str) -> pd.DataFrame:
        """
        Generate synthetic registration data with realistic patterns.
        
        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            
        Returns:
            DataFrame with synthetic registration data
        """
        # Generate date range
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # District-specific parameters
        district_params = {
            district: {
                'base_registrations': np.random.uniform(50, 150),
                'growth_rate': np.random.uniform(0.001, 0.003),
                'seasonality_amplitude': np.random.uniform(10, 30),
                'weekend_effect': np.random.uniform(-0.2, -0.1),
                'campaign_frequency': np.random.randint(30, 90),
                'campaign_boost': np.random.uniform(1.2, 1.5)
            }
            for district in SL_DISTRICTS
        }
        
        # Initialize lists for DataFrame
        records = []
        
        for district in SL_DISTRICTS:
            params = district_params[district]
            
            for date in dates:
                # Base trend with growth
                days_since_start = (date - pd.Timestamp(start_date)).days
                base = params['base_registrations'] * (1 + params['growth_rate'] * days_since_start)
                
                # Seasonal effect (yearly)
                day_of_year = date.dayofyear
                seasonal = params['seasonality_amplitude'] * np.sin(2 * np.pi * day_of_year / 365)
                
                # Monthly pattern (higher registrations at month start/end)
                day_of_month = date.day
                days_in_month = pd.Timestamp(date.year, date.month % 12 + 1, 1) - pd.Timestamp(date.year, date.month, 1)
                monthly = 10 * (np.exp(-0.3 * day_of_month) + np.exp(-0.3 * (days_in_month.days - day_of_month)))
                
                # Weekend effect
                is_weekend = 1 if date.weekday() >= 5 else 0
                weekend_factor = 1 + (params['weekend_effect'] * is_weekend)
                
                # Campaign effect
                campaign_days = np.arange(len(dates))
                campaign_effect = np.where(
                    campaign_days % params['campaign_frequency'] < 7,
                    params['campaign_boost'],
                    1.0
                )[days_since_start]
                
                # Special events (random spikes)
                special_event = np.random.choice(
                    [1.0, 1.5, 2.0],
                    p=[0.97, 0.02, 0.01]
                )
                
                # Calculate final registrations
                registrations = (base + seasonal + monthly) * weekend_factor * campaign_effect * special_event
                
                # Add noise (proportional to value)
                noise = np.random.normal(0, 0.1 * registrations)
                registrations = max(0, registrations + noise)
                
                # Create record
                record = {
                    'date': date,
                    'district': district,
                    'registrations': round(registrations),
                    'is_weekend': is_weekend,
                    'day_of_week': date.weekday(),
                    'day_of_month': day_of_month,
                    'month': date.month,
                    'quarter': (date.month - 1) // 3 + 1,
                    'year': date.year,
                    'is_month_start': date.is_month_start,
                    'is_month_end': date.is_month_end,
                    'days_to_month_end': days_in_month.days - day_of_month,
                    'is_campaign_active': 1 if campaign_effect > 1 else 0
                }
                records.append(record)
        
        df = pd.DataFrame(records)
        
        # Add rolling statistics
        for district in SL_DISTRICTS:
            mask = df['district'] == district
            df.loc[mask, 'rolling_mean_7d'] = df.loc[mask, 'registrations'].rolling(7, min_periods=1).mean()
            df.loc[mask, 'rolling_std_7d'] = df.loc[mask, 'registrations'].rolling(7, min_periods=1).std()
            df.loc[mask, 'rolling_mean_30d'] = df.loc[mask, 'registrations'].rolling(30, min_periods=1).mean()
            df.loc[mask, 'rolling_std_30d'] = df.loc[mask, 'registrations'].rolling(30, min_periods=1).std()
        
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Preprocess data for model training.
        
        Args:
            df: Raw DataFrame
            
        Returns:
            Tuple of (features_df, target_series)
        """
        # Create copy to avoid modifying original
        df = df.copy()
        
        # Store district statistics
        for district in df['district'].unique():
            district_data = df[df['district'] == district]
            self.district_stats[district] = {
                'mean': district_data['registrations'].mean(),
                'std': district_data['registrations'].std(),
                'min': district_data['registrations'].min(),
                'max': district_data['registrations'].max()
            }
        
        # Encode categorical variables
        for feature in CATEGORICAL_FEATURES:
            if feature not in self.label_encoders:
                self.label_encoders[feature] = LabelEncoder()
            df[feature] = self.label_encoders[feature].fit_transform(df[feature])
        
        # Extract target
        target = df['registrations']
        features = df.drop('registrations', axis=1)
        
        return features, target
    
    def prepare_prediction_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare data for prediction.
        
        Args:
            df: Raw DataFrame
            
        Returns:
            Preprocessed DataFrame ready for prediction
        """
        df = df.copy()
        
        # Encode categorical variables
        for feature in CATEGORICAL_FEATURES:
            if feature in self.label_encoders:
                df[feature] = self.label_encoders[feature].transform(df[feature])
            else:
                raise ValueError(f"Label encoder not fitted for feature: {feature}")
        
        return df
    
    def inverse_transform_predictions(self, predictions: np.ndarray) -> np.ndarray:
        """Round predictions to nearest integer and ensure non-negative."""
        return np.maximum(0, np.round(predictions))
    
    def get_district_stats(self) -> Dict[str, Dict]:
        """Get statistics for each district."""
        return self.district_stats 
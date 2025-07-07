"""
Data collection and preprocessing module for the AI prediction service.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from sklearn.preprocessing import LabelEncoder, StandardScaler
from .config import (
    SL_DISTRICTS,
    SYNTHETIC_DATA_CONFIG,
    TEMPORAL_FEATURES,
    SPATIAL_FEATURES,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES
)

class DataHandler:
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        
    def generate_synthetic_data(self) -> pd.DataFrame:
        """
        Generate synthetic data for model training when real data is insufficient.
        """
        data = []
        current_date = SYNTHETIC_DATA_CONFIG['start_date']
        end_date = SYNTHETIC_DATA_CONFIG['end_date']
        
        while current_date <= end_date:
            for district in SL_DISTRICTS:
                # Base registrations
                base_registrations = np.random.randint(
                    SYNTHETIC_DATA_CONFIG['min_registrations'],
                    SYNTHETIC_DATA_CONFIG['max_registrations']
                )
                
                # Apply seasonal factors
                seasonal_factor = SYNTHETIC_DATA_CONFIG['seasonal_factors'][current_date.month]
                registrations = int(base_registrations * seasonal_factor)
                
                # Add random noise
                noise = np.random.normal(0, 5)
                registrations = max(0, int(registrations + noise))
                
                data.append({
                    'date': current_date,
                    'district': district,
                    'registrations': registrations,
                    'month': current_date.month,
                    'year': current_date.year,
                    'day_of_week': current_date.weekday(),
                    'is_holiday': self._is_holiday(current_date),
                    'program_type': np.random.choice(['Diploma', 'Certificate', 'Degree']),
                    'school_type': np.random.choice(['Public', 'Private', 'International']),
                    'historical_registrations': max(0, registrations + np.random.normal(0, 3)),
                    'campaign_count': np.random.randint(0, 5)
                })
            
            current_date += timedelta(days=1)
        
        return pd.DataFrame(data)
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Optional[pd.DataFrame]]:
        """
        Preprocess the data for model training.
        """
        # Create copy to avoid modifying original data
        df_processed = df.copy()
        
        # Handle missing values
        df_processed = self._handle_missing_values(df_processed)
        
        # Feature engineering
        df_processed = self._engineer_features(df_processed)
        
        # Encode categorical variables
        df_processed = self._encode_categorical_features(df_processed)
        
        # Scale numerical features
        df_processed = self._scale_numerical_features(df_processed)
        
        return df_processed
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in the dataset."""
        # Fill numerical missing values with median
        numerical_columns = df.select_dtypes(include=['int64', 'float64']).columns
        df[numerical_columns] = df[numerical_columns].fillna(df[numerical_columns].median())
        
        # Fill categorical missing values with mode
        categorical_columns = df.select_dtypes(include=['object']).columns
        df[categorical_columns] = df[categorical_columns].fillna(df[categorical_columns].mode().iloc[0])
        
        return df
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer additional features from existing data."""
        if 'date' in df.columns:
            df['month'] = df['date'].dt.month
            df['year'] = df['date'].dt.year
            df['day_of_week'] = df['date'].dt.dayofweek
            df['is_holiday'] = df['date'].apply(self._is_holiday)
            
        # Add rolling averages for historical data
        if 'registrations' in df.columns:
            df['rolling_avg_3m'] = df.groupby('district')['registrations'].rolling(window=3).mean().reset_index(0, drop=True)
            df['rolling_avg_6m'] = df.groupby('district')['registrations'].rolling(window=6).mean().reset_index(0, drop=True)
            
        return df
    
    def _encode_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical variables."""
        for feature in CATEGORICAL_FEATURES:
            if feature in df.columns:
                if feature not in self.label_encoders:
                    self.label_encoders[feature] = LabelEncoder()
                df[feature] = self.label_encoders[feature].fit_transform(df[feature])
        return df
    
    def _scale_numerical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Scale numerical features."""
        numerical_features = [col for col in NUMERICAL_FEATURES if col in df.columns]
        if numerical_features:
            df[numerical_features] = self.scaler.fit_transform(df[numerical_features])
        return df
    
    def _is_holiday(self, date: datetime) -> bool:
        """
        Determine if a given date is a holiday.
        This is a simplified version - you should enhance with actual holiday data.
        """
        # Example holiday check (weekends)
        return date.weekday() >= 5
    
    def prepare_prediction_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare data for making predictions.
        """
        df_pred = df.copy()
        df_pred = self._handle_missing_values(df_pred)
        df_pred = self._engineer_features(df_pred)
        df_pred = self._encode_categorical_features(df_pred)
        df_pred = self._scale_numerical_features(df_pred)
        return df_pred 
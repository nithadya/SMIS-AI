import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
import pickle
import warnings
from datetime import datetime, timedelta
import random
import json

warnings.filterwarnings('ignore')

class StudentRegistrationPredictor:
    """
    Professional ML System for Predicting Student Registrations by District in Sri Lanka
    """
    
    def __init__(self):
        # Sri Lankan Districts (All 25 districts)
        self.districts = [
            'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
            'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
            'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
            'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
            'Moneragala', 'Ratnapura', 'Kegalle'
        ]
        
        # District categories for realistic modeling
        self.district_categories = {
            'urban': ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Jaffna'],
            'semi_urban': ['Kalutara', 'Matale', 'Nuwara Eliya', 'Matara', 'Kurunegala', 
                          'Batticaloa', 'Trincomalee', 'Anuradhapura', 'Badulla', 'Ratnapura'],
            'rural': ['Hambantota', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
                     'Ampara', 'Puttalam', 'Polonnaruwa', 'Moneragala', 'Kegalle']
        }
        
        # Program types based on existing data
        self.programs = [
            'Higher Diploma in Computing and Software Engineering',
            'Bachelor of Information Technology',
            'Diploma in Business Administration',
            'Certificate in Digital Marketing',
            'Advanced Diploma in Networking'
        ]
        
        self.model = None
        self.feature_columns = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        
    def generate_synthetic_data(self, years=5, records_per_month=50):
        """
        Generate realistic synthetic data for training the ML model
        """
        print("🔄 Generating synthetic training data...")
        
        data = []
        base_date = datetime(2020, 1, 1)
        
        for year in range(2020, 2020 + years):
            for month in range(1, 13):
                for _ in range(records_per_month):
                    # Select random district with weighted probability
                    district = self._select_weighted_district()
                    
                    # Generate realistic registration patterns
                    registration_data = {
                        'year': year,
                        'month': month,
                        'district': district,
                        'program': random.choice(self.programs),
                        'registration_count': self._generate_registration_count(district, month, year),
                        
                        # Demographic features
                        'population_density': self._get_population_density(district),
                        'urban_index': self._get_urban_index(district),
                        'economic_index': self._get_economic_index(district),
                        
                        # Seasonal features
                        'is_peak_season': 1 if month in [1, 2, 7, 8] else 0,  # Jan-Feb, Jul-Aug
                        'is_holiday_period': 1 if month in [4, 12] else 0,     # April, December
                        'quarter': (month - 1) // 3 + 1,
                        
                        # Educational features
                        'al_results_month': 1 if month in [1, 8] else 0,      # A/L results periods
                        'university_intake': 1 if month in [2, 9] else 0,      # University intake months
                        
                        # External factors
                        'covid_impact': 1 if year in [2020, 2021] else 0,
                        'economic_crisis': 1 if year in [2022, 2023] else 0,
                        
                        # Historical trend
                        'year_normalized': (year - 2020) / 5,  # Normalize year
                        
                        # Competition factors
                        'competition_level': self._get_competition_level(district),
                        'accessibility_score': self._get_accessibility_score(district)
                    }
                    
                    data.append(registration_data)
        
        df = pd.DataFrame(data)
        
        # Add interaction features
        df['district_season_interaction'] = df['district'].astype(str) + '_' + df['month'].astype(str)
        df['urban_population_interaction'] = df['urban_index'] * df['population_density']
        df['economic_seasonal_interaction'] = df['economic_index'] * df['is_peak_season']
        
        print(f"✅ Generated {len(df)} synthetic records")
        print(f"📊 Data shape: {df.shape}")
        print(f"🏛️ Districts covered: {df['district'].nunique()}")
        print(f"📅 Years covered: {df['year'].min()} - {df['year'].max()}")
        
        return df
    
    def _select_weighted_district(self):
        """Select district with realistic probability weights"""
        urban_weight = 0.5
        semi_urban_weight = 0.3
        rural_weight = 0.2
        
        category = np.random.choice(['urban', 'semi_urban', 'rural'], 
                                  p=[urban_weight, semi_urban_weight, rural_weight])
        return random.choice(self.district_categories[category])
    
    def _generate_registration_count(self, district, month, year):
        """Generate realistic registration counts based on district and seasonality"""
        # Base registration by district type
        if district in self.district_categories['urban']:
            base = np.random.poisson(15)  # Higher registrations in urban areas
        elif district in self.district_categories['semi_urban']:
            base = np.random.poisson(8)   # Medium registrations
        else:
            base = np.random.poisson(4)   # Lower registrations in rural areas
        
        # Seasonal multipliers
        seasonal_multiplier = 1.0
        if month in [1, 2]:      # Post A/L results
            seasonal_multiplier = 1.8
        elif month in [7, 8]:    # Mid-year intake
            seasonal_multiplier = 1.5
        elif month in [4, 12]:   # Holiday periods
            seasonal_multiplier = 0.6
        
        # Year-based trends (slight growth over time)
        year_multiplier = 1 + (year - 2020) * 0.05
        
        # COVID impact
        if year in [2020, 2021]:
            year_multiplier *= 0.7
        
        # Economic crisis impact
        if year in [2022, 2023]:
            year_multiplier *= 0.8
        
        final_count = max(0, int(base * seasonal_multiplier * year_multiplier))
        return final_count
    
    def _get_population_density(self, district):
        """Get normalized population density score"""
        density_map = {
            'Colombo': 0.95, 'Gampaha': 0.85, 'Kalutara': 0.65, 'Kandy': 0.75,
            'Matale': 0.45, 'Nuwara Eliya': 0.40, 'Galle': 0.70, 'Matara': 0.60,
            'Hambantota': 0.30, 'Jaffna': 0.65, 'Kilinochchi': 0.25, 'Mannar': 0.20,
            'Vavuniya': 0.25, 'Mullaitivu': 0.15, 'Batticaloa': 0.50, 'Ampara': 0.35,
            'Trincomalee': 0.45, 'Kurunegala': 0.55, 'Puttalam': 0.40, 'Anuradhapura': 0.35,
            'Polonnaruwa': 0.30, 'Badulla': 0.45, 'Moneragala': 0.25, 'Ratnapura': 0.50,
            'Kegalle': 0.45
        }
        return density_map.get(district, 0.5)
    
    def _get_urban_index(self, district):
        """Get urban development index"""
        if district in self.district_categories['urban']:
            return np.random.uniform(0.7, 1.0)
        elif district in self.district_categories['semi_urban']:
            return np.random.uniform(0.4, 0.7)
        else:
            return np.random.uniform(0.1, 0.4)
    
    def _get_economic_index(self, district):
        """Get economic development index"""
        economic_map = {
            'Colombo': 0.90, 'Gampaha': 0.80, 'Kalutara': 0.70, 'Kandy': 0.75,
            'Galle': 0.70, 'Jaffna': 0.60, 'Kurunegala': 0.55, 'Batticaloa': 0.45,
            'Matara': 0.60, 'Anuradhapura': 0.50, 'Badulla': 0.50, 'Ratnapura': 0.55
        }
        base_value = economic_map.get(district, 0.45)
        return base_value + np.random.uniform(-0.05, 0.05)  # Add some variance
    
    def _get_competition_level(self, district):
        """Get competition level from other institutions"""
        if district in self.district_categories['urban']:
            return np.random.uniform(0.7, 1.0)  # High competition
        elif district in self.district_categories['semi_urban']:
            return np.random.uniform(0.4, 0.7)  # Medium competition
        else:
            return np.random.uniform(0.1, 0.4)  # Low competition
    
    def _get_accessibility_score(self, district):
        """Get accessibility score (transport, infrastructure)"""
        accessibility_map = {
            'Colombo': 0.95, 'Gampaha': 0.90, 'Kandy': 0.85, 'Galle': 0.80,
            'Kalutara': 0.75, 'Matara': 0.70, 'Kurunegala': 0.65, 'Jaffna': 0.60,
            'Batticaloa': 0.55, 'Anuradhapura': 0.50, 'Trincomalee': 0.45
        }
        return accessibility_map.get(district, 0.40)
    
    def prepare_features(self, df):
        """Prepare features for machine learning"""
        print("🔧 Preparing features for ML model...")
        
        # Create a copy to avoid modifying original data
        df_processed = df.copy()
        
        # Encode categorical variables
        categorical_columns = ['district', 'program', 'district_season_interaction']
        
        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df_processed[col + '_encoded'] = self.label_encoders[col].fit_transform(df_processed[col])
            else:
                # Handle new categories in test data
                df_processed[col + '_encoded'] = df_processed[col].apply(
                    lambda x: self.label_encoders[col].transform([x])[0] 
                    if x in self.label_encoders[col].classes_ else -1
                )
        
        # Select feature columns
        feature_columns = [
            'year', 'month', 'quarter', 'year_normalized',
            'district_encoded', 'program_encoded', 'district_season_interaction_encoded',
            'population_density', 'urban_index', 'economic_index',
            'is_peak_season', 'is_holiday_period', 'al_results_month', 'university_intake',
            'covid_impact', 'economic_crisis', 'competition_level', 'accessibility_score',
            'urban_population_interaction', 'economic_seasonal_interaction'
        ]
        
        self.feature_columns = feature_columns
        
        # Prepare feature matrix
        X = df_processed[feature_columns]
        y = df_processed['registration_count']
        
        print(f"✅ Features prepared: {len(feature_columns)} features")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y
    
    def train_model(self, X, y):
        """Train Random Forest model with hyperparameter optimization"""
        print("🚀 Training Random Forest model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=None
        )
        
        # Hyperparameter tuning
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'max_features': ['sqrt', 'log2', None]
        }
        
        # Initial model for quick tuning
        rf_base = RandomForestRegressor(random_state=42, n_jobs=-1)
        
        print("🔍 Performing hyperparameter optimization...")
        grid_search = GridSearchCV(
            rf_base, param_grid, cv=5, scoring='neg_mean_absolute_error',
            n_jobs=-1, verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Best model
        self.model = grid_search.best_estimator_
        
        print(f"✅ Best parameters: {grid_search.best_params_}")
        
        # Evaluate model
        self.evaluate_model(X_test, y_test, X_train, y_train)
        
        return X_train, X_test, y_train, y_test
    
    def evaluate_model(self, X_test, y_test, X_train, y_train):
        """Comprehensive model evaluation"""
        print("\n📊 MODEL EVALUATION RESULTS")
        print("=" * 50)
        
        # Predictions
        y_train_pred = self.model.predict(X_train)
        y_test_pred = self.model.predict(X_test)
        
        # Training metrics
        train_mae = mean_absolute_error(y_train, y_train_pred)
        train_mse = mean_squared_error(y_train, y_train_pred)
        train_r2 = r2_score(y_train, y_train_pred)
        
        # Testing metrics
        test_mae = mean_absolute_error(y_test, y_test_pred)
        test_mse = mean_squared_error(y_test, y_test_pred)
        test_r2 = r2_score(y_test, y_test_pred)
        
        print(f"📈 TRAINING SET PERFORMANCE:")
        print(f"   MAE: {train_mae:.3f}")
        print(f"   MSE: {train_mse:.3f}")
        print(f"   RMSE: {np.sqrt(train_mse):.3f}")
        print(f"   R²: {train_r2:.3f}")
        
        print(f"\n🎯 TESTING SET PERFORMANCE:")
        print(f"   MAE: {test_mae:.3f}")
        print(f"   MSE: {test_mse:.3f}")
        print(f"   RMSE: {np.sqrt(test_mse):.3f}")
        print(f"   R²: {test_r2:.3f}")
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_test, y_test, cv=5, scoring='neg_mean_absolute_error')
        print(f"\n🔄 CROSS-VALIDATION (5-fold):")
        print(f"   Mean MAE: {-cv_scores.mean():.3f} (±{cv_scores.std():.3f})")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🏆 TOP 10 MOST IMPORTANT FEATURES:")
        for i, (idx, row) in enumerate(feature_importance.head(10).iterrows()):
            print(f"   {i+1:2d}. {row['feature']:<30} {row['importance']:.4f}")
        
        # Model performance assessment
        if test_r2 > 0.8:
            print(f"\n✅ EXCELLENT MODEL PERFORMANCE (R² = {test_r2:.3f})")
        elif test_r2 > 0.6:
            print(f"\n👍 GOOD MODEL PERFORMANCE (R² = {test_r2:.3f})")
        elif test_r2 > 0.4:
            print(f"\n⚠️  MODERATE MODEL PERFORMANCE (R² = {test_r2:.3f})")
        else:
            print(f"\n❌ POOR MODEL PERFORMANCE (R² = {test_r2:.3f})")
        
        return {
            'train_mae': train_mae, 'test_mae': test_mae,
            'train_r2': train_r2, 'test_r2': test_r2,
            'cv_mae_mean': -cv_scores.mean(),
            'feature_importance': feature_importance
        }
    
    def predict_registrations(self, year=None, month=None):
        """
        Predict registrations for all districts for given year/month
        """
        if not self.model:
            raise ValueError("Model not trained yet. Please train the model first.")
        
        # Default to next year if not specified
        if year is None:
            year = datetime.now().year + 1
        
        predictions = []
        
        # If month is specified, predict for that month only
        if month is not None:
            months_to_predict = [month]
        else:
            # Predict for all months of the year
            months_to_predict = list(range(1, 13))
        
        for month_pred in months_to_predict:
            for district in self.districts:
                for program in self.programs:
                    # Create feature vector
                    features = {
                        'year': year,
                        'month': month_pred,
                        'quarter': (month_pred - 1) // 3 + 1,
                        'year_normalized': (year - 2020) / 5,
                        'district': district,
                        'program': program,
                        'district_season_interaction': f"{district}_{month_pred}",
                        'population_density': self._get_population_density(district),
                        'urban_index': self._get_urban_index(district),
                        'economic_index': self._get_economic_index(district),
                        'is_peak_season': 1 if month_pred in [1, 2, 7, 8] else 0,
                        'is_holiday_period': 1 if month_pred in [4, 12] else 0,
                        'al_results_month': 1 if month_pred in [1, 8] else 0,
                        'university_intake': 1 if month_pred in [2, 9] else 0,
                        'covid_impact': 0,  # Assuming post-COVID era
                        'economic_crisis': 0,  # Assuming recovery
                        'competition_level': self._get_competition_level(district),
                        'accessibility_score': self._get_accessibility_score(district)
                    }
                    
                    # Calculate interaction features
                    features['urban_population_interaction'] = features['urban_index'] * features['population_density']
                    features['economic_seasonal_interaction'] = features['economic_index'] * features['is_peak_season']
                    
                    # Create DataFrame for prediction
                    feature_df = pd.DataFrame([features])
                    
                    # Encode categorical features
                    for col in ['district', 'program', 'district_season_interaction']:
                        if col in self.label_encoders:
                            try:
                                feature_df[col + '_encoded'] = self.label_encoders[col].transform(feature_df[col])
                            except ValueError:
                                # Handle unseen categories
                                feature_df[col + '_encoded'] = -1
                        else:
                            feature_df[col + '_encoded'] = 0
                    
                    # Select features
                    X_pred = feature_df[self.feature_columns]
                    
                    # Make prediction
                    pred_count = self.model.predict(X_pred)[0]
                    pred_count = max(0, int(round(pred_count)))  # Ensure non-negative integer
                    
                    predictions.append({
                        'year': year,
                        'month': month_pred,
                        'district': district,
                        'program': program,
                        'predicted_registrations': pred_count
                    })
        
        # Aggregate by district
        pred_df = pd.DataFrame(predictions)
        district_summary = pred_df.groupby(['year', 'month', 'district'])['predicted_registrations'].sum().reset_index()
        
        return pred_df, district_summary
    
    def save_model(self, filepath='student_registration_model.pkl'):
        """Save trained model and encoders"""
        model_data = {
            'model': self.model,
            'feature_columns': self.feature_columns,
            'label_encoders': self.label_encoders,
            'districts': self.districts,
            'programs': self.programs
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath='student_registration_model.pkl'):
        """Load trained model and encoders"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.feature_columns = model_data['feature_columns']
        self.label_encoders = model_data['label_encoders']
        self.districts = model_data['districts']
        self.programs = model_data['programs']
        
        print(f"✅ Model loaded from {filepath}")


def main():
    """
    Main execution function for training and testing the model
    """
    print("🎓 STUDENT REGISTRATION PREDICTION SYSTEM")
    print("=" * 60)
    print("🇱🇰 Predicting Campus Registrations Across Sri Lankan Districts")
    print("=" * 60)
    
    # Initialize predictor
    predictor = StudentRegistrationPredictor()
    
    # Generate synthetic data
    df = predictor.generate_synthetic_data(years=5, records_per_month=100)
    
    # Prepare features
    X, y = predictor.prepare_features(df)
    
    # Train model
    X_train, X_test, y_train, y_test = predictor.train_model(X, y)
    
    # Save model
    predictor.save_model()
    
    print("\n" + "=" * 60)
    print("🔮 TESTING PREDICTION SYSTEM")
    print("=" * 60)
    
    # Test predictions
    test_year = 2025
    test_month = 12
    
    print(f"\n📊 Predicting registrations for {test_year}-{test_month:02d} (December 2025)")
    detailed_pred, district_summary = predictor.predict_registrations(year=test_year, month=test_month)
    
    print(f"\n🏛️ DISTRICT-WISE PREDICTIONS FOR {test_year}-{test_month:02d}:")
    print("-" * 50)
    
    district_summary_sorted = district_summary.sort_values('predicted_registrations', ascending=False)
    total_predicted = district_summary_sorted['predicted_registrations'].sum()
    
    for idx, row in district_summary_sorted.iterrows():
        percentage = (row['predicted_registrations'] / total_predicted) * 100
        print(f"{row['district']:<15}: {row['predicted_registrations']:3d} registrations ({percentage:5.1f}%)")
    
    print(f"\n📈 TOTAL PREDICTED REGISTRATIONS: {total_predicted}")
    
    # Yearly prediction
    print(f"\n📅 Predicting registrations for entire year {test_year}")
    yearly_pred, yearly_summary = predictor.predict_registrations(year=test_year)
    
    yearly_totals = yearly_summary.groupby('district')['predicted_registrations'].sum().sort_values(ascending=False)
    yearly_total = yearly_totals.sum()
    
    print(f"\n🏛️ DISTRICT-WISE YEARLY PREDICTIONS FOR {test_year}:")
    print("-" * 50)
    
    for district, count in yearly_totals.head(10).items():
        percentage = (count / yearly_total) * 100
        print(f"{district:<15}: {count:4d} registrations ({percentage:5.1f}%)")
    
    print(f"\n📈 TOTAL YEARLY PREDICTED REGISTRATIONS: {yearly_total}")
    
    # Generate map visualization data
    map_data = {
        'districts': [],
        'predictions': [],
        'percentages': []
    }
    
    for district, count in yearly_totals.items():
        map_data['districts'].append(district)
        map_data['predictions'].append(int(count))
        map_data['percentages'].append(round((count / yearly_total) * 100, 1))
    
    # Save map data for dashboard visualization
    with open('district_predictions_map_data.json', 'w') as f:
        json.dump(map_data, f, indent=2)
    
    print(f"\n💾 Map visualization data saved to 'district_predictions_map_data.json'")
    
    print("\n" + "=" * 60)
    print("✅ PREDICTION SYSTEM READY FOR PRODUCTION!")
    print("=" * 60)


if __name__ == "__main__":
    main()
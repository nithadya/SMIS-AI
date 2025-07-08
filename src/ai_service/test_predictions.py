#!/usr/bin/env python3
"""
🎓 STUDENT REGISTRATION PREDICTION TEST SCRIPT
Simple interface for testing district-wise registration predictions
"""

import sys
import json
import pandas as pd
from datetime import datetime
from student_registration_prediction_system import StudentRegistrationPredictor

def print_banner():
    """Print application banner"""
    print("\n" + "=" * 70)
    print("🎓 CAMPUS REGISTRATION PREDICTION SYSTEM")
    print("🇱🇰 Sri Lankan District-wise Student Registration Forecasting")
    print("=" * 70)

def get_user_input():
    """Get year and month input from user"""
    print("\n📅 Enter prediction parameters:")
    
    # Get year
    while True:
        try:
            year_input = input("\nEnter Year (e.g., 2025) [Press Enter for 2025]: ").strip()
            if year_input == "":
                year = 2025
                break
            year = int(year_input)
            if year < 2020 or year > 2030:
                print("⚠️  Please enter a year between 2020 and 2030")
                continue
            break
        except ValueError:
            print("⚠️  Please enter a valid year (e.g., 2025)")
    
    # Get month (optional)
    while True:
        month_input = input("\nEnter Month (1-12) [Press Enter for yearly prediction]: ").strip()
        if month_input == "":
            month = None
            break
        try:
            month = int(month_input)
            if month < 1 or month > 12:
                print("⚠️  Please enter a month between 1 and 12")
                continue
            break
        except ValueError:
            print("⚠️  Please enter a valid month (1-12)")
    
    return year, month

def load_or_train_model():
    """Load existing model or train new one"""
    predictor = StudentRegistrationPredictor()
    
    try:
        # Try to load existing model
        predictor.load_model()
        print("✅ Loaded existing trained model")
        return predictor
    except FileNotFoundError:
        print("🔄 No existing model found. Training new model...")
        print("⏳ This may take a few minutes...")
        
        # Generate data and train model
        df = predictor.generate_synthetic_data(years=5, records_per_month=100)
        X, y = predictor.prepare_features(df)
        predictor.train_model(X, y)
        predictor.save_model()
        
        print("✅ Model training completed and saved")
        return predictor

def display_predictions(district_summary, year, month=None):
    """Display predictions in a formatted table"""
    
    if month:
        period = f"{year}-{month:02d}"
        print(f"\n🏛️  DISTRICT-WISE PREDICTIONS FOR {period}")
    else:
        period = str(year)
        print(f"\n🏛️  DISTRICT-WISE YEARLY PREDICTIONS FOR {period}")
    
    print("-" * 60)
    print(f"{'District':<20} {'Registrations':<15} {'Percentage':<12}")
    print("-" * 60)
    
    # Sort by predictions (highest first)
    sorted_summary = district_summary.sort_values('predicted_registrations', ascending=False)
    total_predicted = sorted_summary['predicted_registrations'].sum()
    
    # Display each district
    for idx, row in sorted_summary.iterrows():
        district = row['district']
        count = row['predicted_registrations']
        percentage = (count / total_predicted) * 100 if total_predicted > 0 else 0
        
        print(f"{district:<20} {count:<15} {percentage:>5.1f}%")
    
    print("-" * 60)
    print(f"{'TOTAL':<20} {total_predicted:<15} {'100.0%':<12}")
    print("-" * 60)
    
    return total_predicted, sorted_summary

def save_results_for_dashboard(district_summary, year, month=None):
    """Save results in format suitable for dashboard/map visualization"""
    
    # Prepare data for map visualization
    map_data = {
        'prediction_date': datetime.now().isoformat(),
        'prediction_period': {
            'year': year,
            'month': month,
            'period_type': 'monthly' if month else 'yearly'
        },
        'districts': []
    }
    
    total_predicted = district_summary['predicted_registrations'].sum()
    
    for idx, row in district_summary.iterrows():
        district_data = {
            'name': row['district'],
            'predicted_registrations': int(row['predicted_registrations']),
            'percentage': round((row['predicted_registrations'] / total_predicted) * 100, 1) if total_predicted > 0 else 0
        }
        map_data['districts'].append(district_data)
    
    # Sort by predictions (for map color coding)
    map_data['districts'] = sorted(map_data['districts'], 
                                  key=lambda x: x['predicted_registrations'], 
                                  reverse=True)
    
    # Save to JSON file
    filename = f"predictions_{year}"
    if month:
        filename += f"_{month:02d}"
    filename += ".json"
    
    with open(filename, 'w') as f:
        json.dump(map_data, f, indent=2)
    
    print(f"\n💾 Results saved to '{filename}' for dashboard integration")
    return filename

def show_top_districts(district_summary, top_n=5):
    """Show top N districts by predicted registrations"""
    sorted_summary = district_summary.sort_values('predicted_registrations', ascending=False)
    total_predicted = sorted_summary['predicted_registrations'].sum()
    
    print(f"\n🏆 TOP {top_n} DISTRICTS BY PREDICTED REGISTRATIONS:")
    print("-" * 50)
    
    for i, (idx, row) in enumerate(sorted_summary.head(top_n).iterrows()):
        rank = i + 1
        district = row['district']
        count = row['predicted_registrations']
        percentage = (count / total_predicted) * 100 if total_predicted > 0 else 0
        
        print(f"{rank:2d}. {district:<15}: {count:4d} ({percentage:5.1f}%)")

def show_regional_analysis(district_summary):
    """Show analysis by regional categories"""
    
    # Define regional categories
    western = ['Colombo', 'Gampaha', 'Kalutara']
    central = ['Kandy', 'Matale', 'Nuwara Eliya']
    southern = ['Galle', 'Matara', 'Hambantota']
    northern = ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu']
    eastern = ['Batticaloa', 'Ampara', 'Trincomalee']
    north_western = ['Kurunegala', 'Puttalam']
    north_central = ['Anuradhapura', 'Polonnaruwa']
    uva = ['Badulla', 'Moneragala']
    sabaragamuwa = ['Ratnapura', 'Kegalle']
    
    regions = {
        'Western Province': western,
        'Central Province': central,
        'Southern Province': southern,
        'Northern Province': northern,
        'Eastern Province': eastern,
        'North Western Province': north_western,
        'North Central Province': north_central,
        'Uva Province': uva,
        'Sabaragamuwa Province': sabaragamuwa
    }
    
    total_predicted = district_summary['predicted_registrations'].sum()
    
    print(f"\n🗺️  REGIONAL ANALYSIS:")
    print("-" * 50)
    
    regional_totals = []
    
    for region_name, districts in regions.items():
        region_total = district_summary[
            district_summary['district'].isin(districts)
        ]['predicted_registrations'].sum()
        
        percentage = (region_total / total_predicted) * 100 if total_predicted > 0 else 0
        regional_totals.append((region_name, region_total, percentage))
    
    # Sort by total predictions
    regional_totals.sort(key=lambda x: x[1], reverse=True)
    
    for region_name, total, percentage in regional_totals:
        print(f"{region_name:<25}: {total:4d} ({percentage:5.1f}%)")

def main():
    """Main execution function"""
    print_banner()
    
    try:
        # Load or train model
        predictor = load_or_train_model()
        
        while True:
            # Get user input
            year, month = get_user_input()
            
            print(f"\n🔮 Generating predictions for {year}" + (f"-{month:02d}" if month else "") + "...")
            print("⏳ Processing...")
            
            # Generate predictions
            detailed_pred, district_summary = predictor.predict_registrations(year=year, month=month)
            
            # Display results
            total_predicted, sorted_summary = display_predictions(district_summary, year, month)
            
            # Show additional analysis
            show_top_districts(district_summary, top_n=5)
            show_regional_analysis(district_summary)
            
            # Save results
            saved_file = save_results_for_dashboard(district_summary, year, month)
            
            # Summary statistics
            print(f"\n📊 SUMMARY STATISTICS:")
            print(f"   Total Predicted Registrations: {total_predicted}")
            print(f"   Average per District: {total_predicted / len(district_summary):.1f}")
            print(f"   Highest District: {sorted_summary.iloc[0]['district']} ({sorted_summary.iloc[0]['predicted_registrations']} registrations)")
            print(f"   Lowest District: {sorted_summary.iloc[-1]['district']} ({sorted_summary.iloc[-1]['predicted_registrations']} registrations)")
            
            # Ask for another prediction
            print(f"\n🔄 Would you like to make another prediction?")
            continue_choice = input("Enter 'y' for yes, any other key to exit: ").lower().strip()
            
            if continue_choice != 'y':
                break
        
        print(f"\n✅ Thank you for using the Student Registration Prediction System!")
        print(f"🗺️  Use the generated JSON files for map visualization in your dashboard.")
        
    except KeyboardInterrupt:
        print(f"\n\n⚠️  Process interrupted by user. Exiting...")
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        print(f"Please check your input and try again.")

if __name__ == "__main__":
    main() 
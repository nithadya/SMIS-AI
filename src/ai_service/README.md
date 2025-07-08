# 🤖 AI Service - Student Registration Prediction System

## 📋 Overview

This folder contains the complete Machine Learning pipeline for predicting student registrations across all 25 Sri Lankan districts. The system provides intelligent forecasting capabilities for campus management and strategic planning.

## 📁 Files

### Core System Files

- **`student_registration_prediction_system.py`** - Main ML system with Random Forest model
- **`test_predictions.py`** - Interactive testing interface for managers
- **`__init__.py`** - Package initialization file
- **`requirements.txt`** - All Python dependencies

### Documentation

- **`ML_PREDICTION_SYSTEM_DOCUMENTATION.md`** - Comprehensive technical documentation
- **`README.md`** - This file

### Generated Files (created after training)

- **`student_registration_model.pkl`** - Trained ML model
- **`predictions_*.json`** - Prediction outputs for dashboard integration

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd src/ai_service
pip install -r requirements.txt
```

### 2. Train the Model

```bash
python student_registration_prediction_system.py
```

### 3. Test Predictions

```bash
python test_predictions.py
```

## 🎯 What it Does

- **Predicts student registrations** for any month/year
- **Covers all 25 Sri Lankan districts**
- **Generates map-ready data** for dashboard visualization
- **Provides province-wise analysis**
- **Exports JSON files** for easy integration

## 📊 Model Performance

- **Algorithm**: Random Forest Regressor
- **Features**: 20+ engineered features (geographic, temporal, economic)
- **Training Data**: 30,000+ synthetic records
- **Expected Accuracy**: R² > 0.8 (Excellent)
- **Validation**: 5-fold cross-validation

## 🗺️ Districts Covered

All 25 Sri Lankan districts across 9 provinces:

- Western, Central, Southern, Northern, Eastern
- North Western, North Central, Uva, Sabaragamuwa

## 🎓 Academic Standards

Built with university-level project standards:

- ✅ Professional ML pipeline
- ✅ Comprehensive evaluation metrics
- ✅ Feature importance analysis
- ✅ Cross-validation and testing
- ✅ Production-ready code
- ✅ Complete documentation

## 🔧 Integration

The system outputs JSON files that can be directly integrated into:

- **Map-based dashboards**
- **Business intelligence systems**
- **Management reporting tools**
- **Strategic planning platforms**

## 📞 Support

For detailed technical information, see `ML_PREDICTION_SYSTEM_DOCUMENTATION.md`

---

**🎯 Ready for production use and dashboard integration!**

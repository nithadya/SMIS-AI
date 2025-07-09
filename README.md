# ICBT Student Management Information System with AI Predictions

## Overview

ICBT SMIS is a comprehensive student management system with integrated AI-powered registration predictions. The system combines a modern React frontend with a sophisticated machine learning pipeline to provide accurate student registration forecasts across different districts in Sri Lanka.

## Features

- **Student Registration Prediction**

  - District-wise forecasting
  - Interactive visualization
  - Trend analysis
  - Performance metrics

- **Analytics Dashboard**

  - Interactive Sri Lanka map
  - Real-time data updates
  - Multiple chart types
  - Export capabilities

- **AI Pipeline**
  - Advanced ML models
  - Automated training
  - Performance monitoring
  - Data validation

## Technology Stack

### Frontend

- React 18+
- Material-UI
- Recharts
- React-Leaflet
- Vite

### Backend

- Python 3.9+
- FastAPI
- SQLAlchemy
- PostgreSQL

### AI/ML

- scikit-learn
- pandas
- numpy
- feature-engine
- optuna

## Prerequisites

- Node.js 16+
- Python 3.9+
- PostgreSQL 13+
- Git

## Project Structure

```
SMIS-AI/
├── src/
│   ├── ai_service/           # AI/ML pipeline
│   │   ├── docs/            # Documentation
│   │   ├── models/         # Trained models
│   │   └── data/          # Training data
│   ├── components/         # React components
│   ├── context/           # React context
│   ├── utils/             # Utility functions
│   └── assets/            # Static assets
├── public/                # Public assets
└── docs/                 # Project documentation
```

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-org/SMIS-AI.git
   cd SMIS-AI
   ```

2. **Frontend Setup**

   ```bash
   # Install dependencies
   npm install

   # Create environment file
   cp .env.example .env
   ```

3. **AI Service Setup**

```bash
   # Create Python virtual environment
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   .\venv\Scripts\activate   # Windows

   # Install Python dependencies
   cd src/ai_service
   pip install -r requirements.txt
   ```

4. **Database Setup**

```bash
   # Create database
   createdb icbt_smis

   # Run migrations
   python src/ai_service/setup.py
   ```

## Configuration

1. **Frontend Environment (.env)**

```env
   VITE_API_URL=http://localhost:8000
   VITE_MAP_KEY=your_map_key
   ```

2. **AI Service Configuration**
   ```python
   # src/ai_service/config.py
   DB_URL = "postgresql://user:pass@localhost/icbt_smis"
   MODEL_PATH = "models/student_registration_model.pkl"
   ```

## Running the Application

1. **Start Frontend Development Server**

```bash
npm run dev
```

   Access the application at `http://localhost:5173`

2. **Start AI Service**
   ```bash
   cd src/ai_service
   uvicorn api:app --reload
   ```
   API will be available at `http://localhost:8000`

## Model Training

1. **Prepare Training Data**

```bash
   python src/ai_service/prepare_data.py
```

2. **Train Model**

```bash
   python src/ai_service/train_model.py
   ```

3. **Evaluate Model**
   ```bash
   python src/ai_service/evaluate_model.py
   ```

## Documentation

- [ML Pipeline Documentation](src/ai_service/docs/ML_PIPELINE_DOCUMENTATION.md)
- [Model Evaluation](src/ai_service/docs/MODEL_EVALUATION.md)
- [Dashboard Visualization](src/ai_service/docs/DASHBOARD_VISUALIZATION.md)

## Testing

1. **Frontend Tests**

   ```bash
   npm test
   ```

2. **AI Service Tests**
   ```bash
   cd src/ai_service
   pytest
   ```

## Deployment

1. **Build Frontend**

   ```bash
   npm run build
   ```

2. **Deploy AI Service**
   ```bash
   # Using Docker
   docker build -t icbt-smis .
   docker run -p 8000:8000 icbt-smis
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact:

- Email: support@icbt.edu.lk
- Issue Tracker: [GitHub Issues](https://github.com/your-org/SMIS-AI/issues)

## Acknowledgments

- ICBT Campus IT Team
- Contributors and maintainers
- Open source community

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, List
import json
from student_registration_prediction_system import StudentRegistrationPredictor

app = FastAPI(title="Student Registration Prediction API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor
predictor = StudentRegistrationPredictor()
predictor.load_model()  # Load the trained model

class PredictionRequest(BaseModel):
    year: int
    month: int

class PredictionResponse(BaseModel):
    districts: List[str]
    predictions: List[int]
    percentages: List[float]
    timestamp: str

@app.get("/")
async def root():
    return {"message": "Student Registration Prediction API"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_registrations(request: PredictionRequest):
    try:
        # Get predictions for the specified year and month
        _, district_summary = predictor.predict_registrations(request.year, request.month)
        
        # Sort districts by predictions for consistency
        district_summary_sorted = district_summary.sort_values('predicted_registrations', ascending=False)
        
        # Calculate total predictions and percentages
        total_predictions = district_summary_sorted['predicted_registrations'].sum()
        
        # Prepare response data
        districts = district_summary_sorted['district'].tolist()
        predictions = district_summary_sorted['predicted_registrations'].tolist()
        percentages = [(count / total_predictions) * 100 for count in predictions]
        
        return {
            "districts": districts,
            "predictions": predictions,
            "percentages": [round(p, 1) for p in percentages],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
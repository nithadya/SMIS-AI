import React, { createContext, useContext, useState } from "react";
import { fetchPredictions } from "../lib/api/ai_predictions";

const AIPredictionContext = createContext();

export const usePredictions = () => {
  const context = useContext(AIPredictionContext);
  if (!context) {
    throw new Error(
      "usePredictions must be used within an AIPredictionProvider"
    );
  }
  return context;
};

export const AIPredictionProvider = ({ children }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getPredictions = async (year, month) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPredictions(year, month);
      setPredictions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    getPredictions(date.getFullYear(), date.getMonth() + 1);
  };

  const value = {
    predictions,
    loading,
    error,
    selectedDate,
    handleDateChange,
    getPredictions,
  };

  return (
    <AIPredictionContext.Provider value={value}>
      {children}
    </AIPredictionContext.Provider>
  );
};

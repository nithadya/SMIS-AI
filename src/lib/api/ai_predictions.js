const API_BASE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8000";

// Export the fetchPredictions function directly
export const fetchPredictions = async (year, month) => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year, month }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch predictions");
    }

    return await response.json();
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
};

// Export other API functions as part of aiService object
export const aiService = {
  // Get model metrics
  async getModelMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/model/metrics`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to fetch model metrics");
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error("Metrics error:", error);
      return {
        data: null,
        error: error.message,
      };
    }
  },

  // Get feature importance
  async getFeatureImportance() {
    try {
      const response = await fetch(`${API_BASE_URL}/model/features`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to fetch feature importance");
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error("Feature importance error:", error);
      return {
        data: null,
        error: error.message,
      };
    }
  },
};

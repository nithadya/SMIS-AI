import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../utils/leaflet-icons-fix";
import sriLankaGeoData from "./sri-lanka-districts.json";
import { styled } from "@mui/material/styles";

const MapBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "600px",
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  "& .leaflet-container": {
    width: "100%",
    height: "100%",
    background: "#f8f9fa",
  },
}));

const Legend = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 20,
  right: 20,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  zIndex: 1000,
  boxShadow: theme.shadows[2],
}));

const SriLankaMap = ({ predictions }) => {
  if (!predictions || !predictions.districts || !predictions.predictions) {
    return null;
  }

  // Create a map of district names to their predictions
  const predictionMap = predictions.districts.reduce((acc, district, index) => {
    acc[district] = predictions.predictions[index];
    return acc;
  }, {});

  // Get min and max predictions for color scale
  const minPrediction = Math.min(...predictions.predictions);
  const maxPrediction = Math.max(...predictions.predictions);

  // Color scale function
  const getColor = (value) => {
    const normalizedValue =
      (value - minPrediction) / (maxPrediction - minPrediction);
    return `hsl(200, 80%, ${100 - normalizedValue * 50}%)`;
  };

  // Style function for GeoJSON features
  const style = (feature) => {
    const prediction = predictionMap[feature.properties.name] || 0;
    return {
      fillColor: getColor(prediction),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  // Highlight feature on hover
  const highlightFeature = (e) => {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.9,
    });
  };

  // Reset highlight
  const resetHighlight = (e) => {
    const layer = e.target;
    layer.setStyle(style(layer.feature));
  };

  // Click handler
  const onEachFeature = (feature, layer) => {
    const prediction = predictionMap[feature.properties.name] || 0;
    layer.bindTooltip(
      `<div>
        <strong>${feature.properties.name}</strong><br/>
        Predicted Students: ${prediction}
      </div>`,
      { sticky: true }
    );

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });
  };

  // Generate legend items
  const legendItems = [
    { label: `${Math.round(minPrediction)}`, color: getColor(minPrediction) },
    {
      label: `${Math.round((minPrediction + maxPrediction) / 2)}`,
      color: getColor((minPrediction + maxPrediction) / 2),
    },
    { label: `${Math.round(maxPrediction)}`, color: getColor(maxPrediction) },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2, position: "relative" }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        District-wise Registration Predictions
      </Typography>
      <MapBox>
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={7}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <ZoomControl position="topright" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <GeoJSON
            data={sriLankaGeoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
        <Legend>
          <Typography variant="subtitle2" gutterBottom>
            Predicted Registrations
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {legendItems.map((item, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    backgroundColor: item.color,
                    border: "1px solid #ccc",
                    borderRadius: 0.5,
                  }}
                />
                <Typography variant="caption">{item.label}</Typography>
              </Box>
            ))}
          </Box>
        </Legend>
      </MapBox>
    </Paper>
  );
};

export default SriLankaMap;

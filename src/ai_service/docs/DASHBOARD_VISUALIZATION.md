# ICBT Analytics Dashboard Visualization Documentation

## Overview

The ICBT Analytics Dashboard provides a comprehensive visualization system for student registration predictions and model performance metrics. The dashboard is built using React and Material-UI, featuring interactive charts powered by Recharts and an interactive map using React-Leaflet.

## Dashboard Components

### 1. Header Section

- Title and description
- Date picker for prediction period selection
- Export and filter controls

### 2. Summary Cards

- **Total Predictions**: Shows total expected registrations
- **Model Accuracy**: Displays current model accuracy
- **Confidence Level**: Shows model confidence score
- **Districts Coverage**: Number of districts analyzed

### 3. Main Navigation Tabs

1. **Overview**
2. **Geographic Analysis**
3. **Comparisons**
4. **Trends**

## Detailed Visualization Components

### 1. Geographic Analysis (SriLankaMap.jsx)

#### Interactive District Map

```jsx
<MapContainer center={[7.8731, 80.7718]} zoom={7}>
  <GeoJSON data={sriLankaGeoData} style={style} onEachFeature={onEachFeature} />
</MapContainer>
```

Features:

- Color-coded districts based on prediction values
- Interactive tooltips showing district details
- Zoom and pan capabilities
- Multiple map layer options (Street/Satellite)
- Dynamic legend showing prediction ranges

#### Map Features

- **Color Scale**: HSL-based gradient showing prediction intensity
- **Hover Effects**: Enhanced district highlighting
- **Tooltips**: Shows district name and predicted students
- **Legend**: Dynamic scale showing prediction ranges

### 2. Trend Analysis

#### Registration Trends Chart

```jsx
<AreaChart data={historicalData}>
  <Area type="monotone" dataKey="students" stackId="1" />
  <Area type="monotone" dataKey="accuracy" stackId="2" />
</AreaChart>
```

Features:

- Historical registration patterns
- Accuracy trends over time
- Stacked area visualization
- Interactive tooltips

#### Performance Metrics

- Line and bar combinations
- Multiple metric comparisons
- Customizable time ranges
- Trend indicators

### 3. District Comparisons

#### Bar Charts

```jsx
<BarChart data={districtData}>
  <Bar yAxisId="left" dataKey="value" name="Students" />
  <Bar yAxisId="right" dataKey="density" name="Density" />
</BarChart>
```

Features:

- District-wise comparison
- Multiple metric visualization
- Sorted presentation
- Interactive legends

#### Radar Charts

- Model performance metrics
- District-wise comparison
- Multiple dimension analysis
- Interactive data points

### 4. Distribution Analysis

#### Pie Charts

```jsx
<PieChart>
  <Pie
    data={districtData}
    dataKey="value"
    nameKey="name"
    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
  />
</PieChart>
```

Features:

- District distribution visualization
- Percentage breakdown
- Interactive segments
- Custom labels and tooltips

#### Scatter Plots

- Correlation analysis
- Density vs. registration plots
- Trend line visualization
- Interactive data points

## Interactive Features

### 1. Filtering Options

- Date range selection
- Metric selection
- District filtering
- Trend visibility toggles

### 2. Export Capabilities

```javascript
generateReport({
  title: "ICBT Student Registration Analytics Report",
  sections: [
    {
      title: "District-wise Registration Predictions",
      data: districtAnalyticsData,
      // ... configuration
    },
  ],
});
```

### 3. Responsive Design

- Adaptive layouts
- Mobile-friendly views
- Dynamic resizing
- Consistent styling

## Data Updates and Refresh

### Real-time Updates

- Automatic data refresh
- Loading states
- Error handling
- Progress indicators

### State Management

```javascript
const { predictions, loading, error, selectedDate, handleDateChange } =
  usePredictions();
```

## Styling and Theming

### Material-UI Integration

```javascript
const MapBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "600px",
  borderRadius: theme.shape.borderRadius,
  // ... styling
}));
```

### Color Schemes

- Consistent color palette
- Accessibility considerations
- Theme integration
- Custom styling

## Performance Optimization

### Chart Rendering

- ResponsiveContainer usage
- Lazy loading
- Memoization
- Efficient updates

### Map Performance

- GeoJSON optimization
- Layer management
- Event throttling
- Caching mechanisms

## Error Handling

### Visualization Fallbacks

- Loading states
- Error boundaries
- Data validation
- Graceful degradation

## Future Enhancements

1. **Advanced Filtering**

   - Custom date ranges
   - Multiple metric comparison
   - Advanced search

2. **Additional Visualizations**

   - Time-series forecasting
   - Correlation matrices
   - Heat maps

3. **Enhanced Interactivity**

   - Drill-down capabilities
   - Custom report generation
   - Advanced filtering

4. **Performance Improvements**
   - Data caching
   - Progressive loading
   - Optimized rendering

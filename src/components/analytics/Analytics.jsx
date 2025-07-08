import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Tab,
  Tabs,
  Button,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { usePredictions } from "../../context/AIPredictionContext";
import SriLankaMap from "./SriLankaMap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart,
  ComposedChart,
} from "recharts";
import {
  InfoOutlined,
  TrendingUp,
  School,
  People,
  Download,
  FilterList,
  CompareArrows,
  Analytics as AnalyticsIcon,
  Timeline,
  Map,
} from "@mui/icons-material";
import { generateReport } from "../../utils/reportGenerator";

// Custom colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Analytics = () => {
  const { predictions, loading, error, selectedDate, handleDateChange } =
    usePredictions();
  const [tabValue, setTabValue] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [showTrends, setShowTrends] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState([
    "students",
    "accuracy",
  ]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Calculate metrics
  const totalPredictions =
    predictions?.predictions?.reduce((a, b) => a + b, 0) || 0;
  const averagePrediction =
    totalPredictions / (predictions?.districts?.length || 1);

  // Prepare data for charts
  const districtData =
    predictions?.districts?.map((district, index) => ({
      name: district,
      value: predictions.predictions[index],
      percentage: predictions.percentages[index],
      density: (predictions.predictions[index] / averagePrediction) * 100,
    })) || [];

  // Example historical data (replace with actual data)
  const historicalData = [
    { month: "Jan", students: 1200, accuracy: 0.82, confidence: 0.78 },
    { month: "Feb", students: 1350, accuracy: 0.84, confidence: 0.81 },
    { month: "Mar", students: 1100, accuracy: 0.83, confidence: 0.79 },
    { month: "Apr", students: 1450, accuracy: 0.85, confidence: 0.82 },
    { month: "May", students: 1600, accuracy: 0.86, confidence: 0.84 },
  ];

  // Model metrics
  const modelMetrics = {
    accuracy: 0.85,
    precision: 0.82,
    recall: 0.88,
    f1Score: 0.85,
    confidence: 0.87,
    errorRate: 0.15,
  };

  // District performance metrics
  const districtPerformance = [
    { subject: "Prediction Accuracy", A: 85, B: 90 },
    { subject: "Data Quality", A: 78, B: 82 },
    { subject: "Model Confidence", A: 88, B: 85 },
    { subject: "Historical Accuracy", A: 92, B: 88 },
    { subject: "Feature Coverage", A: 75, B: 80 },
  ];

  const handleExportData = () => {
    // Prepare data for the report
    const districtAnalyticsData = districtData.map((district) => ({
      district: district.name,
      predictedStudents: district.value,
      percentage: `${(district.percentage * 100).toFixed(1)}%`,
      density: district.density.toFixed(1),
    }));

    const modelPerformanceData = Object.entries(modelMetrics).map(
      ([metric, value]) => ({
        metric: metric.replace(/([A-Z])/g, " $1").trim(),
        value: `${(value * 100).toFixed(1)}%`,
      })
    );

    const historicalTrendData = historicalData.map((data) => ({
      month: data.month,
      students: data.students,
      accuracy: `${(data.accuracy * 100).toFixed(1)}%`,
      confidence: `${(data.confidence * 100).toFixed(1)}%`,
    }));

    generateReport({
      title: "ICBT Student Registration Analytics Report",
      sections: [
        {
          title: "District-wise Registration Predictions",
          data: districtAnalyticsData,
          columns: [
            { header: "District", key: "district" },
            { header: "Predicted Students", key: "predictedStudents" },
            { header: "Percentage", key: "percentage" },
            { header: "Density Index", key: "density" },
          ],
        },
        {
          title: "Model Performance Metrics",
          data: modelPerformanceData,
          columns: [
            { header: "Metric", key: "metric" },
            { header: "Value", key: "value" },
          ],
        },
        {
          title: "Historical Trends",
          data: historicalTrendData,
          columns: [
            { header: "Month", key: "month" },
            { header: "Students", key: "students" },
            { header: "Accuracy", key: "accuracy" },
            { header: "Confidence", key: "confidence" },
          ],
        },
      ],
      summaryData: {
        "Total Predicted Students": totalPredictions,
        "Average Students per District": averagePrediction.toFixed(0),
        "Overall Model Accuracy": `${(modelMetrics.accuracy * 100).toFixed(
          1
        )}%`,
        "Model Confidence": `${(modelMetrics.confidence * 100).toFixed(1)}%`,
        "Number of Districts": predictions?.districts?.length || 0,
      },
      filename: `ICBT-Analytics-Report-${
        new Date().toISOString().split("T")[0]
      }.pdf`,
    });
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.default" }}>
      {/* Header Section with enhanced styling */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              background:
                "linear-gradient(45deg, primary.main, secondary.main)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Student Registration Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Analyze and visualize student registration predictions across
            districts
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportData}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              background:
                "linear-gradient(45deg, primary.main, secondary.main)",
              "&:hover": {
                background:
                  "linear-gradient(45deg, primary.dark, secondary.dark)",
              },
            }}
          >
            Export Data
          </Button>
        </Stack>
      </Box>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={showTrends}
                onChange={(e) => setShowTrends(e.target.checked)}
              />
            }
            label="Show Trends"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.checked)}
              />
            }
            label="Comparison Mode"
          />
        </MenuItem>
      </Menu>

      {/* Date Picker and Summary Cards with enhanced styling */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              "&:hover": {
                transform: "translateY(-2px)",
                transition: "transform 0.3s",
              },
            }}
          >
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Month and Year"
                  value={selectedDate}
                  onChange={handleDateChange}
                  views={["year", "month"]}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            {[
              {
                icon: <School />,
                title: "Total Predictions",
                value: totalPredictions,
                subtitle: "Expected registrations",
                color: "primary",
              },
              {
                icon: <TrendingUp />,
                title: "Model Accuracy",
                value: `${(modelMetrics.accuracy * 100).toFixed(1)}%`,
                subtitle: "Prediction accuracy",
                color: "success",
              },
              {
                icon: <Timeline />,
                title: "Confidence",
                value: `${(modelMetrics.confidence * 100).toFixed(1)}%`,
                subtitle: "Model confidence",
                color: "info",
              },
              {
                icon: <People />,
                title: "Districts",
                value: predictions?.districts?.length || 0,
                subtitle: "Total districts",
                color: "warning",
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    bgcolor: `${item.color}.light`,
                    borderRadius: 2,
                    boxShadow: 2,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      transition: "transform 0.3s",
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {React.cloneElement(item.icon, { sx: { mr: 1 } })}
                      <Typography variant="h6">{item.title}</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "error.light" }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      )}

      {predictions && (
        <>
          <Paper
            sx={{
              mb: 4,
              borderRadius: 2,
              boxShadow: 2,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{
                "& .MuiTab-root": {
                  minHeight: 64,
                  textTransform: "none",
                  fontSize: "1rem",
                },
                "& .Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                },
              }}
            >
              <Tab icon={<AnalyticsIcon />} label="Overview" />
              <Tab icon={<Map />} label="Geographic Analysis" />
              <Tab icon={<CompareArrows />} label="Comparisons" />
              <Tab icon={<Timeline />} label="Trends" />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Registration Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          stackId="2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Model Performance Radar
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={districtPerformance}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />
                        <Radar
                          name="Performance A"
                          dataKey="A"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Performance B"
                          dataKey="B"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: 2,
                    overflow: "hidden",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      <Map /> District Distribution Map
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Interactive map showing student registration predictions
                      across Sri Lankan districts
                    </Typography>
                    <Box sx={{ height: 500 }}>
                      <SriLankaMap predictions={predictions} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      <PieChart sx={{ width: 20, height: 20 }} /> Distribution
                      by District
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Percentage distribution of predicted student registrations
                      by district
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={districtData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          innerRadius={80}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                          labelLine={{ strokeWidth: 1 }}
                        >
                          {districtData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <Box
                                  sx={{
                                    bgcolor: "background.paper",
                                    p: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    boxShadow: 2,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {data.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Students: {data.value}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Percentage:{" "}
                                    {(data.percentage * 100).toFixed(1)}%
                                  </Typography>
                                </Box>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      <Timeline /> District Density Analysis
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Relationship between student count and population density
                      by district
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="value"
                          name="Students"
                          label={{
                            value: "Number of Students",
                            position: "bottom",
                            offset: 0,
                          }}
                          type="number"
                        />
                        <YAxis
                          dataKey="density"
                          name="Density"
                          label={{
                            value: "Population Density",
                            angle: -90,
                            position: "insideLeft",
                          }}
                          type="number"
                        />
                        <RechartsTooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <Box
                                  sx={{
                                    bgcolor: "background.paper",
                                    p: 2,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    boxShadow: 2,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {data.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Students: {data.value}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Density Index: {data.density.toFixed(1)}
                                  </Typography>
                                </Box>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter
                          name="Districts"
                          data={districtData}
                          fill="#8884d8"
                        >
                          {districtData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Scatter>
                        <Legend />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      District-wise Comparison
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={districtData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          stroke="#8884d8"
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#82ca9d"
                        />
                        <RechartsTooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="value"
                          name="Students"
                          fill="#8884d8"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="density"
                          name="Density"
                          fill="#82ca9d"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Model Performance Metrics
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {Object.entries(modelMetrics).map(([metric, value]) => (
                        <Box key={metric} sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {metric.replace(/([A-Z])/g, " $1").trim()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={value * 100}
                            sx={{
                              mb: 1,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                              },
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {(value * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Prediction Confidence by District
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={districtPerformance}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />
                        <Radar
                          name="Current"
                          dataKey="A"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">Historical Trends</Typography>
                      <Stack direction="row" spacing={1}>
                        {["students", "accuracy", "confidence"].map(
                          (metric) => (
                            <Chip
                              key={metric}
                              label={metric}
                              color={
                                selectedMetrics.includes(metric)
                                  ? "primary"
                                  : "default"
                              }
                              onClick={() => {
                                setSelectedMetrics((prev) =>
                                  prev.includes(metric)
                                    ? prev.filter((m) => m !== metric)
                                    : [...prev, metric]
                                );
                              }}
                            />
                          )
                        )}
                      </Stack>
                    </Box>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        {selectedMetrics.includes("students") && (
                          <Line
                            type="monotone"
                            dataKey="students"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                        )}
                        {selectedMetrics.includes("accuracy") && (
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#82ca9d"
                            activeDot={{ r: 8 }}
                          />
                        )}
                        {selectedMetrics.includes("confidence") && (
                          <Line
                            type="monotone"
                            dataKey="confidence"
                            stroke="#ffc658"
                            activeDot={{ r: 8 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Monthly Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="accuracy" fill="#8884d8" />
                        <Line
                          type="monotone"
                          dataKey="confidence"
                          stroke="#ff7300"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default Analytics;

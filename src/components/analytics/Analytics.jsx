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
  Container,
  useTheme,
  alpha,
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
    try {
      // Check if data is available
      if (loading) {
        console.warn("Cannot export data while loading");
        return;
      }

      if (error) {
        console.error("Cannot export data due to error:", error);
        return;
      }

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
      
      console.log("PDF report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const theme = useTheme();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header Section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
            Student Registration Analytics
          </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: "600px",
                lineHeight: 1.6,
                opacity: 0.8 
              }}
            >
              Analyze and visualize student registration predictions across districts with advanced AI-powered insights
          </Typography>
        </Box>
          <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                },
              }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportData}
            disabled={loading || error || !predictions}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                "&:hover": {
                  background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
          >
            Export Data
          </Button>
        </Stack>
        </Box>
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

      {/* Enhanced Date Picker and Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
              height: "100%",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  mb: 2,
                  color: "text.primary" 
                }}
              >
                Select Period
              </Typography>
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
                      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
                      "& fieldset": {
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderWidth: 2,
                      },
                      "&.Mui-focused fieldset": {
                        borderWidth: 2,
                      },
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
                icon: <School sx={{ fontSize: 32 }} />,
                title: "Total Predictions",
                value: totalPredictions,
                subtitle: "Expected registrations",
                color: "primary",
              },
              {
                icon: <TrendingUp sx={{ fontSize: 32 }} />,
                title: "Model Accuracy",
                value: `${(modelMetrics.accuracy * 100).toFixed(1)}%`,
                subtitle: "Prediction accuracy",
                color: "success",
              },
              {
                icon: <Timeline sx={{ fontSize: 32 }} />,
                title: "Confidence",
                value: `${(modelMetrics.confidence * 100).toFixed(1)}%`,
                subtitle: "Model confidence",
                color: "info",
              },
              {
                icon: <People sx={{ fontSize: 32 }} />,
                title: "Districts",
                value: predictions?.districts?.length || 0,
                subtitle: "Total districts",
                color: "warning",
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    p: 1,
                    background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette[item.color].main, 0.1)}, ${alpha(theme.palette[item.color].main, 0.05)})`,
                    backdropFilter: "blur(8px)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette[item.color].main, 0.15)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          mr: 2,
                          bgcolor: (theme) => alpha(theme.palette[item.color].main, 0.15),
                          color: `${item.color}.main`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                  </Box>
                      <Typography 
                        variant="subtitle1"
                        sx={{ 
                          fontWeight: 600,
                          color: `${item.color}.main`,
                        }}
                      >
                        {item.title}
                  </Typography>
                  </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700,
                        mb: 1,
                        color: "text.primary",
                      }}
                    >
                      {item.value}
                  </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "text.secondary",
                        opacity: 0.8,
                      }}
                    >
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
          <LinearProgress 
            sx={{ 
              height: 8,
              borderRadius: 4,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
              },
            }} 
          />
        </Box>
      )}

      {error && (
        <Paper 
          sx={{ 
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            border: "2px solid",
            borderColor: "error.main",
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>Error Occurred</Typography>
          <Typography color="error.dark">{error}</Typography>
        </Paper>
      )}

      {predictions && (
        <>
          <Paper
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: "hidden",
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
              backdropFilter: "blur(8px)",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: 64,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "text.secondary",
                  transition: "all 0.2s",
                  px: 4,
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  },
                },
                "& .Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              <Tab 
                icon={<AnalyticsIcon />} 
                label="Overview" 
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab 
                icon={<Map />} 
                label="Geographic Analysis" 
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab 
                icon={<CompareArrows />} 
                label="Comparisons" 
                iconPosition="start"
                sx={{ gap: 1 }}
              />
              <Tab 
                icon={<Timeline />} 
                label="Trends" 
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 3,
                      }}
                    >
                      <Timeline sx={{ color: "primary.main" }} />
                      Registration Trends
                    </Typography>
                    <Box sx={{ height: 400, width: "100%" }}>
                      <ResponsiveContainer>
                        <AreaChart 
                          data={historicalData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <XAxis 
                            dataKey="month" 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 8,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              border: "none",
                              padding: "8px 12px",
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                            fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          stackId="2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                            fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 3,
                      }}
                    >
                      <AnalyticsIcon sx={{ color: "primary.main" }} />
                      Model Performance Radar
                    </Typography>
                    <Box sx={{ height: 300, width: "100%" }}>
                      <ResponsiveContainer>
                      <RadarChart data={districtPerformance}>
                          <PolarGrid 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <PolarAngleAxis 
                            dataKey="subject"
                            tick={{ fill: "text.secondary", fontSize: 12 }}
                          />
                          <PolarRadiusAxis 
                            tick={{ fill: "text.secondary", fontSize: 12 }}
                          />
                        <Radar
                          name="Performance A"
                          dataKey="A"
                          stroke="#8884d8"
                          fill="#8884d8"
                            fillOpacity={0.3}
                        />
                        <Radar
                          name="Performance B"
                          dataKey="B"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                            fillOpacity={0.3}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                      </RadarChart>
                    </ResponsiveContainer>
                    </Box>
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
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                    overflow: "hidden",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <Map sx={{ color: "primary.main" }} />
                      District Distribution Map
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 3,
                        opacity: 0.8,
                      }}
                    >
                      Interactive map showing student registration predictions across Sri Lankan districts
                    </Typography>
                    <Box 
                      sx={{ 
                        height: 500,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "2px solid",
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                    <SriLankaMap predictions={predictions} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <PieChart sx={{ color: "primary.main", width: 24, height: 24 }} />
                        Distribution by District
                      </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 3,
                        opacity: 0.8,
                      }}
                    >
                      Percentage distribution of predicted student registrations by district
                    </Typography>
                    <Box sx={{ height: 400, width: "100%" }}>
                      <ResponsiveContainer>
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
                            labelLine={{ strokeWidth: 1, stroke: "text.secondary" }}
                          >
                            {districtData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke={(theme) => theme.palette.background.paper}
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
                                      borderRadius: 2,
                                      boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: 600, color: "text.primary" }}
                                    >
                                      {data.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      Students: {data.value}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      Percentage: {(data.percentage * 100).toFixed(1)}%
                                    </Typography>
                                  </Box>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    </CardContent>
                  </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <Timeline sx={{ color: "primary.main" }} />
                        District Density Analysis
                      </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 3,
                        opacity: 0.8,
                      }}
                    >
                      Relationship between student count and population density by district
                    </Typography>
                    <Box sx={{ height: 400, width: "100%" }}>
                      <ResponsiveContainer>
                        <ScatterChart
                          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <XAxis
                            dataKey="value"
                            name="Students"
                            label={{
                              value: "Number of Students",
                              position: "bottom",
                              offset: 0,
                              style: { fill: "text.secondary", fontSize: 12 }
                            }}
                            type="number"
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <YAxis
                            dataKey="density"
                            name="Density"
                            label={{
                              value: "Population Density",
                              angle: -90,
                              position: "insideLeft",
                              style: { fill: "text.secondary", fontSize: 12 }
                            }}
                            type="number"
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <RechartsTooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{
                              borderRadius: 8,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              border: "none",
                              padding: "8px 12px",
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
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </Box>
                    </CardContent>
                  </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <CompareArrows sx={{ color: "primary.main" }} />
                      District-wise Comparison
                    </Typography>
                    <Box sx={{ height: 400, width: "100%" }}>
                      <ResponsiveContainer>
                      <BarChart data={districtData}>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <XAxis 
                            dataKey="name" 
                            stroke="text.secondary"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#8884d8"
                            fontSize={12}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#82ca9d"
                            fontSize={12}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 8,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              border: "none",
                              padding: "8px 12px",
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                        <Bar
                          yAxisId="left"
                          dataKey="value"
                          name="Students"
                          fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="density"
                          name="Density"
                          fill="#82ca9d"
                            radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <Timeline sx={{ color: "primary.main" }} />
                      Model Performance Metrics
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {Object.entries(modelMetrics).map(([metric, value]) => (
                        <Box key={metric} sx={{ mb: 3 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ 
                                textTransform: "capitalize",
                                color: "text.primary",
                                fontWeight: 500,
                              }}
                            >
                              {metric.replace(/([A-Z])/g, " $1").trim()}
                          </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{ 
                                color: "primary.main",
                                fontWeight: 600,
                              }}
                            >
                              {(value * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={value * 100}
                            sx={{ 
                              height: 8,
                              borderRadius: 4,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <Timeline sx={{ color: "primary.main" }} />
                      Prediction Confidence by District
                    </Typography>
                    <Box sx={{ height: 300, width: "100%" }}>
                      <ResponsiveContainer>
                      <RadarChart data={districtPerformance}>
                          <PolarGrid 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <PolarAngleAxis 
                            dataKey="subject"
                            tick={{ 
                              fill: "text.secondary",
                              fontSize: 12,
                            }}
                          />
                          <PolarRadiusAxis 
                            tick={{ 
                              fill: "text.secondary",
                              fontSize: 12,
                            }}
                          />
                        <Radar
                          name="Current"
                          dataKey="A"
                          stroke="#8884d8"
                          fill="#8884d8"
                            fillOpacity={0.3}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                      </RadarChart>
                    </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          fontWeight: 600,
                        }}
                      >
                        <Timeline sx={{ color: "primary.main" }} />
                        Historical Trends
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {["students", "accuracy", "confidence"].map((metric) => (
                          <Chip
                            key={metric}
                            label={metric}
                            color={selectedMetrics.includes(metric) ? "primary" : "default"}
                            onClick={() => {
                              setSelectedMetrics((prev) =>
                                prev.includes(metric)
                                  ? prev.filter((m) => m !== metric)
                                  : [...prev, metric]
                              );
                            }}
                            sx={{
                              textTransform: "capitalize",
                              fontWeight: 500,
                              borderRadius: 2,
                              "& .MuiChip-label": {
                                px: 2,
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Box sx={{ height: 400, width: "100%" }}>
                      <ResponsiveContainer>
                      <LineChart data={historicalData}>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <XAxis 
                            dataKey="month" 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 8,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              border: "none",
                              padding: "8px 12px",
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                        {selectedMetrics.includes("students") && (
                          <Line
                            type="monotone"
                            dataKey="students"
                            stroke="#8884d8"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        )}
                        {selectedMetrics.includes("accuracy") && (
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#82ca9d"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        )}
                        {selectedMetrics.includes("confidence") && (
                          <Line
                            type="monotone"
                            dataKey="confidence"
                            stroke="#ffc658"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <Timeline sx={{ color: "primary.main" }} />
                      Monthly Distribution
                    </Typography>
                    <Box sx={{ height: 300, width: "100%" }}>
                      <ResponsiveContainer>
                      <AreaChart data={historicalData}>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <XAxis 
                            dataKey="month" 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 8,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              border: "none",
                              padding: "8px 12px",
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                            fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
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
                      <Timeline sx={{ color: "primary.main" }} />
                      Performance Metrics Over Time
                    </Typography>
                    <Box sx={{ height: 300, width: "100%" }}>
                      <ResponsiveContainer>
                      <ComposedChart data={historicalData}>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke={(theme) => alpha(theme.palette.text.primary, 0.1)}
                          />
                          <XAxis 
                            dataKey="month" 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="text.secondary"
                            fontSize={12}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 8,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              border: "none",
                              padding: "8px 12px",
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                          <Bar 
                            dataKey="accuracy" 
                            fill="#8884d8"
                            radius={[4, 4, 0, 0]}
                          />
                          <Line
                            type="monotone"
                            dataKey="confidence"
                            stroke="#ff7300"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 8 }}
                          />
                      </ComposedChart>
                    </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </>
      )}
    </Container>
  );
};

export default Analytics;

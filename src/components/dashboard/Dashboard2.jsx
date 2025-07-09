import React, { useState } from "react";
import { motion } from "framer-motion";
import { MagicCard, AnimatedList, ScrollProgress } from "../ui";
import StatCard from "./StatCard";

const Dashboard2 = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("enrollment");

  // Mock data for management overview
  const managementData = {
    kpis: {
      studentLifecycle: {
        inquiryToApplication: 68,
        applicationToEnrollment: 75,
        retentionRate: 92,
        graduationRate: 88,
        trend: "+5.2%",
      },
      operations: {
        resourceUtilization: 84,
        teacherStudentRatio: "1:25",
        classOccupancyRate: 92,
        facilityUtilization: 78,
        trend: "+3.8%",
      },
      marketing: {
        leadConversionRate: 42,
        costPerAcquisition: 250,
        marketingROI: 320,
        brandAwareness: 76,
        trend: "+7.4%",
      },
      financial: {
        revenueGrowth: 24,
        profitMargin: 32,
        operatingExpenses: -8,
        cashFlow: 450000,
        trend: "+12.3%",
      },
    },
    predictiveAnalytics: {
      enrollmentForecast: {
        current: 5909,
        nextQuarter: 6500,
        confidence: 92,
        trend: "increasing",
      },
      revenueProjection: {
        current: 892650,
        nextQuarter: 975000,
        confidence: 88,
        trend: "increasing",
      },
      dropoutRisk: {
        highRisk: 124,
        mediumRisk: 356,
        lowRisk: 5429,
        accuracy: 94,
      },
    },
    aiInsights: [
      {
        id: 1,
        category: "Enrollment",
        insight:
          "Potential 15% increase in enrollment by optimizing admission process timing",
        impact: "High",
        confidence: 89,
      },
      {
        id: 2,
        category: "Resource",
        insight:
          "Current teacher allocation could be optimized to improve student outcomes by 12%",
        impact: "Medium",
        confidence: 85,
      },
      {
        id: 3,
        category: "Financial",
        insight:
          "Implementing suggested payment plans could reduce payment defaults by 25%",
        impact: "High",
        confidence: 92,
      },
    ],
  };

  const renderWelcomeSection = () => (
    <MagicCard className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2"
          >
            Management Overview
          </motion.h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Strategic insights and predictive analytics for data-driven decision
            making
          </p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "quarter", "year"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? "bg-gradient-to-r from-primary-400/20 to-accent-400/20 text-primary-500 dark:text-primary-400"
                  : "text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100/50 dark:hover:bg-secondary-800/50"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </MagicCard>
  );

  const renderKPISection = () => {
    const kpiGroups = [
      {
        title: "Student Lifecycle",
        data: managementData.kpis.studentLifecycle,
        metrics: [
          {
            key: "inquiryToApplication",
            label: "Inquiry to Application",
            icon: "📝",
          },
          {
            key: "applicationToEnrollment",
            label: "Application to Enrollment",
            icon: "✅",
          },
          { key: "retentionRate", label: "Retention Rate", icon: "🔄" },
          { key: "graduationRate", label: "Graduation Rate", icon: "🎓" },
        ],
      },
      {
        title: "Operations",
        data: managementData.kpis.operations,
        metrics: [
          {
            key: "resourceUtilization",
            label: "Resource Utilization",
            icon: "📊",
          },
          {
            key: "teacherStudentRatio",
            label: "Teacher-Student Ratio",
            icon: "👥",
          },
          { key: "classOccupancyRate", label: "Class Occupancy", icon: "🏫" },
          {
            key: "facilityUtilization",
            label: "Facility Utilization",
            icon: "🏢",
          },
        ],
      },
      {
        title: "Marketing",
        data: managementData.kpis.marketing,
        metrics: [
          { key: "leadConversionRate", label: "Lead Conversion", icon: "🎯" },
          {
            key: "costPerAcquisition",
            label: "Cost per Acquisition",
            icon: "💰",
          },
          { key: "marketingROI", label: "Marketing ROI", icon: "📈" },
          { key: "brandAwareness", label: "Brand Awareness", icon: "🌟" },
        ],
      },
      {
        title: "Financial",
        data: managementData.kpis.financial,
        metrics: [
          { key: "revenueGrowth", label: "Revenue Growth", icon: "💹" },
          { key: "profitMargin", label: "Profit Margin", icon: "📊" },
          { key: "operatingExpenses", label: "Operating Expenses", icon: "💸" },
          { key: "cashFlow", label: "Cash Flow", icon: "💵" },
        ],
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kpiGroups.map((group) => (
          <MagicCard key={group.title} className="p-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
              {group.title} KPIs
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {group.metrics.map((metric) => (
                <motion.div
                  key={metric.key}
                  className="glass p-4 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{metric.icon}</span>
                    <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                      {metric.label}
                    </h3>
                  </div>
                  <div className="text-2xl font-semibold text-primary-500 dark:text-primary-400">
                    {group.data[metric.key]}
                    {typeof group.data[metric.key] === "number" && "%"}
                  </div>
                </motion.div>
              ))}
            </div>
          </MagicCard>
        ))}
      </div>
    );
  };

  const renderPredictiveAnalytics = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
        Predictive Analytics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="glass p-6 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-4">
            Enrollment Forecast
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Current
              </p>
              <p className="text-2xl font-semibold text-primary-500">
                {managementData.predictiveAnalytics.enrollmentForecast.current}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Next Quarter
              </p>
              <p className="text-2xl font-semibold text-success-main">
                {
                  managementData.predictiveAnalytics.enrollmentForecast
                    .nextQuarter
                }
              </p>
            </div>
            <div className="text-sm text-secondary-500">
              Confidence:{" "}
              {managementData.predictiveAnalytics.enrollmentForecast.confidence}
              %
            </div>
          </div>
        </motion.div>

        <motion.div
          className="glass p-6 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-4">
            Revenue Projection
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Current
              </p>
              <p className="text-2xl font-semibold text-primary-500">
                $
                {managementData.predictiveAnalytics.revenueProjection.current.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Next Quarter
              </p>
              <p className="text-2xl font-semibold text-success-main">
                $
                {managementData.predictiveAnalytics.revenueProjection.nextQuarter.toLocaleString()}
              </p>
            </div>
            <div className="text-sm text-secondary-500">
              Confidence:{" "}
              {managementData.predictiveAnalytics.revenueProjection.confidence}%
            </div>
          </div>
        </motion.div>

        <motion.div
          className="glass p-6 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-4">
            Student Risk Analysis
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-error-main">High Risk</p>
              <p className="text-2xl font-semibold text-error-main">
                {managementData.predictiveAnalytics.dropoutRisk.highRisk}
              </p>
            </div>
            <div>
              <p className="text-sm text-warning-main">Medium Risk</p>
              <p className="text-2xl font-semibold text-warning-main">
                {managementData.predictiveAnalytics.dropoutRisk.mediumRisk}
              </p>
            </div>
            <div>
              <p className="text-sm text-success-main">Low Risk</p>
              <p className="text-2xl font-semibold text-success-main">
                {managementData.predictiveAnalytics.dropoutRisk.lowRisk}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MagicCard>
  );

  const renderAIInsights = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
        AI-Driven Insights
      </h2>
      <AnimatedList
        as="div"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        animation="fade-up"
        staggerDelay={0.1}
      >
        {managementData.aiInsights.map((insight) => (
          <motion.div
            key={insight.id}
            className="glass p-6 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">
                {insight.category === "Enrollment"
                  ? "📚"
                  : insight.category === "Resource"
                  ? "🔧"
                  : "💰"}
              </span>
              <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300">
                {insight.category}
              </h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              {insight.insight}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span
                className={`font-medium ${
                  insight.impact === "High"
                    ? "text-success-main"
                    : insight.impact === "Medium"
                    ? "text-warning-main"
                    : "text-info-main"
                }`}
              >
                {insight.impact} Impact
              </span>
              <span className="text-secondary-500">
                {insight.confidence}% Confidence
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatedList>
    </MagicCard>
  );

  return (
    <>
      <ScrollProgress />
      <div className="space-y-6 p-6">
        {renderWelcomeSection()}
        {renderKPISection()}
        {renderPredictiveAnalytics()}
        {renderAIInsights()}
      </div>
    </>
  );
};

export default Dashboard2;

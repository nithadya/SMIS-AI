import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, LineChart, BarChart, PieChart, Area, Line, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Users, FileText, Clock, CheckCircle, AlertCircle, 
  TrendingUp, Settings, Download, Filter, Search,
  UserCheck, Calendar, Award, Target, BarChart3
} from 'lucide-react';
import { MagicCard } from '../ui/MagicCard';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ShimmerButton } from '../ui/ShimmerButton';
import { getEnrollmentRegistrationAnalytics, updateSortingMethod, exportAnalyticsReport } from '../../lib/api/manager';

const EnrollmentRegistrationManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [managementData, setManagementData] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    program: 'all',
    status: 'all',
    counselor: 'all',
    dateRange: '30'
  });
  const [sortingMethod, setSortingMethod] = useState('priority_score');

  useEffect(() => {
    fetchManagementData();
  }, [selectedFilters, sortingMethod]);

  const fetchManagementData = async () => {
    setLoading(true);
    try {
      const { data, error } = await getEnrollmentRegistrationAnalytics(selectedFilters);
      
      if (error) {
        console.error('Error fetching management data:', error);
        // Fall back to mock data for demonstration
      }
      
      // Use real data if available, otherwise use mock data
      const mockData = {
        overview: {
          totalEnrollments: 847,
          pendingRegistrations: 156,
          completionRate: 78.4,
          documentationPending: 89,
          avgProcessingTime: 4.2,
          trends: {
            enrollments: '+12.5%',
            registrations: '+8.7%',
            completion: '+5.3%',
            processingTime: '-15.2%'
          }
        },
        statusDistribution: [
          { status: 'Application Review', count: 125, percentage: 14.8 },
          { status: 'Document Verification', count: 89, percentage: 10.5 },
          { status: 'Payment Processing', count: 67, percentage: 7.9 },
          { status: 'Course Assignment', count: 45, percentage: 5.3 },
          { status: 'Completed', count: 521, percentage: 61.5 }
        ],
        processingTrends: [
          { month: 'Jan', enrollments: 78, registrations: 65, completion: 75 },
          { month: 'Feb', enrollments: 92, registrations: 78, completion: 82 },
          { month: 'Mar', enrollments: 105, registrations: 89, completion: 85 },
          { month: 'Apr', enrollments: 118, registrations: 95, completion: 78 },
          { month: 'May', enrollments: 132, registrations: 108, completion: 81 },
          { month: 'Jun', enrollments: 147, registrations: 125, completion: 85 }
        ],
        documentationAnalytics: [
          { type: 'ID Documents', submitted: 456, verified: 432, pending: 24, rate: 94.7 },
          { type: 'Academic Records', submitted: 425, verified: 398, pending: 27, rate: 93.6 },
          { type: 'Medical Certificates', submitted: 389, verified: 365, pending: 24, rate: 93.8 },
          { type: 'Payment Receipts', submitted: 478, verified: 456, pending: 22, rate: 95.4 }
        ],
        workflowMetrics: [
          { stage: 'Initial Application', avgTime: 2.1, target: 2.0, efficiency: 95 },
          { stage: 'Document Review', avgTime: 3.4, target: 3.0, efficiency: 88 },
          { stage: 'Verification Process', avgTime: 5.2, target: 4.0, efficiency: 77 },
          { stage: 'Final Approval', avgTime: 1.8, target: 2.0, efficiency: 111 }
        ]
      };
      
      setManagementData(data || mockData);
    } catch (error) {
      console.error('Error fetching management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortingMethods = [
    { value: 'priority_score', label: 'Priority Score (AI-based)' },
    { value: 'date_submitted', label: 'Date Submitted' },
    { value: 'document_completeness', label: 'Document Completeness' },
    { value: 'payment_status', label: 'Payment Status' },
    { value: 'program_capacity', label: 'Program Capacity' },
    { value: 'counselor_workload', label: 'Counselor Workload' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pipeline', label: 'Processing Pipeline', icon: Users },
    { id: 'documentation', label: 'Documentation Management', icon: FileText },
    { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp },
    { id: 'workflow', label: 'Workflow Configuration', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {managementData?.overview.totalEnrollments.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {managementData?.overview.trends.enrollments} from last period
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Registrations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {managementData?.overview.pendingRegistrations}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {managementData?.overview.trends.registrations} from last period
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {managementData?.overview.completionRate}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {managementData?.overview.trends.completion} from last period
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Processing Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {managementData?.overview.avgProcessingTime} days
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {managementData?.overview.trends.processingTime} from last period
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </MagicCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={managementData?.processingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrollments" stroke="#8884d8" name="Enrollments" />
              <Line type="monotone" dataKey="registrations" stroke="#82ca9d" name="Registrations" />
              <Line type="monotone" dataKey="completion" stroke="#ffc658" name="Completion Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </MagicCard>

        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={managementData?.statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ status, percentage }) => `${status} (${percentage.toFixed(1)}%)`}
              >
                {managementData?.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </MagicCard>
      </div>
    </div>
  );

  // Simplified render functions for other tabs
  const renderPipeline = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Student Processing Pipeline</h3>
        <div className="space-y-4">
          {managementData?.statusDistribution.map((status, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  status.status === 'Completed' ? 'bg-green-500' :
                  status.status.includes('Pending') ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <span className="font-medium">{status.status}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold">{status.count}</span>
                <span className="text-sm text-gray-500">{status.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </MagicCard>
    </div>
  );

  const renderDocumentation = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Documentation Analytics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Document Type</th>
                <th className="text-right py-3 px-4">Submitted</th>
                <th className="text-right py-3 px-4">Verified</th>
                <th className="text-right py-3 px-4">Pending</th>
                <th className="text-right py-3 px-4">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {managementData?.documentationAnalytics.map((doc, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4 font-medium">{doc.type}</td>
                  <td className="text-right py-3 px-4">{doc.submitted}</td>
                  <td className="text-right py-3 px-4">{doc.verified}</td>
                  <td className="text-right py-3 px-4">{doc.pending}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      doc.rate > 95 ? 'bg-green-100 text-green-800' : 
                      doc.rate > 90 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.rate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MagicCard>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Workflow Efficiency Metrics</h3>
        <div className="space-y-4">
          {managementData?.workflowMetrics.map((stage, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{stage.stage}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  stage.efficiency > 100 ? 'bg-green-100 text-green-800' :
                  stage.efficiency > 85 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stage.efficiency}% efficiency
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Avg Time: {stage.avgTime} days</span>
                <span>Target: {stage.target} days</span>
              </div>
            </div>
          ))}
        </div>
      </MagicCard>
    </div>
  );

  const renderWorkflow = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sorting Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Sorting Method</label>
            <select
              value={sortingMethod}
              onChange={async (e) => {
                const newMethod = e.target.value;
                setSortingMethod(newMethod);
                await updateSortingMethod(newMethod);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {sortingMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Current Method:</strong> {sortingMethods.find(m => m.value === sortingMethod)?.label}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              This sorting method optimizes the registration to enrollment workflow for better processing efficiency.
            </p>
          </div>
        </div>
      </MagicCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'pipeline': return renderPipeline();
      case 'documentation': return renderDocumentation();
      case 'analytics': return renderAnalytics();
      case 'workflow': return renderWorkflow();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <AnimatedGradientText className="text-3xl font-bold mb-2">
            Enrollment & Registration Management
          </AnimatedGradientText>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive oversight and management of student enrollment and registration processes
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={selectedFilters.program}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, program: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Programs</option>
          </select>
          
          <ShimmerButton onClick={async () => {
            const { data } = await exportAnalyticsReport('enrollment_registration', selectedFilters);
            if (data?.filename) {
              console.log(`Report exported: ${data.filename}`);
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </ShimmerButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnrollmentRegistrationManagement; 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { MagicCard } from '../ui/MagicCard';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ShimmerButton } from '../ui/ShimmerButton';
import {
  getPerformanceDashboard,
  getCounselorDetails,
  getAllCounselors,
  createInteraction,
  updateAssignment,
  transferAssignment,
  autoAssignInquiry,
  calculatePerformanceMetrics,
  getCounselorComparison
} from '../../lib/api/counselors';

const CounselorPerformance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [counselorDetails, setCounselorDetails] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  
  // Modal states
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Redirect if user is not a manager
  useEffect(() => {
    if (user && user.role !== 'manager') {
      window.location.href = '/dashboard';
      return;
    }
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user?.role === 'manager') {
      fetchDashboardData();
      fetchCounselors();
    }
  }, [user, selectedPeriod]);

  // Load counselor details when selected
  useEffect(() => {
    if (selectedCounselor) {
      fetchCounselorDetails(selectedCounselor);
    }
  }, [selectedCounselor]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResult, comparisonResult] = await Promise.all([
        getPerformanceDashboard(selectedPeriod),
        getCounselorComparison(selectedPeriod)
      ]);

      if (dashboardResult.error) {
        throw new Error(dashboardResult.error);
      }
      if (comparisonResult.error) {
        throw new Error(comparisonResult.error);
      }

      setDashboardData(dashboardResult.data);
      setComparisonData(comparisonResult.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const result = await getAllCounselors();
      if (result.error) {
        throw new Error(result.error);
      }
      setCounselors(result.data || []);
    } catch (err) {
      console.error('Error fetching counselors:', err);
      setError(err.message);
    }
  };

  const fetchCounselorDetails = async (counselorId) => {
    try {
      setLoading(true);
      const result = await getCounselorDetails(counselorId);
      if (result.error) {
        throw new Error(result.error);
      }
      setCounselorDetails(result.data);
    } catch (err) {
      console.error('Error fetching counselor details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateMetrics = async (counselorId) => {
    try {
      const result = await calculatePerformanceMetrics(counselorId, selectedPeriod);
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh data
      await fetchDashboardData();
      if (selectedCounselor === counselorId) {
        await fetchCounselorDetails(counselorId);
      }
      
      alert('Performance metrics recalculated successfully!');
    } catch (err) {
      console.error('Error recalculating metrics:', err);
      alert('Failed to recalculate metrics: ' + err.message);
    }
  };

  const renderHeader = () => (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
      <div>
        <AnimatedGradientText className="text-3xl font-bold mb-2">
          Counselor Performance Management
        </AnimatedGradientText>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and optimize counselor effectiveness and student interactions
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>

        <ShimmerButton
          onClick={() => fetchDashboardData()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          🔄 Refresh
        </ShimmerButton>
      </div>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
      {[
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'performance', label: 'Performance', icon: '📈' },
        { id: 'workload', label: 'Workload', icon: '⚖️' },
        { id: 'interactions', label: 'Interactions', icon: '💬' },
        { id: 'comparison', label: 'Comparison', icon: '📋' }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderOverviewCards = () => {
    if (!dashboardData?.statistics) return null;

    const stats = dashboardData.statistics;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Counselors</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalCounselors}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            {stats.activeCounselors} active this week
          </p>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgConversionRate}%</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalConversionsThisMonth} conversions this month
          </p>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgSatisfaction}/5</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on student feedback</p>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Interactions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalInteractionsThisMonth}</p>
            </div>
            <div className="text-3xl">💬</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All counselor interactions</p>
        </MagicCard>
      </div>
    );
  };

  const renderCounselorGrid = () => {
    const teamData = dashboardData?.teamOverview || [];
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamData.map((counselor) => (
          <MagicCard 
            key={counselor.counselor_id} 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCounselor(counselor.counselor_id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {counselor.counselor_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {counselor.counselor_email}
                </p>
              </div>
              <div className="text-2xl">👤</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className={`text-sm font-semibold ${
                  counselor.conversion_rate_percentage >= 70 ? 'text-green-600' :
                  counselor.conversion_rate_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {counselor.conversion_rate_percentage || 0}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Interactions (Month)</span>
                <span className="text-sm font-semibold text-blue-600">
                  {counselor.interactions_this_month || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfaction</span>
                <span className="text-sm font-semibold text-yellow-600">
                  {counselor.overall_avg_satisfaction ? `${counselor.overall_avg_satisfaction}/5` : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-xs text-gray-500">
                  {counselor.last_interaction_date 
                    ? new Date(counselor.last_interaction_date).toLocaleDateString()
                    : 'No recent activity'
                  }
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRecalculateMetrics(counselor.counselor_id);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  📊 Recalculate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCounselor(counselor.counselor_id);
                    setActiveTab('performance');
                  }}
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                >
                  📈 Details
                </button>
              </div>
            </div>
          </MagicCard>
        ))}
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!selectedCounselor || !counselorDetails) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Counselor</h3>
          <p className="text-gray-500">Choose a counselor from the overview to view detailed performance metrics</p>
        </div>
      );
    }

    const { counselor, assignments, interactions, metrics } = counselorDetails;
    const latestMetric = metrics?.[0];

    return (
      <div className="space-y-6">
        {/* Counselor Header */}
        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {counselor.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {counselor.full_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{counselor.email}</p>
                <p className="text-sm text-gray-500">
                  Joined: {new Date(counselor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              {latestMetric && (
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  latestMetric.efficiency_rating === 'excellent' ? 'bg-green-100 text-green-800' :
                  latestMetric.efficiency_rating === 'good' ? 'bg-blue-100 text-blue-800' :
                  latestMetric.efficiency_rating === 'average' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {latestMetric.efficiency_rating?.toUpperCase()} ({latestMetric.performance_score.toFixed(1)})
                </div>
              )}
            </div>
          </div>
        </MagicCard>

        {/* Performance Metrics */}
        {latestMetric && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MagicCard className="p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-2xl font-bold text-blue-600">{latestMetric.total_assignments}</div>
                <div className="text-sm text-gray-600">Total Assignments</div>
                <div className="text-xs text-green-600 mt-1">
                  {latestMetric.active_assignments} active
                </div>
              </div>
            </MagicCard>

            <MagicCard className="p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-2xl font-bold text-green-600">{latestMetric.conversion_rate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {latestMetric.inquiries_converted}/{latestMetric.total_inquiries_handled} converted
                </div>
              </div>
            </MagicCard>

            <MagicCard className="p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {latestMetric.average_satisfaction_rating.toFixed(1)}/5
                </div>
                <div className="text-sm text-gray-600">Avg Satisfaction</div>
              </div>
            </MagicCard>

            <MagicCard className="p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-purple-600">
                  {latestMetric.average_interaction_duration_minutes.toFixed(0)}m
                </div>
                <div className="text-sm text-gray-600">Avg Duration</div>
                <div className="text-xs text-gray-500 mt-1">
                  {latestMetric.total_interactions} interactions
                </div>
              </div>
            </MagicCard>
          </div>
        )}

        {/* Recent Assignments */}
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Assignments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Inquiry</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Priority</th>
                  <th className="text-left py-2">Assigned Date</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments?.slice(0, 10).map((assignment) => (
                  <tr key={assignment.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">
                      <div>
                        <div className="font-medium">{assignment.inquiries?.name}</div>
                        <div className="text-xs text-gray-500">{assignment.inquiries?.email}</div>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        assignment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        assignment.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.priority}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">
                      {new Date(assignment.assigned_date).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MagicCard>
      </div>
    );
  };

  const renderComparisonTab = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Counselor Performance Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3">Counselor</th>
                <th className="text-center py-3">Performance Score</th>
                <th className="text-center py-3">Conversion Rate</th>
                <th className="text-center py-3">Assignments</th>
                <th className="text-center py-3">Satisfaction</th>
                <th className="text-center py-3">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((metric, index) => (
                <tr key={metric.counselor_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {metric.users?.full_name?.charAt(0) || '#'}
                      </div>
                      <div>
                        <div className="font-medium">{metric.users?.full_name}</div>
                        <div className="text-xs text-gray-500">{metric.users?.email}</div>
                      </div>
                      {index < 3 && (
                        <div className="text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {metric.performance_score.toFixed(1)}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className={`text-lg font-bold ${
                      metric.conversion_rate >= 70 ? 'text-green-600' :
                      metric.conversion_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.conversion_rate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="text-gray-600">
                      {metric.total_assignments}
                      <div className="text-xs text-green-600">
                        {metric.active_assignments} active
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="text-yellow-600 font-bold">
                      {metric.average_satisfaction_rating.toFixed(1)}/5
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      metric.efficiency_rating === 'excellent' ? 'bg-green-100 text-green-800' :
                      metric.efficiency_rating === 'good' ? 'bg-blue-100 text-blue-800' :
                      metric.efficiency_rating === 'average' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.efficiency_rating}
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

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading counselor performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <ShimmerButton
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Retry
        </ShimmerButton>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {renderHeader()}
      {renderTabNavigation()}
      
      {activeTab === 'overview' && (
        <div>
          {renderOverviewCards()}
          {renderCounselorGrid()}
        </div>
      )}
      
      {activeTab === 'performance' && renderPerformanceTab()}
      {activeTab === 'comparison' && renderComparisonTab()}
      
      {activeTab === 'workload' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Workload Management</h3>
          <p className="text-gray-500">Workload balancing and assignment management features coming soon...</p>
        </div>
      )}
      
      {activeTab === 'interactions' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Interaction Analytics</h3>
          <p className="text-gray-500">Detailed interaction tracking and analytics coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default CounselorPerformance; 
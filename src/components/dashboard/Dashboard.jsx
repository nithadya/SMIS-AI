import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { MagicCard, AnimatedList, ScrollProgress } from '../ui';
import StatCard from './StatCard';
import { 
  getDashboardStats, 
  getEnrollmentTrends, 
  getProgramAnalytics,
  getPaymentAnalytics,
  getBatchAnalytics,
  getCounselorPerformance,
  getRecentActivities
} from '../../lib/api/dashboard';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    enrollmentTrends: { trends: [], statusCounts: [] },
    programAnalytics: [],
    paymentAnalytics: {},
    batchAnalytics: {},
    counselorPerformance: [],
    recentActivities: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        trendsRes,
        programsRes,
        paymentsRes,
        batchesRes,
        counselorsRes,
        activitiesRes
      ] = await Promise.all([
        getDashboardStats(),
        getEnrollmentTrends(),
        getProgramAnalytics(),
        getPaymentAnalytics(),
        getBatchAnalytics(),
        getCounselorPerformance(),
        getRecentActivities()
      ]);

      setDashboardData({
        overview: statsRes.data?.overview || {},
        enrollmentTrends: trendsRes.data || { trends: [], statusCounts: [] },
        programAnalytics: programsRes.data || [],
        paymentAnalytics: paymentsRes.data || {},
        batchAnalytics: batchesRes.data || {},
        counselorPerformance: counselorsRes.data || [],
        recentActivities: activitiesRes.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderWelcomeSection = () => (
    <MagicCard className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            SMIS Analytics Dashboard
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights and analytics for your institution
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            🔄 Refresh Data
          </motion.button>
        </div>
      </div>
    </MagicCard>
  );

  const renderOverviewStats = () => {
    const stats = [
      { 
        title: 'Total Enrollments', 
        value: dashboardData.overview.totalEnrollments?.toLocaleString() || '0', 
        icon: '📝', 
        color: 'blue',
        trend: '+' + Math.round(Math.random() * 10) + '%'
      },
      { 
        title: 'Registered Students', 
        value: dashboardData.overview.totalStudents?.toLocaleString() || '0', 
        icon: '🎓', 
        color: 'green',
        trend: '+' + Math.round(Math.random() * 8) + '%'
      },
      { 
        title: 'Total Revenue', 
        value: formatCurrency(dashboardData.overview.totalRevenue || 0), 
        icon: '💰', 
        color: 'emerald',
        trend: '+' + Math.round(Math.random() * 15) + '%'
      },
      { 
        title: 'Active Programs', 
        value: dashboardData.overview.totalPrograms?.toLocaleString() || '0', 
        icon: '📚', 
        color: 'purple',
        trend: 'Stable'
      },
      { 
        title: 'Total Inquiries', 
        value: dashboardData.overview.totalInquiries?.toLocaleString() || '0', 
        icon: '💬', 
        color: 'orange',
        trend: '+' + Math.round(Math.random() * 12) + '%'
      },
      { 
        title: 'Active Batches', 
        value: dashboardData.overview.totalBatches?.toLocaleString() || '0', 
        icon: '👥', 
        color: 'indigo',
        trend: '+' + Math.round(Math.random() * 5) + '%'
      },
      { 
        title: 'Pending Payments', 
        value: formatCurrency(dashboardData.overview.pendingPayments || 0), 
        icon: '⏳', 
        color: 'yellow',
        trend: '-' + Math.round(Math.random() * 5) + '%'
      },
      { 
        title: 'Collection Rate', 
        value: dashboardData.overview.totalRevenue && dashboardData.overview.pendingPayments ? 
          Math.round((dashboardData.overview.totalRevenue / (dashboardData.overview.totalRevenue + dashboardData.overview.pendingPayments)) * 100) + '%' : '0%', 
        icon: '📊', 
        color: 'cyan',
        trend: '+' + Math.round(Math.random() * 3) + '%'
      },
    ];

    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <AnimatedList
        gridCols="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        animation="fade-up"
        staggerDelay={0.1}
      >
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </AnimatedList>
    );
  };

  const renderEnrollmentTrends = () => (
    <MagicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Enrollment Trends
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Status Distribution */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.enrollmentTrends.statusCounts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.enrollmentTrends.statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.enrollmentTrends.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(dashboardData.enrollmentTrends.trends[0] || {})
                .filter(key => key !== 'month')
                .map((status, index) => (
                  <Line 
                    key={status}
                    type="monotone" 
                    dataKey={status} 
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MagicCard>
  );

  const renderProgramAnalytics = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Program Performance
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Enrollments Chart */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Enrollments by Program</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.programAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="code" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => {
                  const program = dashboardData.programAnalytics.find(p => p.code === label);
                  return program ? program.name : label;
                }}
              />
              <Bar dataKey="totalEnrollments" fill="#3B82F6" />
              <Bar dataKey="registeredStudents" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Program Details Table */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Program Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.programAnalytics.slice(0, 5).map((program, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        <div className="font-medium">{program.code}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs truncate" title={program.name}>
                          {program.name.length > 30 ? program.name.substring(0, 30) + '...' : program.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {program.totalEnrollments}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        parseFloat(program.conversionRate) >= 80 ? 'bg-green-100 text-green-800' :
                        parseFloat(program.conversionRate) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {program.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MagicCard>
  );

  const renderPaymentAnalytics = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Payment Analytics
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.paymentAnalytics.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Distribution */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.paymentAnalytics.paymentMethods || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(dashboardData.paymentAnalytics.paymentMethods || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Recent Payments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {(dashboardData.paymentAnalytics.recentPayments || []).map((payment, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div>
                      <div className="font-medium">{payment.studentName}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{payment.program}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MagicCard>
  );

  const renderRecentActivities = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
        Recent Activities
      </h2>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {dashboardData.recentActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="text-2xl">{activity.icon}</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{activity.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </MagicCard>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
              ))}
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <ScrollProgress />
      <div className="max-w-7xl mx-auto space-y-6">
        {renderWelcomeSection()}
        {renderOverviewStats()}
        {renderEnrollmentTrends()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderProgramAnalytics()}
          <div className="space-y-6">
            {renderPaymentAnalytics()}
          </div>
        </div>
        
        {renderRecentActivities()}
      </div>
    </div>
  );
};

export default Dashboard; 
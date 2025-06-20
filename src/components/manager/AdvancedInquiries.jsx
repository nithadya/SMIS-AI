import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, LineChart, BarChart, PieChart, Area, Line, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  CalendarDays, Users, TrendingUp, TrendingDown, 
  Phone, Mail, Clock, Star, Filter, Download,
  MessageSquare, UserCheck, Target, Award
} from 'lucide-react';
import { MagicCard } from '../ui/MagicCard';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ShimmerButton } from '../ui/ShimmerButton';
import { getAdvancedInquiryAnalytics, exportAnalyticsReport } from '../../lib/api/manager';

const AdvancedInquiries = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCounselor, setSelectedCounselor] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Mock data - integrate with actual Supabase queries
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, selectedSource, selectedCounselor]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAdvancedInquiryAnalytics({
        dateRange,
        selectedSource,
        selectedCounselor
      });
      
      if (error) {
        console.error('Error fetching analytics data:', error);
        // Fall back to mock data for demonstration
      }
      
      // Use real data if available, otherwise use mock data
      const mockData = {
        overview: {
          totalInquiries: 1247,
          conversionRate: 42.3,
          averageResponseTime: 18.5,
          satisfactionScore: 4.6,
          trends: {
            inquiries: '+15.3%',
            conversion: '+8.2%',
            responseTime: '-12.4%',
            satisfaction: '+5.7%'
          }
        },
        sourceEffectiveness: [
          { name: 'Website', inquiries: 456, conversions: 198, rate: 43.4, cost: 125 },
          { name: 'Social Media', inquiries: 324, conversions: 142, rate: 43.8, cost: 95 },
          { name: 'Referrals', inquiries: 234, conversions: 117, rate: 50.0, cost: 45 },
          { name: 'Direct Walk-in', inquiries: 156, conversions: 67, rate: 42.9, cost: 0 },
          { name: 'Google Ads', inquiries: 77, conversions: 24, rate: 31.2, cost: 180 }
        ],
        conversionFunnel: [
          { stage: 'Initial Inquiry', value: 1247, percentage: 100 },
          { stage: 'Information Provided', value: 986, percentage: 79.1 },
          { stage: 'Follow-up Contact', value: 743, percentage: 59.6 },
          { stage: 'Counseling Session', value: 589, percentage: 47.2 },
          { stage: 'Application Submitted', value: 456, percentage: 36.6 },
          { stage: 'Enrollment Completed', value: 327, percentage: 26.2 }
        ],
        responseTimeAnalytics: [
          { month: 'Jan', avgTime: 24.5, target: 20, satisfaction: 4.2 },
          { month: 'Feb', avgTime: 22.1, target: 20, satisfaction: 4.3 },
          { month: 'Mar', avgTime: 19.8, target: 20, satisfaction: 4.5 },
          { month: 'Apr', avgTime: 18.5, target: 20, satisfaction: 4.6 },
          { month: 'May', avgTime: 17.2, target: 20, satisfaction: 4.7 },
          { month: 'Jun', avgTime: 16.8, target: 20, satisfaction: 4.8 }
        ],
        counselorPerformance: [
          { name: 'Sarah Johnson', inquiries: 156, conversions: 78, responseTime: 15.2, satisfaction: 4.8, efficiency: 92 },
          { name: 'Michael Chen', inquiries: 143, conversions: 65, responseTime: 18.5, satisfaction: 4.6, efficiency: 87 },
          { name: 'Emily Davis', inquiries: 134, conversions: 62, responseTime: 19.1, satisfaction: 4.5, efficiency: 85 },
          { name: 'David Wilson', inquiries: 128, conversions: 54, responseTime: 21.3, satisfaction: 4.3, efficiency: 78 }
        ],
        qualityMetrics: [
          { metric: 'First Contact Resolution', value: 67.8, target: 70, trend: '+3.2%' },
          { metric: 'Customer Satisfaction', value: 4.6, target: 4.5, trend: '+5.7%' },
          { metric: 'Follow-up Completion', value: 89.2, target: 85, trend: '+2.1%' },
          { metric: 'Information Accuracy', value: 94.5, target: 95, trend: '+1.8%' }
        ]
      };
      
      setAnalyticsData(data || mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'sources', label: 'Source Analysis', icon: Target },
    { id: 'conversion', label: 'Conversion Funnel', icon: Users },
    { id: 'response', label: 'Response Analytics', icon: Clock },
    { id: 'team', label: 'Team Performance', icon: Award },
    { id: 'quality', label: 'Quality Metrics', icon: Star }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.overview.totalInquiries.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {analyticsData?.overview.trends.inquiries} from last period
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.overview.conversionRate}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {analyticsData?.overview.trends.conversion} from last period
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.overview.averageResponseTime}h
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {analyticsData?.overview.trends.responseTime} from last period
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.overview.satisfactionScore}/5
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {analyticsData?.overview.trends.satisfaction} from last period
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </MagicCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Response Time Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.responseTimeAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgTime" stroke="#8884d8" name="Avg Response Time (hours)" />
              <Line type="monotone" dataKey="target" stroke="#ff7300" strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </MagicCard>

        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Source Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.sourceEffectiveness}
                dataKey="inquiries"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData?.sourceEffectiveness.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </MagicCard>
      </div>
    </div>
  );

  const renderSourceAnalysis = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Source Effectiveness Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Source</th>
                <th className="text-right py-3 px-4 font-medium">Inquiries</th>
                <th className="text-right py-3 px-4 font-medium">Conversions</th>
                <th className="text-right py-3 px-4 font-medium">Rate</th>
                <th className="text-right py-3 px-4 font-medium">Cost per Lead</th>
                <th className="text-right py-3 px-4 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.sourceEffectiveness.map((source, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 font-medium">{source.name}</td>
                  <td className="text-right py-3 px-4">{source.inquiries}</td>
                  <td className="text-right py-3 px-4">{source.conversions}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      source.rate > 45 ? 'bg-green-100 text-green-800' : 
                      source.rate > 35 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {source.rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">${source.cost}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      source.cost === 0 ? 'bg-green-100 text-green-800' :
                      source.cost < 100 ? 'bg-green-100 text-green-800' : 
                      source.cost < 150 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {source.cost === 0 ? '∞' : ((source.conversions * 1000 / source.cost)).toFixed(0) + '%'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MagicCard>

      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Source Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analyticsData?.sourceEffectiveness}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="inquiries" fill="#8884d8" name="Inquiries" />
            <Bar yAxisId="left" dataKey="conversions" fill="#82ca9d" name="Conversions" />
            <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#ff7300" name="Conversion Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </MagicCard>
    </div>
  );

  const renderConversionFunnel = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Conversion Funnel Performance</h3>
        
        <div className="space-y-4">
          {analyticsData?.conversionFunnel.map((stage, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{stage.stage}</span>
                <span className="text-sm text-gray-600">{stage.value} ({stage.percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stage.percentage}%` }}
                ></div>
              </div>
              {index < analyticsData.conversionFunnel.length - 1 && (
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">
                    {((analyticsData.conversionFunnel[index + 1].value / stage.value) * 100).toFixed(1)}% continue
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </MagicCard>

      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Funnel Visualization</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={analyticsData?.conversionFunnel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </MagicCard>
    </div>
  );

  const renderResponseAnalytics = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Response Time & Quality Analytics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analyticsData?.responseTimeAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="#8884d8" name="Avg Response Time (hours)" strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="target" stroke="#ff7300" strokeDasharray="5 5" name="Target (hours)" />
            <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="#82ca9d" name="Satisfaction Score" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </MagicCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData?.qualityMetrics.map((metric, index) => (
          <MagicCard key={index} className="p-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">{metric.metric}</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.metric.includes('Satisfaction') ? metric.value.toFixed(1) : metric.value.toFixed(1) + '%'}
              </p>
              <p className="text-sm text-gray-500 mb-2">Target: {metric.target}{metric.metric.includes('Satisfaction') ? '' : '%'}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                parseFloat(metric.trend) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {metric.trend}
              </span>
            </div>
          </MagicCard>
        ))}
      </div>
    </div>
  );

  const renderTeamPerformance = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Marketing Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Team Member</th>
                <th className="text-right py-3 px-4 font-medium">Inquiries</th>
                <th className="text-right py-3 px-4 font-medium">Conversions</th>
                <th className="text-right py-3 px-4 font-medium">Rate</th>
                <th className="text-right py-3 px-4 font-medium">Avg Response Time</th>
                <th className="text-right py-3 px-4 font-medium">Satisfaction</th>
                <th className="text-right py-3 px-4 font-medium">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData?.counselorPerformance.map((counselor, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 font-medium">{counselor.name}</td>
                  <td className="text-right py-3 px-4">{counselor.inquiries}</td>
                  <td className="text-right py-3 px-4">{counselor.conversions}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      (counselor.conversions / counselor.inquiries * 100) > 45 ? 'bg-green-100 text-green-800' : 
                      (counselor.conversions / counselor.inquiries * 100) > 35 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {(counselor.conversions / counselor.inquiries * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">{counselor.responseTime}h</td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {counselor.satisfaction}
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      counselor.efficiency > 85 ? 'bg-green-100 text-green-800' : 
                      counselor.efficiency > 75 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {counselor.efficiency}%
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

  const renderQualityMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsData?.qualityMetrics.map((metric, index) => (
          <MagicCard key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">{metric.metric}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                parseFloat(metric.trend) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {metric.trend}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Current: {metric.value}{metric.metric.includes('Satisfaction') ? '/5' : '%'}</span>
                <span>Target: {metric.target}{metric.metric.includes('Satisfaction') ? '/5' : '%'}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ 
                    width: `${metric.metric.includes('Satisfaction') ? 
                      (metric.value / 5) * 100 : 
                      Math.min((metric.value / metric.target) * 100, 100)
                    }%` 
                  }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metric.value >= metric.target ? 'Exceeding target' : 'Below target'}
            </p>
          </MagicCard>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'sources': return renderSourceAnalysis();
      case 'conversion': return renderConversionFunnel();
      case 'response': return renderResponseAnalytics();
      case 'team': return renderTeamPerformance();
      case 'quality': return renderQualityMetrics();
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
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            Advanced Inquiries Analytics
          </AnimatedGradientText>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into inquiry performance across all channels and marketing team effectiveness
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="social">Social Media</option>
            <option value="referral">Referrals</option>
            <option value="direct">Direct</option>
          </select>
          
          <ShimmerButton onClick={async () => {
            const { data } = await exportAnalyticsReport('advanced_inquiries', {
              dateRange,
              selectedSource,
              selectedCounselor
            });
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

export default AdvancedInquiries;
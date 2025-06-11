import React, { useState, useEffect } from 'react';
import { AreaChart, LineChart, BarChart, PieChart, Area, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, DatePicker, Space, Table, Tag, Progress } from 'antd';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ShimmerButton } from '../ui/ShimmerButton';
import { MagicCard } from '../ui/MagicCard';
import { motion } from 'framer-motion';

const { RangePicker } = DatePicker;

const AdvancedInquiryManagement = () => {
  const [dateRange, setDateRange] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [conversionData, setConversionData] = useState([]);
  const [responseMetrics, setResponseMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSourceData([
        { name: 'Website', value: 150, conversion: 45 },
        { name: 'Social Media', value: 120, conversion: 38 },
        { name: 'Referrals', value: 80, conversion: 52 },
        { name: 'Direct', value: 60, conversion: 40 },
      ]);

      setConversionData([
        { name: 'Initial Contact', value: 100 },
        { name: 'Information Shared', value: 75 },
        { name: 'Follow-up', value: 50 },
        { name: 'Application', value: 35 },
        { name: 'Enrollment', value: 25 },
      ]);

      setResponseMetrics([
        { date: '2024-01', avgTime: 25, satisfaction: 85 },
        { date: '2024-02', avgTime: 22, satisfaction: 88 },
        { date: '2024-03', avgTime: 18, satisfaction: 92 },
        { date: '2024-04', avgTime: 15, satisfaction: 95 },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: 'Marketing Team Member',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Avg Response Time',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time) => <Tag color={time < 30 ? 'success' : 'warning'}>{time} mins</Tag>,
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (rate) => <Progress percent={rate} size="small" />,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <AnimatedGradientText className="text-3xl font-bold mb-2">
            Advanced Inquiry Analytics
          </AnimatedGradientText>
          <p className="text-gray-500 dark:text-gray-400">
            Comprehensive insights into inquiry performance and marketing effectiveness
          </p>
        </div>
        <Space>
          <RangePicker onChange={(dates) => setDateRange(dates)} />
          <ShimmerButton>Generate Report</ShimmerButton>
        </Space>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MagicCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Source Effectiveness</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </MagicCard>

        <MagicCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </MagicCard>

        <MagicCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Response Time Analytics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgTime" stroke="#8884d8" name="Avg Response Time" />
              <Line type="monotone" dataKey="satisfaction" stroke="#82ca9d" name="Satisfaction %" />
            </LineChart>
          </ResponsiveContainer>
        </MagicCard>
      </div>

      <MagicCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Marketing Team Performance</h3>
        <Table 
          columns={columns}
          dataSource={[
            { name: 'John Doe', responseTime: 25, conversionRate: 75 },
            { name: 'Jane Smith', responseTime: 18, conversionRate: 82 },
            { name: 'Mike Johnson', responseTime: 35, conversionRate: 68 },
          ]}
          loading={loading}
        />
      </MagicCard>

      <MagicCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">AI-Driven Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
            <h4 className="font-semibold mb-2">Trend Analysis</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recent uptick in social media inquiries suggests increased brand awareness.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg">
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consider allocating more resources to website optimization based on conversion rates.
            </p>
          </div>
        </div>
      </MagicCard>
    </div>
  );
};

export default AdvancedInquiryManagement; 
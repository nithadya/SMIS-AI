import React, { useState } from 'react';
import { Tabs, Form, Input, Select, Button, Table, Tag, Space, Progress, Upload, DatePicker, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, SortAscendingOutlined, FilterOutlined, BarChartOutlined } from '@ant-design/icons';
import { MagicCard } from '../ui/MagicCard';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ShimmerButton } from '../ui/ShimmerButton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const EnrollmentRegistrationManagement2 = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [sortingMethod, setSortingMethod] = useState('date');
  const [form] = Form.useForm();

  // Mock data for statistics
  const stats = {
    totalEnrollments: 1250,
    pendingRegistrations: 85,
    completionRate: 78,
    documentationPending: 45
  };

  // Mock data for trends
  const trendData = [
    { month: 'Jan', enrollments: 65, registrations: 80 },
    { month: 'Feb', enrollments: 75, registrations: 90 },
    { month: 'Mar', enrollments: 85, registrations: 95 },
    { month: 'Apr', enrollments: 95, registrations: 100 },
    { month: 'May', enrollments: 90, registrations: 110 },
    { month: 'Jun', enrollments: 100, registrations: 120 },
  ];

  const enrollmentStatuses = [
    'Pending',
    'Document Verification',
    'Fee Payment',
    'Course Selection',
    'Completed'
  ];

  const registrationStatuses = [
    'Application Submitted',
    'Under Review',
    'Interview Scheduled',
    'Accepted',
    'Rejected'
  ];

  const sortingMethods = [
    { value: 'date', label: 'Registration Date' },
    { value: 'priority', label: 'Priority Level' },
    { value: 'program', label: 'Program' },
    { value: 'status', label: 'Status' },
    { value: 'completion', label: 'Completion Progress' }
  ];

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Program',
      dataIndex: 'program',
      key: 'program',
      filters: [
        { text: 'Computer Science', value: 'Computer Science' },
        { text: 'Business Admin', value: 'Business Admin' },
      ],
    },
    {
      title: 'Registration Status',
      dataIndex: 'registrationStatus',
      key: 'registrationStatus',
      render: (status) => (
        <Tag color={status === 'Accepted' ? 'success' : status === 'Rejected' ? 'error' : 'processing'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Enrollment Progress',
      dataIndex: 'enrollmentProgress',
      key: 'enrollmentProgress',
      render: (progress) => <Progress percent={progress} size="small" />,
    },
    {
      title: 'Documents',
      dataIndex: 'documents',
      key: 'documents',
      render: (docs) => (
        <Tag color={docs === 'Complete' ? 'success' : 'warning'}>
          {docs}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>View</Button>
          <Button type="link" onClick={() => handleUpdateStatus(record)}>Update</Button>
        </Space>
      ),
    },
  ];

  // Mock data for the table
  const [data] = useState([
    {
      key: '1',
      name: 'John Doe',
      program: 'Computer Science',
      registrationStatus: 'Accepted',
      enrollmentProgress: 75,
      documents: 'Complete',
    },
    // Add more mock data as needed
  ]);

  const handleSortingMethodChange = (value) => {
    setSortingMethod(value);
    // Implement sorting logic here
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setActiveTab('2');
  };

  const handleUpdateStatus = (record) => {
    // Implement status update logic
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <MagicCard>
            <Statistic
              title="Total Enrollments"
              value={stats.totalEnrollments}
              prefix={<BarChartOutlined />}
            />
          </MagicCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MagicCard>
            <Statistic
              title="Pending Registrations"
              value={stats.pendingRegistrations}
              valueStyle={{ color: '#faad14' }}
            />
          </MagicCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MagicCard>
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </MagicCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MagicCard>
            <Statistic
              title="Documentation Pending"
              value={stats.documentationPending}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </MagicCard>
        </Col>
      </Row>

      <MagicCard>
        <h3 className="text-lg font-semibold mb-4">Enrollment & Registration Trends</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="enrollments" stackId="1" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="registrations" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MagicCard>
    </div>
  );

  const renderSortingConfiguration = () => (
    <MagicCard className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sorting Configuration</h3>
        <Select
          value={sortingMethod}
          onChange={handleSortingMethodChange}
          style={{ width: 200 }}
        >
          {sortingMethods.map(method => (
            <Option key={method.value} value={method.value}>{method.label}</Option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Current Method:</h4>
          <p className="text-gray-600 dark:text-gray-400">
            {sortingMethods.find(m => m.value === sortingMethod)?.label}
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Applied To:</h4>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
            <li>New Registration Processing</li>
            <li>Enrollment Queue Management</li>
            <li>Document Verification Order</li>
          </ul>
        </div>
      </div>
    </MagicCard>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400">
          Enrollment & Registration Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Comprehensive management of student enrollment and registration processes
        </p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Dashboard" key="1">
          {renderDashboard()}
        </TabPane>

        <TabPane tab="Enrollment Processing" key="2">
          <div className="space-y-6">
            {renderSortingConfiguration()}
            
            <MagicCard>
              <Table
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 10 }}
                className="mb-6"
              />
            </MagicCard>
          </div>
        </TabPane>

        <TabPane tab="Document Management" key="3">
          <MagicCard>
            <Form layout="vertical" className="max-w-4xl">
              <Form.Item name="documentType" label="Document Type">
                <Select placeholder="Select document type">
                  <Option value="id">ID Proof</Option>
                  <Option value="academic">Academic Records</Option>
                  <Option value="medical">Medical Records</Option>
                  <Option value="financial">Financial Documents</Option>
                </Select>
              </Form.Item>

              <Form.Item name="documents" label="Upload Documents">
                <Upload multiple>
                  <Button icon={<UploadOutlined />}>Upload Files</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="notes" label="Notes">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <ShimmerButton>Save Documents</ShimmerButton>
              </Form.Item>
            </Form>
          </MagicCard>
        </TabPane>

        <TabPane tab="Analytics" key="4">
          <div className="space-y-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <MagicCard>
                  <h3 className="text-lg font-semibold mb-4">Registration Success Rate</h3>
                  <Progress type="circle" percent={75} />
                </MagicCard>
              </Col>
              <Col xs={24} md={12}>
                <MagicCard>
                  <h3 className="text-lg font-semibold mb-4">Document Completion Rate</h3>
                  <Progress type="circle" percent={88} />
                </MagicCard>
              </Col>
            </Row>

            <MagicCard>
              <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="enrollments" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </MagicCard>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default EnrollmentRegistrationManagement2; 
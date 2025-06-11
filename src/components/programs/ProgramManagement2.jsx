import React, { useState } from 'react';
import { Tabs, Form, Input, InputNumber, Select, Button, Table, Tag, Space, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { MagicCard } from '../ui/MagicCard';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ShimmerButton } from '../ui/ShimmerButton';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ProgramManagement2 = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: 'Bachelor of Computer Science',
      duration: '4 years',
      type: 'Undergraduate',
      status: 'Active',
      fee: 12000,
      capacity: 100,
    },
    // Add more mock data as needed
  ]);

  const programTypes = ['Undergraduate', 'Graduate', 'Diploma', 'Certificate', 'Short Course'];
  const statusOptions = ['Active', 'Inactive', 'Draft', 'Archived'];

  const columns = [
    {
      title: 'Program Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Undergraduate' ? 'blue' : type === 'Graduate' ? 'purple' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : status === 'Inactive' ? 'error' : 'warning'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => `$${fee.toLocaleString()}`,
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    message.success('Program details saved successfully!');
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setActiveTab('1');
  };

  const handleDelete = (id) => {
    setPrograms(programs.filter(program => program.id !== id));
    message.success('Program deleted successfully!');
  };

  const learningOutcomesForm = (
    <Form layout="vertical">
      <Form.List name="learningOutcomes">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'outcome']}
                  rules={[{ required: true, message: 'Missing learning outcome' }]}
                >
                  <Input placeholder="Enter learning outcome" style={{ width: '500px' }} />
                </Form.Item>
                <Button type="link" danger onClick={() => remove(name)}>Delete</Button>
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Learning Outcome
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <AnimatedGradientText className="text-3xl font-bold mb-2">
          Program Management
        </AnimatedGradientText>
        <p className="text-gray-500 dark:text-gray-400">
          Comprehensive tools for program creation, modification, and management
        </p>
      </div>

      <MagicCard className="w-full">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Program Details" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="max-w-4xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="name"
                  label="Program Name"
                  rules={[{ required: true, message: 'Please enter program name' }]}
                >
                  <Input placeholder="Enter program name" />
                </Form.Item>

                <Form.Item
                  name="type"
                  label="Program Type"
                  rules={[{ required: true, message: 'Please select program type' }]}
                >
                  <Select placeholder="Select program type">
                    {programTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="duration"
                  label="Duration"
                  rules={[{ required: true, message: 'Please enter duration' }]}
                >
                  <Input placeholder="e.g., 4 years, 2 semesters" />
                </Form.Item>

                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status">
                    {statusOptions.map(status => (
                      <Option key={status} value={status}>{status}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="fee"
                  label="Program Fee"
                  rules={[{ required: true, message: 'Please enter program fee' }]}
                >
                  <InputNumber
                    prefix="$"
                    style={{ width: '100%' }}
                    placeholder="Enter program fee"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  name="capacity"
                  label="Capacity"
                  rules={[{ required: true, message: 'Please enter capacity' }]}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="Enter program capacity" />
                </Form.Item>
              </div>

              <Form.Item
                name="description"
                label="Program Description"
                rules={[{ required: true, message: 'Please enter program description' }]}
              >
                <TextArea rows={4} placeholder="Enter program description" />
              </Form.Item>

              <Form.Item>
                <ShimmerButton type="submit">
                  Save Program Details
                </ShimmerButton>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Learning Outcomes" key="2">
            {learningOutcomesForm}
          </TabPane>

          <TabPane tab="Fee Structure" key="3">
            <Form layout="vertical" className="max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="tuitionFee" label="Tuition Fee">
                  <InputNumber
                    prefix="$"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item name="registrationFee" label="Registration Fee">
                  <InputNumber
                    prefix="$"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item name="labFee" label="Lab Fee">
                  <InputNumber
                    prefix="$"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item name="libraryFee" label="Library Fee">
                  <InputNumber
                    prefix="$"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </div>

              <Form.Item name="feeNotes" label="Additional Notes">
                <TextArea rows={4} placeholder="Enter any additional notes about fees" />
              </Form.Item>

              <Form.Item>
                <ShimmerButton>Save Fee Structure</ShimmerButton>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Marketing Info" key="4">
            <Form layout="vertical" className="max-w-4xl">
              <Form.Item name="marketingDescription" label="Marketing Description">
                <TextArea rows={4} placeholder="Enter marketing description" />
              </Form.Item>

              <Form.Item name="highlights" label="Program Highlights">
                <Form.List name="highlights">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'highlight']}
                            rules={[{ required: true, message: 'Missing highlight' }]}
                          >
                            <Input placeholder="Enter program highlight" style={{ width: '500px' }} />
                          </Form.Item>
                          <Button type="link" danger onClick={() => remove(name)}>Delete</Button>
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Add Highlight
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Form.Item>

              <Form.Item name="brochure" label="Program Brochure">
                <Upload>
                  <Button icon={<UploadOutlined />}>Upload Brochure</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <ShimmerButton>Save Marketing Info</ShimmerButton>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="All Programs" key="5">
            <Table
              columns={columns}
              dataSource={programs}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className="mb-8"
            />
          </TabPane>
        </Tabs>
      </MagicCard>
    </div>
  );
};

export default ProgramManagement2; 
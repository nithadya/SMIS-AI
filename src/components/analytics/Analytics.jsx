import React, { useState } from 'react';
import './Analytics.css';

const Analytics = () => {
  // Mock data for demonstration
  const analyticsData = {
    regionalStats: {
      western: {
        inquiries: 245,
        applications: 180,
        registrations: 120,
        topSchools: [
          { name: 'Royal College', inquiries: 45, applications: 35, registrations: 28 },
          { name: 'Ananda College', inquiries: 38, applications: 30, registrations: 25 },
          { name: 'Visakha Vidyalaya', inquiries: 35, applications: 28, registrations: 22 }
        ]
      },
      central: {
        inquiries: 180,
        applications: 135,
        registrations: 90,
        topSchools: [
          { name: 'Trinity College', inquiries: 40, applications: 32, registrations: 25 },
          { name: 'St. Anthony\'s College', inquiries: 35, applications: 28, registrations: 20 },
          { name: 'Hillwood College', inquiries: 30, applications: 25, registrations: 18 }
        ]
      },
      southern: {
        inquiries: 160,
        applications: 120,
        registrations: 85,
        topSchools: [
          { name: 'Richmond College', inquiries: 38, applications: 30, registrations: 22 },
          { name: 'Mahinda College', inquiries: 32, applications: 25, registrations: 20 },
          { name: 'Southlands College', inquiries: 28, applications: 22, registrations: 15 }
        ]
      }
    },
    campaignPerformance: [
      {
        schoolName: 'Royal College',
        campaignType: 'Career Fair Sponsorship',
        spend: 20000,
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        metrics: {
          leads: 45,
          applications: 35,
          registrations: 28,
          leadsPerSpend: 0.00225
        }
      },
      {
        schoolName: 'Ananda College',
        campaignType: 'Workshop Series',
        spend: 20000,
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        metrics: {
          leads: 38,
          applications: 30,
          registrations: 25,
          leadsPerSpend: 0.0019
        }
      },
      {
        schoolName: 'Trinity College',
        campaignType: 'Sports Event Sponsorship',
        spend: 20000,
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        metrics: {
          leads: 40,
          applications: 32,
          registrations: 25,
          leadsPerSpend: 0.002
        }
      }
    ]
  };

  const [selectedRegion, setSelectedRegion] = useState('western');
  const [dateRange, setDateRange] = useState('month');

  const renderRegionalOverview = () => (
    <div className="regional-overview">
      <div className="section-header">
        <h3>Regional Performance</h3>
        <div className="filters">
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="western">Western Province</option>
            <option value="central">Central Province</option>
            <option value="southern">Southern Province</option>
          </select>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-value">{analyticsData.regionalStats[selectedRegion].inquiries}</span>
          <span className="metric-label">Total Inquiries</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{analyticsData.regionalStats[selectedRegion].applications}</span>
          <span className="metric-label">Applications</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{analyticsData.regionalStats[selectedRegion].registrations}</span>
          <span className="metric-label">Registrations</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">
            {Math.round((analyticsData.regionalStats[selectedRegion].registrations / 
              analyticsData.regionalStats[selectedRegion].applications) * 100)}%
          </span>
          <span className="metric-label">Conversion Rate</span>
        </div>
      </div>

      <div className="top-schools">
        <h4>Top Performing Schools</h4>
        <div className="schools-table">
          <table>
            <thead>
              <tr>
                <th>School Name</th>
                <th>Inquiries</th>
                <th>Applications</th>
                <th>Registrations</th>
                <th>Conversion</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.regionalStats[selectedRegion].topSchools.map(school => (
                <tr key={school.name}>
                  <td>{school.name}</td>
                  <td>{school.inquiries}</td>
                  <td>{school.applications}</td>
                  <td>{school.registrations}</td>
                  <td>
                    {Math.round((school.registrations / school.applications) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCampaignPerformance = () => (
    <div className="campaign-performance">
      <h3>School Campaign Performance</h3>
      <div className="campaign-cards">
        {analyticsData.campaignPerformance.map(campaign => (
          <div key={campaign.schoolName} className="campaign-card">
            <div className="campaign-header">
              <h4>{campaign.schoolName}</h4>
              <span className="campaign-type">{campaign.campaignType}</span>
            </div>
            <div className="campaign-details">
              <div className="detail-row">
                <span className="label">Campaign Period:</span>
                <span className="value">{campaign.startDate} - {campaign.endDate}</span>
              </div>
              <div className="detail-row">
                <span className="label">Campaign Spend:</span>
                <span className="value">LKR {campaign.spend.toLocaleString()}</span>
              </div>
            </div>
            <div className="campaign-metrics">
              <div className="metric">
                <span className="value">{campaign.metrics.leads}</span>
                <span className="label">Leads</span>
              </div>
              <div className="metric">
                <span className="value">{campaign.metrics.applications}</span>
                <span className="label">Applications</span>
              </div>
              <div className="metric">
                <span className="value">{campaign.metrics.registrations}</span>
                <span className="label">Registrations</span>
              </div>
              <div className="metric">
                <span className="value">
                  {(campaign.metrics.leadsPerSpend).toFixed(4)}
                </span>
                <span className="label">Leads/LKR</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Track regional performance and campaign effectiveness</p>
        </div>
      </div>

      <div className="analytics-grid">
        {renderRegionalOverview()}
        {renderCampaignPerformance()}
      </div>
    </div>
  );
};

export default Analytics; 
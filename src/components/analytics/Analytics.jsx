import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
          { name: "St. Anthony's College", inquiries: 35, applications: 28, registrations: 20 },
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
    <div className="card backdrop-blur-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-6 border-b border-secondary-200/10 dark:border-secondary-700/10">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Regional Performance
        </h3>
        <div className="flex flex-wrap gap-3">
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="input text-sm min-w-[160px]"
          >
            <option value="western">Western Province</option>
            <option value="central">Central Province</option>
            <option value="southern">Southern Province</option>
          </select>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input text-sm min-w-[160px]"
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass rounded-lg p-4 hover:glow-sm transition-all duration-200"
        >
          <span className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent block mb-1">
            {analyticsData.regionalStats[selectedRegion].inquiries}
          </span>
          <span className="text-sm text-secondary-500 dark:text-secondary-400">Total Inquiries</span>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass rounded-lg p-4 hover:glow-sm transition-all duration-200"
        >
          <span className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent block mb-1">
            {analyticsData.regionalStats[selectedRegion].applications}
          </span>
          <span className="text-sm text-secondary-500 dark:text-secondary-400">Applications</span>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass rounded-lg p-4 hover:glow-sm transition-all duration-200"
        >
          <span className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent block mb-1">
            {analyticsData.regionalStats[selectedRegion].registrations}
          </span>
          <span className="text-sm text-secondary-500 dark:text-secondary-400">Registrations</span>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass rounded-lg p-4 hover:glow-sm transition-all duration-200"
        >
          <span className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent block mb-1">
            {Math.round((analyticsData.regionalStats[selectedRegion].registrations / 
              analyticsData.regionalStats[selectedRegion].applications) * 100)}%
          </span>
          <span className="text-sm text-secondary-500 dark:text-secondary-400">Conversion Rate</span>
        </motion.div>
      </div>

      <div className="p-6">
        <div className="glass rounded-lg p-4">
          <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-4">Top Performing Schools</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200/10 dark:border-secondary-700/10">
                  <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">School Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Inquiries</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Applications</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Registrations</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200/10 dark:divide-secondary-700/10">
                {analyticsData.regionalStats[selectedRegion].topSchools.map(school => (
                  <motion.tr 
                    key={school.name} 
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    className="transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">{school.name}</td>
                    <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">{school.inquiries}</td>
                    <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">{school.applications}</td>
                    <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">{school.registrations}</td>
                    <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                      {Math.round((school.registrations / school.applications) * 100)}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCampaignPerformance = () => (
    <div className="card backdrop-blur-lg mt-6">
      <div className="p-6 border-b border-secondary-200/10 dark:border-secondary-700/10">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          School Campaign Performance
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {analyticsData.campaignPerformance.map(campaign => (
          <motion.div 
            key={campaign.schoolName} 
            whileHover={{ scale: 1.02 }}
            className="glass rounded-lg p-4 hover:glow-sm transition-all duration-200"
          >
            <div className="mb-4">
              <h4 className="text-base font-medium text-secondary-800 dark:text-secondary-200">{campaign.schoolName}</h4>
              <span className="text-sm text-secondary-500 dark:text-secondary-400">{campaign.campaignType}</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500 dark:text-secondary-400">Campaign Period:</span>
                <span className="text-secondary-700 dark:text-secondary-300">{campaign.startDate} - {campaign.endDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500 dark:text-secondary-400">Campaign Spend:</span>
                <span className="text-secondary-700 dark:text-secondary-300">LKR {campaign.spend.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center glass rounded-lg p-2">
                <span className="block text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {campaign.metrics.leads}
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">Leads</span>
              </div>
              <div className="text-center glass rounded-lg p-2">
                <span className="block text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {campaign.metrics.applications}
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">Applications</span>
              </div>
              <div className="text-center glass rounded-lg p-2">
                <span className="block text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {campaign.metrics.registrations}
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">Registrations</span>
              </div>
              <div className="text-center glass rounded-lg p-2">
                <span className="block text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {(campaign.metrics.leadsPerSpend).toFixed(4)}
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">Leads/LKR</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-dots">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-secondary-500 dark:text-secondary-400">Track regional performance and campaign effectiveness</p>
      </div>

      <div>
        {renderRegionalOverview()}
        {renderCampaignPerformance()}
      </div>
    </div>
  );
};

export default Analytics; 
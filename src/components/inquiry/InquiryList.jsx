import React from 'react';

const InquiryList = ({ inquiries, onSelect, filters }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'contacted':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'follow-up':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'converted':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'lost':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Counselor</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Contact</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Follow-up</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {inquiries.map((inquiry) => (
            <tr 
              key={inquiry.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="py-4 px-4 text-sm text-slate-600">{inquiry.id}</td>
              <td className="py-4 px-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">{inquiry.name}</span>
                  <span className="text-xs text-slate-500">{inquiry.email}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-slate-600">{inquiry.program}</td>
              <td className="py-4 px-4 text-sm text-slate-600">{inquiry.source}</td>
              <td className="py-4 px-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(inquiry.status)}`}>
                  {inquiry.status}
                </span>
              </td>
              <td className="py-4 px-4 text-sm text-slate-600">{inquiry.counselor}</td>
              <td className="py-4 px-4 text-sm text-slate-600">{formatDate(inquiry.lastContact)}</td>
              <td className="py-4 px-4 text-sm text-slate-600">{formatDate(inquiry.nextFollowUp)}</td>
              <td className="py-4 px-4">
                <button
                  onClick={() => onSelect(inquiry)}
                  className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InquiryList; 
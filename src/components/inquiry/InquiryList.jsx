import React from 'react';
import Pagination from '../common/Pagination';

const InquiryList = ({ 
  inquiries, 
  onSelect, 
  filters,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange
}) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'contacted':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'follow-up':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'converted':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'lost':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate pagination
  const totalItems = inquiries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInquiries = inquiries.slice(startIndex, endIndex);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Counselor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Follow-up</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentInquiries.map((inquiry) => (
              <tr 
                key={inquiry.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="py-4 px-4 text-sm text-slate-600">
                  {inquiry.id.substring(0, 8)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">{inquiry.name}</span>
                    <span className="text-xs text-slate-500">{inquiry.email}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-slate-600">
                  {inquiry.programs?.name || '-'}
                </td>
                <td className="py-4 px-4 text-sm text-slate-600">
                  {inquiry.sources?.name || '-'}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(inquiry.status)}`}>
                    {inquiry.status || 'new'}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-slate-600">
                  {inquiry.users?.full_name || '-'}
                </td>
                <td className="py-4 px-4 text-sm text-slate-600">
                  {formatDate(inquiry.last_contact)}
                </td>
                <td className="py-4 px-4 text-sm text-slate-600">
                  {formatDate(inquiry.next_follow_up)}
                </td>
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
            {currentInquiries.length === 0 && (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500">
                  {totalItems === 0 ? 'No inquiries found' : 'No inquiries on this page'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      {onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          showInfo={true}
        />
      )}
    </div>
  );
};

export default InquiryList; 
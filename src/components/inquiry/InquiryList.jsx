import React from 'react';
import './InquiryList.css';

const InquiryList = ({ inquiries, onSelect, filters }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'status-new';
      case 'contacted':
        return 'status-contacted';
      case 'follow-up':
        return 'status-follow-up';
      case 'converted':
        return 'status-converted';
      case 'lost':
        return 'status-lost';
      default:
        return '';
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
    <div className="inquiry-list">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Program</th>
              <th>Source</th>
              <th>Status</th>
              <th>Counselor</th>
              <th>Last Contact</th>
              <th>Next Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>{inquiry.id}</td>
                <td>
                  <div className="inquiry-name">
                    <span className="name">{inquiry.name}</span>
                    <span className="email">{inquiry.email}</span>
                  </div>
                </td>
                <td>{inquiry.program}</td>
                <td>{inquiry.source}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </td>
                <td>{inquiry.counselor}</td>
                <td>{formatDate(inquiry.lastContact)}</td>
                <td>{formatDate(inquiry.nextFollowUp)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="button button-secondary"
                      onClick={() => onSelect(inquiry)}
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InquiryList; 
import React from 'react';
import './StudentPayments.css';

const StudentPayments = ({ payments }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  return (
    <div className="student-payments">
      <div className="payment-summary">
        <div className="summary-card">
          <h4>Total Fees</h4>
          <p className="amount">{formatCurrency(payments.totalFees)}</p>
        </div>
        <div className="summary-card">
          <h4>Paid Amount</h4>
          <p className="amount success">{formatCurrency(payments.paidAmount)}</p>
        </div>
        <div className="summary-card">
          <h4>Due Amount</h4>
          <p className="amount warning">{formatCurrency(payments.dueAmount)}</p>
        </div>
        <div className="summary-card">
          <h4>Next Payment Date</h4>
          <p className="date">{payments.nextPaymentDate}</p>
        </div>
      </div>

      <div className="payment-history">
        <h3>Payment History</h3>
        <div className="payment-table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.paymentHistory.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.date}</td>
                  <td>{payment.type}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>
                    <span className={`status-badge ${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPayments; 
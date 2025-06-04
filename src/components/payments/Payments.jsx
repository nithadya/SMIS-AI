import React, { useState } from 'react';
import './Payments.css';

const Payments = () => {
  // Mock data for demonstration
  const paymentData = {
    pendingPayments: [
      {
        id: 'PAY001',
        studentName: 'Alice Cooper',
        program: 'Bachelor of Information Technology',
        amount: 500,
        dueDate: '2024-04-15',
        type: 'Application Fee',
        status: 'Pending'
      },
      {
        id: 'PAY002',
        studentName: 'Bob Wilson',
        program: 'Bachelor of Business Management',
        amount: 1000,
        dueDate: '2024-04-20',
        type: 'Registration Deposit',
        status: 'Processing'
      }
    ],
    recentTransactions: [
      {
        id: 'TRX001',
        studentName: 'Carol Davis',
        amount: 500,
        date: '2024-03-10',
        type: 'Application Fee',
        status: 'Completed',
        paymentMethod: 'Credit Card'
      },
      {
        id: 'TRX002',
        studentName: 'David Brown',
        amount: 1000,
        date: '2024-03-09',
        type: 'Registration Deposit',
        status: 'Completed',
        paymentMethod: 'Bank Transfer'
      }
    ]
  };

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const renderPaymentForm = () => (
    <div className="payment-form">
      <h3>Process New Payment</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Student Name</label>
          <input type="text" placeholder="Enter student name" />
        </div>
        <div className="form-group">
          <label>Payment Type</label>
          <select>
            <option value="">Select payment type</option>
            <option value="application">Application Fee</option>
            <option value="registration">Registration Deposit</option>
            <option value="tuition">Tuition Fee</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input type="number" placeholder="Enter amount" />
        </div>
        <div className="form-group">
          <label>Payment Method</label>
          <select>
            <option value="">Select payment method</option>
            <option value="card">Credit/Debit Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>
      <button className="button button-primary">Process Payment</button>
    </div>
  );

  const renderPendingPayments = () => (
    <div className="pending-payments">
      <h3>Pending Payments</h3>
      <div className="payment-cards">
        {paymentData.pendingPayments.map(payment => (
          <div key={payment.id} className="payment-card">
            <div className="payment-header">
              <h4>{payment.studentName}</h4>
              <span className={`status-badge ${payment.status.toLowerCase()}`}>
                {payment.status}
              </span>
            </div>
            <div className="payment-details">
              <div className="detail-row">
                <span className="label">Program:</span>
                <span className="value">{payment.program}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{payment.type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value">${payment.amount}</span>
              </div>
              <div className="detail-row">
                <span className="label">Due Date:</span>
                <span className="value">{payment.dueDate}</span>
              </div>
            </div>
            <div className="payment-actions">
              <button 
                className="button button-secondary"
                onClick={() => setSelectedPayment(payment)}
              >
                Send Reminder
              </button>
              <button className="button button-primary">Process Payment</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactionHistory = () => (
    <div className="transaction-history">
      <h3>Recent Transactions</h3>
      <div className="transaction-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.recentTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.studentName}</td>
                <td>{transaction.type}</td>
                <td>${transaction.amount}</td>
                <td>{transaction.paymentMethod}</td>
                <td>
                  <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="button button-icon"
                    onClick={() => setShowReceiptModal(true)}
                  >
                    📄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="payments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Payment Management</h1>
          <p>Process and track student payments</p>
        </div>
        <div className="header-actions">
          <button className="button button-primary">New Payment</button>
        </div>
      </div>

      <div className="payments-grid">
        {renderPaymentForm()}
        {renderPendingPayments()}
        {renderTransactionHistory()}
      </div>

      {showReceiptModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Payment Receipt</h3>
            {/* Receipt content */}
            <button 
              className="button button-secondary"
              onClick={() => setShowReceiptModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments; 
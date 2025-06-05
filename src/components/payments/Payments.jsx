import React, { useState } from 'react';

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
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-8">Process New Payment</h3>
      <form className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="studentName">
              Student Name
            </label>
            <input 
              id="studentName"
              type="text" 
              placeholder="Enter student name" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 
                placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 
                focus:ring-blue-500/10 transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="paymentType">
              Payment Type
            </label>
            <select 
              id="paymentType"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 
                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 
                transition-all duration-200"
            >
              <option value="">Select payment type</option>
              <option value="application">Application Fee</option>
              <option value="registration">Registration Deposit</option>
              <option value="tuition">Tuition Fee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="amount">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input 
                id="amount"
                type="number" 
                placeholder="0.00" 
                className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 
                  placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 
                  focus:ring-blue-500/10 transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="paymentMethod">
              Payment Method
            </label>
            <select 
              id="paymentMethod"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 
                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 
                transition-all duration-200"
            >
              <option value="">Select payment method</option>
              <option value="card">Credit/Debit Card</option>
              <option value="bank">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
        <button 
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg 
            hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 
            transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
        >
          Process Payment
        </button>
      </form>
    </div>
  );

  const renderPendingPayments = () => (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-8">Pending Payments</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paymentData.pendingPayments.map(payment => (
          <div 
            key={payment.id} 
            className="group border border-slate-200 rounded-xl p-6 hover:border-blue-200 
              hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-base font-medium text-slate-800 group-hover:text-blue-600 
                transition-colors">
                {payment.studentName}
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${payment.status === 'Pending' 
                  ? 'bg-yellow-50 text-yellow-600' 
                  : 'bg-blue-50 text-blue-600'}`}
              >
                {payment.status}
              </span>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Program:</span>
                <span className="text-slate-700 font-medium">{payment.program}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-700 font-medium">{payment.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount:</span>
                <span className="text-slate-700 font-medium">${payment.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Due Date:</span>
                <span className="text-slate-700 font-medium">{payment.dueDate}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                className="flex-1 px-4 py-2.5 text-sm text-slate-600 bg-slate-100 
                  hover:bg-slate-200 focus:bg-slate-300 rounded-lg transition-all duration-200"
                onClick={() => setSelectedPayment(payment)}
              >
                Send Reminder
              </button>
              <button 
                className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-500 
                  hover:bg-blue-600 focus:bg-blue-700 rounded-lg transition-all duration-200 
                  transform hover:-translate-y-0.5"
              >
                Process Payment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactionHistory = () => (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-8">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paymentData.recentTransactions.map(transaction => (
              <tr 
                key={transaction.id} 
                className="group hover:bg-slate-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                  {transaction.studentName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800 whitespace-nowrap">
                  ${transaction.amount}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                  {transaction.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                    bg-green-50 text-green-600">
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors duration-200
                      rounded-lg hover:bg-blue-50 group-hover:scale-110 transform"
                    onClick={() => setShowReceiptModal(true)}
                    aria-label={`View receipt for ${transaction.studentName}'s payment`}
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
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Management</h1>
          <p className="text-lg text-slate-500">Process and track student payments</p>
        </div>
        <button 
          className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white text-sm font-medium 
            rounded-lg hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 
            transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
        >
          New Payment
        </button>
      </div>

      <div className="space-y-8">
        {renderPaymentForm()}
        {renderPendingPayments()}
        {renderTransactionHistory()}
      </div>

      {showReceiptModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 
            animate-fade-in backdrop-blur-sm"
          onClick={() => setShowReceiptModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-xl 
              transform transition-all duration-200 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Payment Receipt</h3>
            {/* Receipt content */}
            <div className="flex justify-end">
              <button 
                className="px-6 py-2.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 
                  focus:bg-slate-300 rounded-lg transition-all duration-200"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments; 
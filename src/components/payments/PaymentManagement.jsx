import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagicCard, AnimatedList, ScrollProgress } from '../ui';
import { supabase } from '../../lib/supabase';
import PaymentGateway from './PaymentGateway';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [paymentData, setPaymentData] = useState({
    pendingPayments: [],
    recentTransactions: [],
    paymentPlans: [],
    loading: true
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Fetch payment data from database
  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setPaymentData(prev => ({ ...prev, loading: true }));

      // Fetch pending payments (students with incomplete payment plans)
      const { data: pendingPayments, error: pendingError } = await supabase
        .from('payment_plans')
        .select(`
          *,
          students (
            student_id,
            first_name,
            last_name,
            email,
            programs (
              name,
              code
            )
          )
        `)
        .gt('remaining_amount', 0)
        .eq('status', 'active');

      if (pendingError) throw pendingError;

      // Fetch recent transactions
      const { data: recentTransactions, error: transError } = await supabase
        .from('student_payments')
        .select(`
          *,
          students (
            student_id,
            first_name,
            last_name,
            programs (
              name,
              code
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transError) throw transError;

      // Fetch all payment plans for overview
      const { data: paymentPlans, error: plansError } = await supabase
        .from('payment_plans')
        .select(`
          *,
          students (
            student_id,
            first_name,
            last_name,
            programs (
              name,
              code
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      setPaymentData({
        pendingPayments: pendingPayments || [],
        recentTransactions: recentTransactions || [],
        paymentPlans: paymentPlans || [],
        loading: false
      });

    } catch (error) {
      console.error('Error fetching payment data:', error);
      setPaymentData(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}`;

      // Update payment plan
      const newPaidAmount = parseFloat(selectedPayment.paid_amount) + parseFloat(paymentAmount);
      const newRemainingAmount = parseFloat(selectedPayment.total_amount) - newPaidAmount;

      const { error: updateError } = await supabase
        .from('payment_plans')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status: newRemainingAmount <= 0 ? 'completed' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.id);

      if (updateError) throw updateError;

      // Create entry in student_payments
      await supabase
        .from('student_payments')
        .insert([{
          student_id: selectedPayment.student_id,
          payment_type: 'Tuition Fee',
          amount: paymentAmount,
          payment_method: 'online',
          payment_reference: paymentResult.payment_id || paymentResult.order_id,
          payment_status: 'Completed',
          receipt_number: receiptNumber,
          description: `Online payment for ${selectedPayment.students.programs.name}`,
          created_by: 'system'
        }]);

      // Refresh data
      await fetchPaymentData();
      setShowGatewayModal(false);
      setShowPaymentModal(false);
      setSelectedPayment(null);

      alert('Payment processed successfully!');

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    const errorMessage = error?.error_message || 'Payment processing failed. Please try again.';
    alert(`Payment failed: ${errorMessage}`);
    setShowGatewayModal(false);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    setShowGatewayModal(false);
  };

  const initiatePayment = () => {
    if (!selectedPayment || !paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (parseFloat(paymentAmount) > parseFloat(selectedPayment.remaining_amount)) {
      alert('Payment amount cannot exceed remaining amount');
      return;
    }

    setShowPaymentModal(false);
    setShowGatewayModal(true);
  };

  const generateReceipt = (transaction) => {
    return {
      receiptNumber: transaction.receipt_number || `RCP-${transaction.id.substr(0, 8)}`,
      date: new Date(transaction.created_at).toLocaleDateString(),
      studentName: `${transaction.students.first_name} ${transaction.students.last_name}`,
      studentId: transaction.students.student_id,
      program: transaction.students.programs.name,
      amount: parseFloat(transaction.amount).toFixed(2),
      paymentMethod: transaction.payment_method,
      transactionId: transaction.payment_reference || transaction.id,
      description: transaction.description
    };
  };

  const renderPendingPayments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Pending Payments</h3>
        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
          {paymentData.pendingPayments.length} Pending
        </span>
      </div>

      <div className="grid gap-4">
        {paymentData.pendingPayments.map((payment) => (
          <MagicCard key={payment.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-slate-800">
                    {payment.students.first_name} {payment.students.last_name}
                  </h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                    {payment.students.student_id}
                  </span>
                </div>
                <p className="text-slate-600 mb-3">{payment.students.programs.name}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-slate-500">Total Amount</span>
                    <p className="font-semibold text-slate-800">
                      LKR {parseFloat(payment.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Paid Amount</span>
                    <p className="font-semibold text-green-600">
                      LKR {parseFloat(payment.paid_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Remaining</span>
                    <p className="font-semibold text-orange-600">
                      LKR {parseFloat(payment.remaining_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(parseFloat(payment.paid_amount) / parseFloat(payment.total_amount)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedPayment(payment);
                    setPaymentAmount(payment.remaining_amount);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Make Payment
                </button>
              </div>
            </div>
          </MagicCard>
        ))}
      </div>
    </div>
  );

  const renderRecentTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Recent Transactions</h3>
        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
          {paymentData.recentTransactions.length} Transactions
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paymentData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {transaction.students.first_name} {transaction.students.last_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {transaction.students.student_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {transaction.students.programs.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900">
                      LKR {parseFloat(transaction.amount).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {transaction.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.payment_status === 'Completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedReceipt(generateReceipt(transaction));
                        setShowReceiptModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PaymentModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-6">Process Payment</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Student
              </label>
              <p className="text-slate-900">
                {selectedPayment.students.first_name} {selectedPayment.students.last_name}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Program
              </label>
              <p className="text-slate-900">{selectedPayment.students.programs.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Remaining Amount
              </label>
              <p className="text-orange-600 font-semibold">
                LKR {parseFloat(selectedPayment.remaining_amount).toLocaleString()}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Amount
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedPayment.remaining_amount}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedPayment(null);
              }}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={initiatePayment}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PaymentGatewayModal = () => {
    if (!selectedPayment || !showGatewayModal) return null;

    const gatewayData = {
      orderId: `ORD-${Date.now()}-${selectedPayment.students.student_id}`,
      amount: paymentAmount,
      firstName: selectedPayment.students.first_name,
      lastName: selectedPayment.students.last_name,
      email: selectedPayment.students.email || 'student@icbt.lk',
      description: `Payment for ${selectedPayment.students.programs.name}`,
      phone: '0771234567',
      address: 'ICBT Campus',
      city: 'Colombo'
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="max-w-md w-full mx-4">
          <div className="mb-4 text-center">
            <button
              onClick={() => setShowGatewayModal(false)}
              className="text-white hover:text-slate-300 text-sm"
            >
              ← Back to Payment Details
            </button>
          </div>
          <PaymentGateway
            paymentData={gatewayData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  };

  const ReceiptModal = () => {
    if (!selectedReceipt) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Payment Receipt</h3>
            <p className="text-slate-500">ICBT Campus</p>
          </div>
          
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Receipt No:</span>
              <span className="font-medium">{selectedReceipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-medium">{selectedReceipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Student:</span>
              <span className="font-medium">{selectedReceipt.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Student ID:</span>
              <span className="font-medium">{selectedReceipt.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Program:</span>
              <span className="font-medium">{selectedReceipt.program}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Method:</span>
              <span className="font-medium">{selectedReceipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Transaction ID:</span>
              <span className="font-medium">{selectedReceipt.transactionId}</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Amount Paid:</span>
              <span>LKR {selectedReceipt.amount}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowReceiptModal(false);
                setSelectedReceipt(null);
              }}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (paymentData.loading) {
    return (
      <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
      <ScrollProgress />
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Payment Management</h1>
        <p className="text-lg text-slate-500">Manage student payments, process transactions, and generate receipts</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Pending Payments ({paymentData.pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Recent Transactions ({paymentData.recentTransactions.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'pending' && renderPendingPayments()}
        {activeTab === 'transactions' && renderRecentTransactions()}
      </motion.div>

      {/* Modals */}
      {showPaymentModal && <PaymentModal />}
      {showGatewayModal && <PaymentGatewayModal />}
      {showReceiptModal && <ReceiptModal />}
    </div>
  );
};

export default PaymentManagement; 
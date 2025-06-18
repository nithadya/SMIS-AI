import React from 'react';

const StudentPayments = ({ payments }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Handle case where payments might be null or undefined
  if (!payments) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">No payment data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-200 
          hover:shadow-md transition-all duration-200">
          <h4 className="text-sm font-medium text-slate-500 mb-2">Total Required</h4>
          <p className="text-xl font-semibold text-slate-800">
            {formatCurrency(payments.totalRequired || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-green-200 
          hover:shadow-md transition-all duration-200">
          <h4 className="text-sm font-medium text-slate-500 mb-2">Total Paid</h4>
          <p className="text-xl font-semibold text-green-600">
            {formatCurrency(payments.totalPaid || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-200 
          hover:shadow-md transition-all duration-200">
          <h4 className="text-sm font-medium text-slate-500 mb-2">Total Due</h4>
          <p className="text-xl font-semibold text-amber-600">
            {formatCurrency(payments.totalDue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-200 
          hover:shadow-md transition-all duration-200">
          <h4 className="text-sm font-medium text-slate-500 mb-2">Registration Fee</h4>
          <p className="text-sm text-slate-600">
            {formatCurrency(payments.registrationPaid || 0)} / {formatCurrency(payments.registrationFee || 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Payment History</h3>
        </div>
        {payments.payments && payments.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.payments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className="group hover:bg-slate-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {payment.payment_type}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800 whitespace-nowrap">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                        ${payment.payment_status?.toLowerCase() === 'completed'
                          ? 'bg-green-50 text-green-600 group-hover:bg-green-100'
                          : payment.payment_status?.toLowerCase() === 'pending'
                            ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }
                        transition-colors duration-200
                      `}>
                        {payment.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-slate-500">No payment history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPayments; 
import React, { useState, useEffect } from 'react';
import { 
  searchProgramsWithFees, 
  getProgramWithFees, 
  getExchangeRate, 
  convertCurrency, 
  formatCurrency,
  calculateInstallmentAmounts 
} from '../../lib/api/currency.js';

const CurrencySupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedProgramData, setSelectedProgramData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Payment plan modal states
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState(null);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  
  // Currency calculator states
  const [gbpAmount, setGbpAmount] = useState('');
  const [lkrAmount, setLkrAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [calculatorLoading, setCalculatorLoading] = useState(false);
  
  // Student type for fee calculation
  const [studentType, setStudentType] = useState('local'); // 'local' or 'international'

  // Load exchange rate on component mount
  useEffect(() => {
    loadExchangeRate();
  }, []);

  // Search programs when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleProgramSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadExchangeRate = async () => {
    try {
      setError(null);
      const { data, error: apiError } = await getExchangeRate('GBP', 'LKR');
      if (apiError) {
        setError(`Failed to load exchange rate: ${apiError}`);
        return;
      }
      if (data) {
        setExchangeRate(parseFloat(data.exchange_rate));
      } else {
        setError('Exchange rate not found');
      }
    } catch (error) {
      console.error('Error loading exchange rate:', error);
      setError('Failed to load exchange rate');
    }
  };

  const handleProgramSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      setError(null);
      const { data, error: apiError } = await searchProgramsWithFees(searchQuery);
      if (apiError) {
        setError(`Search failed: ${apiError}`);
        return;
      }
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error in program search:', error);
      setError('Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectProgram = async (program) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedProgram(program);
      setSearchQuery(program.name);
      setSearchResults([]);
      
      const { data, error: apiError } = await getProgramWithFees(program.id);
      if (apiError) {
        setError(`Failed to load program details: ${apiError}`);
        return;
      }
      setSelectedProgramData(data);
    } catch (error) {
      console.error('Error selecting program:', error);
      setError('Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const handleGbpToLkr = async (gbp) => {
    if (!gbp || !exchangeRate) return;
    
    setCalculatorLoading(true);
    try {
      const converted = parseFloat(gbp) * exchangeRate;
      setLkrAmount(converted.toFixed(2));
    } catch (error) {
      console.error('Error converting currency:', error);
    } finally {
      setCalculatorLoading(false);
    }
  };

  const handleLkrToGbp = async (lkr) => {
    if (!lkr || !exchangeRate) return;
    
    setCalculatorLoading(true);
    try {
      const converted = parseFloat(lkr) / exchangeRate;
      setGbpAmount(converted.toFixed(2));
    } catch (error) {
      console.error('Error converting currency:', error);
    } finally {
      setCalculatorLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedProgram(null);
    setSelectedProgramData(null);
    setSearchResults([]);
    setError(null);
  };

  // Calculate total fees for selected program
  const calculateTotalFees = () => {
    if (!selectedProgramData || !selectedProgramData.internationalFees) {
      return { local: 0, international: 0 };
    }

    let localTotal = 0;
    let internationalTotal = 0;

    selectedProgramData.internationalFees.forEach(fee => {
      localTotal += parseFloat(fee.local_amount || 0);
      internationalTotal += parseFloat(fee.international_amount_gbp || 0);
    });

    return { local: localTotal, international: internationalTotal };
  };

  // Calculate payment breakdown for a plan
  const calculatePaymentBreakdown = (plan, totalAmount) => {
    const breakdown = [];
    let remainingAmount = totalAmount;
    
    if (plan.down_payment_required && plan.down_payment_amount > 0) {
      breakdown.push({
        type: 'Down Payment',
        amount: plan.down_payment_amount,
        dueDate: 'Upon Registration',
        installmentNumber: 0
      });
      remainingAmount -= plan.down_payment_amount;
    }
    
    const monthlyAmount = remainingAmount / plan.total_installments;
    
    for (let i = 1; i <= plan.total_installments; i++) {
      breakdown.push({
        type: 'Monthly Payment',
        amount: monthlyAmount,
        dueDate: `Month ${i}`,
        installmentNumber: i
      });
    }
    
    return breakdown;
  };

  // Handle payment plan selection
  const handlePaymentPlanClick = (plan) => {
    setSelectedPaymentPlan(plan);
    setShowPaymentPlanModal(true);
  };

  // Print payment plan
  const printPaymentPlan = () => {
    window.print();
  };

  const renderProgramSearch = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Program Fee Search</h3>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for programs by name, code, or description..."
          className="w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-slate-200 text-sm 
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
        <svg 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Student Type Toggle */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="local"
            checked={studentType === 'local'}
            onChange={(e) => setStudentType(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-slate-700">Local Student (LKR)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="international"
            checked={studentType === 'international'}
            onChange={(e) => setStudentType(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-slate-700">International Student (GBP)</span>
        </label>
      </div>

      {/* Search Loading */}
      {searchLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-slate-600">Searching...</span>
        </div>
      )}

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="border border-slate-200 rounded-lg shadow-lg mb-4 max-h-60 overflow-y-auto">
          {searchResults.map((program) => (
            <button
              key={program.id}
              onClick={() => handleSelectProgram(program)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-slate-800">{program.name}</div>
                  <div className="text-sm text-slate-600">{program.code} • {program.duration}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderProgramDetails = () => {
    if (!selectedProgramData || loading) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600">Loading program details...</p>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Search and select a program to view fee details
            </div>
          )}
        </div>
      );
    }

    const { program, internationalFees, installmentPlans } = selectedProgramData;
    const totals = calculateTotalFees();

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{program.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{program.code} • {program.duration}</p>
            <p className="text-sm text-slate-600 mt-2">{program.description}</p>
          </div>
          <button
            onClick={clearSearch}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h4 className="text-lg font-semibold text-slate-800 mb-4">Fee Structure</h4>

        {/* Total Program Cost */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Local Students */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h5 className="font-medium text-slate-800 mb-3">Local Students (LKR)</h5>
            {internationalFees && internationalFees.length > 0 ? (
              <div className="space-y-2">
                {internationalFees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{fee.fee_type}:</span>
                    <span className="font-medium">{formatCurrency(fee.local_amount, 'LKR')}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-lg">{formatCurrency(totals.local, 'LKR')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No fee structure available</p>
            )}
          </div>

          {/* International Students */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-slate-800 mb-3">International Students (GBP)</h5>
            {internationalFees && internationalFees.length > 0 ? (
              <div className="space-y-2">
                {internationalFees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{fee.fee_type}:</span>
                    <span className="font-medium">{formatCurrency(fee.international_amount_gbp, 'GBP')}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-lg">{formatCurrency(totals.international, 'GBP')}</span>
                  </div>
                  {exchangeRate && (
                    <div className="text-xs text-slate-500 mt-1">
                      ≈ {formatCurrency(totals.international * exchangeRate, 'LKR')}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No fee structure available</p>
            )}
          </div>
        </div>

        {/* Installment Plans */}
        {installmentPlans && installmentPlans.length > 0 && (
          <div>
            <h5 className="font-medium text-slate-800 mb-3">Available Payment Plans</h5>
            <div className="grid gap-4">
              {installmentPlans.map((plan, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedPaymentPlan(plan);
                    setShowPaymentPlanModal(true);
                  }}
                  className="border border-slate-200 rounded-lg p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group w-full"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="font-medium text-slate-700">{plan.plan_name}</h6>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        {plan.total_installments} installments
                      </span>
                      <svg className="w-4 h-4 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{plan.description}</p>
                  {plan.down_payment_required && (
                    <p className="text-sm text-blue-600 mb-2">
                      Down payment: {formatCurrency(plan.down_payment_amount, studentType === 'international' ? 'GBP' : 'LKR')}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 group-hover:text-blue-600">Click to view detailed payment breakdown</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCurrencyCalculator = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">GBP ⇄ LKR Currency Calculator</h3>
      
      {exchangeRate && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">
            Current Rate: 1 GBP = {exchangeRate.toLocaleString()} LKR
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* GBP to LKR */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            British Pounds (GBP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">£</span>
            <input
              type="number"
              value={gbpAmount}
              onChange={(e) => {
                setGbpAmount(e.target.value);
                handleGbpToLkr(e.target.value);
              }}
              placeholder="Enter GBP amount"
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-200 text-sm 
                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* LKR to GBP */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sri Lankan Rupees (LKR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">Rs.</span>
            <input
              type="number"
              value={lkrAmount}
              onChange={(e) => {
                setLkrAmount(e.target.value);
                handleLkrToGbp(e.target.value);
              }}
              placeholder="Enter LKR amount"
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 text-sm 
                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </div>

      {/* Quick conversion buttons */}
      <div className="mt-4">
        <p className="text-sm text-slate-600 mb-2">Quick conversions:</p>
        <div className="flex flex-wrap gap-2">
          {[100, 200, 500, 1000].map(amount => (
            <button
              key={amount}
              onClick={() => {
                setGbpAmount(amount.toString());
                handleGbpToLkr(amount.toString());
              }}
              className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              £{amount}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Payment Plan Modal Component
  const renderPaymentPlanModal = () => {
    if (!showPaymentPlanModal || !selectedPaymentPlan) return null;

    const totals = calculateTotalFees();
    const totalAmount = studentType === 'international' ? totals.international : totals.local;
    const currency = studentType === 'international' ? 'GBP' : 'LKR';
    const paymentBreakdown = calculatePaymentBreakdown(selectedPaymentPlan, totalAmount);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedPaymentPlan.plan_name}</h3>
              <p className="text-sm text-gray-600">Payment Plan Details</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setShowPaymentPlanModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 print:p-0">
            {/* Plan Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Plan Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Total Program Cost:</span>
                    <span className="font-semibold">{formatCurrency(totalAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Number of Installments:</span>
                    <span className="font-semibold">{selectedPaymentPlan.total_installments}</span>
                  </div>
                  {selectedPaymentPlan.down_payment_required && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Down Payment:</span>
                      <span className="font-semibold">{formatCurrency(selectedPaymentPlan.down_payment_amount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-blue-700">Monthly Payment:</span>
                    <span className="font-semibold">
                      {formatCurrency((totalAmount - (selectedPaymentPlan.down_payment_amount || 0)) / selectedPaymentPlan.total_installments, currency)}
                    </span>
                  </div>
                  {selectedPaymentPlan.interest_rate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Interest Rate:</span>
                      <span className="font-semibold">{selectedPaymentPlan.interest_rate}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-4">Program Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-green-700 text-sm">Program:</span>
                    <p className="font-semibold">{selectedProgram?.name}</p>
                  </div>
                  <div>
                    <span className="text-green-700 text-sm">Duration:</span>
                    <p className="font-semibold">{selectedProgram?.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-green-700 text-sm">Student Type:</span>
                    <p className="font-semibold capitalize">{studentType} Student</p>
                  </div>
                  <div>
                    <span className="text-green-700 text-sm">Plan Type:</span>
                    <p className="font-semibold">{selectedPaymentPlan.plan_type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Schedule Table */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Payment Schedule</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Payment #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Due Date</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 border-b">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentBreakdown.map((payment, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {payment.installmentNumber === 0 ? 'Initial' : payment.installmentNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.dueDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(payment.amount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-sm font-semibold text-blue-900">
                        Total Amount
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">
                        {formatCurrency(totalAmount, currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h4 className="font-semibold text-yellow-900 mb-3">Important Information</h4>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Payments must be made on or before the due dates to avoid late fees</li>
                {selectedPaymentPlan.late_fee_amount > 0 && (
                  <li>• Late fee of {formatCurrency(selectedPaymentPlan.late_fee_amount, currency)} applies for overdue payments</li>
                )}
                <li>• All fees are non-refundable once the semester begins</li>
                <li>• Payment confirmation receipts will be provided for each transaction</li>
                <li>• For payment-related queries, contact the finance department</li>
              </ul>
            </div>

            {/* Print-only section */}
            <div className="hidden print:block mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <h3 className="text-lg font-bold">SMIS ICBT - Payment Plan</h3>
                <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Program Fees & Currency Support</h1>
          <p className="text-slate-600 mt-2">
            Search for programs to view local and international fee structures, installment plans, and use the currency calculator.
          </p>
        </div>

        {/* Program Search */}
        {renderProgramSearch()}

        {/* Program Details */}
        {renderProgramDetails()}

        {/* Currency Calculator */}
        {renderCurrencyCalculator()}
      </div>

      {/* Payment Plan Modal */}
      {renderPaymentPlanModal()}
    </div>
  );
};

export default CurrencySupport; 
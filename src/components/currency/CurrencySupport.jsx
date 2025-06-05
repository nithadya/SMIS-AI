import React, { useState } from 'react';

const CurrencySupport = () => {
  // Mock data for demonstration
  const currencyData = {
    baseCurrency: 'USD',
    exchangeRates: {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      AUD: 1.52,
      CAD: 1.35,
      SGD: 1.34,
      INR: 82.75
    },
    programs: [
      {
        id: 1,
        name: 'Bachelor of Information Technology',
        fees: {
          application: 100,
          registration: 500,
          tuition: 15000,
          total: 15600
        }
      },
      {
        id: 2,
        name: 'Bachelor of Business Management',
        fees: {
          application: 100,
          registration: 500,
          tuition: 14000,
          total: 14600
        }
      },
      {
        id: 3,
        name: 'Bachelor of Engineering',
        fees: {
          application: 100,
          registration: 500,
          tuition: 16000,
          total: 16600
        }
      }
    ]
  };

  const [selectedProgram, setSelectedProgram] = useState(currencyData.programs[0]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [customAmount, setCustomAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    const rate = currencyData.exchangeRates[toCurrency] / currencyData.exchangeRates[fromCurrency];
    return (amount * rate).toFixed(2);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const renderProgramFees = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Program Fee Structure</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Currency</label>
          <select 
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            {Object.keys(currencyData.exchangeRates).map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Select Program</label>
          <select
            value={selectedProgram.id}
            onChange={(e) => setSelectedProgram(
              currencyData.programs.find(p => p.id === parseInt(e.target.value))
            )}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            {currencyData.programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Application Fee</span>
            <span className="text-lg font-semibold text-slate-800">
              {formatCurrency(
                convertCurrency(selectedProgram.fees.application, 'USD', selectedCurrency),
                selectedCurrency
              )}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Registration Fee</span>
            <span className="text-lg font-semibold text-slate-800">
              {formatCurrency(
                convertCurrency(selectedProgram.fees.registration, 'USD', selectedCurrency),
                selectedCurrency
              )}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Tuition Fee</span>
            <span className="text-lg font-semibold text-slate-800">
              {formatCurrency(
                convertCurrency(selectedProgram.fees.tuition, 'USD', selectedCurrency),
                selectedCurrency
              )}
            </span>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <span className="block text-sm text-blue-600 mb-1">Total Program Fee</span>
            <span className="text-lg font-semibold text-blue-700">
              {formatCurrency(
                convertCurrency(selectedProgram.fees.total, 'USD', selectedCurrency),
                selectedCurrency
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrencyConverter = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-800 mb-6">Currency Converter</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setConvertedAmount(
                convertCurrency(e.target.value || 0, 'USD', selectedCurrency)
              );
            }}
            placeholder="Enter amount in USD"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Converted Amount</label>
          <div className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-lg font-semibold text-slate-800">
            {formatCurrency(convertedAmount || 0, selectedCurrency)}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-base font-medium text-slate-700 mb-4">Current Exchange Rates</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(currencyData.exchangeRates).map(([currency, rate]) => (
            <div key={currency} className="bg-slate-50 rounded-lg p-4">
              <span className="block text-sm text-slate-500 mb-1">{currency}</span>
              <span className="text-base font-medium text-slate-800">
                {formatCurrency(rate, 'USD')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Currency Support</h1>
        <p className="text-slate-500">View program fees in multiple currencies and perform conversions</p>
      </div>

      <div className="space-y-6">
        {renderProgramFees()}
        {renderCurrencyConverter()}
      </div>
    </div>
  );
};

export default CurrencySupport; 
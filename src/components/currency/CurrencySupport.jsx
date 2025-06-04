import React, { useState } from 'react';
import './CurrencySupport.css';

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
    <div className="program-fees">
      <h3>Program Fee Structure</h3>
      <div className="currency-selector">
        <label>Select Currency</label>
        <select 
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          {Object.keys(currencyData.exchangeRates).map(currency => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      <div className="program-selector">
        <label>Select Program</label>
        <select
          value={selectedProgram.id}
          onChange={(e) => setSelectedProgram(
            currencyData.programs.find(p => p.id === parseInt(e.target.value))
          )}
        >
          {currencyData.programs.map(program => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      <div className="fee-breakdown">
        <div className="fee-card">
          <span className="fee-label">Application Fee</span>
          <span className="fee-amount">
            {formatCurrency(
              convertCurrency(selectedProgram.fees.application, 'USD', selectedCurrency),
              selectedCurrency
            )}
          </span>
        </div>
        <div className="fee-card">
          <span className="fee-label">Registration Fee</span>
          <span className="fee-amount">
            {formatCurrency(
              convertCurrency(selectedProgram.fees.registration, 'USD', selectedCurrency),
              selectedCurrency
            )}
          </span>
        </div>
        <div className="fee-card">
          <span className="fee-label">Tuition Fee</span>
          <span className="fee-amount">
            {formatCurrency(
              convertCurrency(selectedProgram.fees.tuition, 'USD', selectedCurrency),
              selectedCurrency
            )}
          </span>
        </div>
        <div className="fee-card total">
          <span className="fee-label">Total Program Fee</span>
          <span className="fee-amount">
            {formatCurrency(
              convertCurrency(selectedProgram.fees.total, 'USD', selectedCurrency),
              selectedCurrency
            )}
          </span>
        </div>
      </div>
    </div>
  );

  const renderCurrencyConverter = () => (
    <div className="currency-converter">
      <h3>Currency Converter</h3>
      <div className="converter-form">
        <div className="form-group">
          <label>Amount</label>
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
          />
        </div>
        <div className="form-group">
          <label>Converted Amount</label>
          <div className="converted-amount">
            {formatCurrency(convertedAmount || 0, selectedCurrency)}
          </div>
        </div>
      </div>

      <div className="exchange-rates">
        <h4>Current Exchange Rates</h4>
        <div className="rates-grid">
          {Object.entries(currencyData.exchangeRates).map(([currency, rate]) => (
            <div key={currency} className="rate-card">
              <span className="currency-code">{currency}</span>
              <span className="exchange-rate">
                {formatCurrency(rate, 'USD')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="currency-support-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Currency Support</h1>
          <p>View program fees in multiple currencies and perform conversions</p>
        </div>
      </div>

      <div className="currency-grid">
        {renderProgramFees()}
        {renderCurrencyConverter()}
      </div>
    </div>
  );
};

export default CurrencySupport; 
import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const EXCHANGE_RATES = {
  GHS: { rate: 1, symbol: 'GH₵', name: 'Ghanaian Cedi' },
  USD: { rate: 0.066, symbol: '$', name: 'US Dollar' },
  EUR: { rate: 0.060, symbol: '€', name: 'Euro' },
  GBP: { rate: 0.052, symbol: '£', name: 'British Pound' },
  CAD: { rate: 0.090, symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { rate: 0.10, symbol: 'A$', name: 'Australian Dollar' },
  NGN: { rate: 100, symbol: '₦', name: 'Nigerian Naira' },
  ZAR: { rate: 1.25, symbol: 'R', name: 'South African Rand' },
  KES: { rate: 8.5, symbol: 'KSh', name: 'Kenyan Shilling' },
  JPY: { rate: 10.0, symbol: '¥', name: 'Japanese Yen' },
  CNY: { rate: 0.47, symbol: '¥', name: 'Chinese Yuan' },
  CHF: { rate: 0.059, symbol: 'CHF', name: 'Swiss Franc' },
  INR: { rate: 5.5, symbol: '₹', name: 'Indian Rupee' },
  BRL: { rate: 0.33, symbol: 'R$', name: 'Brazilian Real' },
  MXN: { rate: 1.1, symbol: '$', name: 'Mexican Peso' },
  SGD: { rate: 0.089, symbol: 'S$', name: 'Singapore Dollar' },
  AED: { rate: 0.24, symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { rate: 0.25, symbol: '﷼', name: 'Saudi Riyal' }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD'); // Defaulting to USD for international appeal, or could use local storage

  useEffect(() => {
    const savedCurrency = localStorage.getItem('klarelle_currency');
    if (savedCurrency && EXCHANGE_RATES[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleSetCurrency = (newCurrency) => {
    if (EXCHANGE_RATES[newCurrency]) {
      setCurrency(newCurrency);
      localStorage.setItem('klarelle_currency', newCurrency);
    }
  };

  const formatPrice = (baseAmount) => {
    const amount = parseFloat(baseAmount);
    if (isNaN(amount)) return '';
    
    const curr = EXCHANGE_RATES[currency] || EXCHANGE_RATES['GHS'];
    const convertedAmount = amount * curr.rate;
    
    return `${curr.symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, EXCHANGE_RATES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);

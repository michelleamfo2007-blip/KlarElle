import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const EXCHANGE_RATES = {
  USD: { rate: 1, symbol: '$', name: 'US Dollar' },
  GHS: { rate: 15.15, symbol: 'GH₵', name: 'Ghanaian Cedi' },
  EUR: { rate: 0.91, symbol: '€', name: 'Euro' },
  GBP: { rate: 0.79, symbol: '£', name: 'British Pound' },
  CAD: { rate: 1.36, symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { rate: 1.51, symbol: 'A$', name: 'Australian Dollar' },
  NGN: { rate: 1515, symbol: '₦', name: 'Nigerian Naira' },
  ZAR: { rate: 18.9, symbol: 'R', name: 'South African Rand' },
  KES: { rate: 128, symbol: 'KSh', name: 'Kenyan Shilling' },
  JPY: { rate: 151, symbol: '¥', name: 'Japanese Yen' },
  CNY: { rate: 7.12, symbol: '¥', name: 'Chinese Yuan' },
  CHF: { rate: 0.89, symbol: 'CHF', name: 'Swiss Franc' },
  INR: { rate: 83.3, symbol: '₹', name: 'Indian Rupee' },
  BRL: { rate: 5.0, symbol: 'R$', name: 'Brazilian Real' },
  MXN: { rate: 16.6, symbol: '$', name: 'Mexican Peso' },
  SGD: { rate: 1.34, symbol: 'S$', name: 'Singapore Dollar' },
  AED: { rate: 3.63, symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { rate: 3.78, symbol: '﷼', name: 'Saudi Riyal' }
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
    
    const curr = EXCHANGE_RATES[currency] || EXCHANGE_RATES['USD'];
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

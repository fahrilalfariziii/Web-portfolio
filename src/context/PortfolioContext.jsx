/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const value = usePortfolio();
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolioContext = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioContext harus dipakai di dalam <PortfolioProvider>');
  return ctx;
};

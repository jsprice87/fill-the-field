
import React, { createContext, useContext, ReactNode } from 'react';

interface FranchiseeContextType {
  franchiseeId: string;
}

const FranchiseeContext = createContext<FranchiseeContextType | null>(null);

interface FranchiseeProviderProps {
  franchiseeId: string;
  children: ReactNode;
}

export const FranchiseeProvider: React.FC<FranchiseeProviderProps> = ({ 
  franchiseeId, 
  children 
}) => {
  return (
    <FranchiseeContext.Provider value={{ franchiseeId }}>
      {children}
    </FranchiseeContext.Provider>
  );
};

export const useFranchisee = () => {
  const context = useContext(FranchiseeContext);
  if (!context) {
    throw new Error('useFranchisee must be used within a FranchiseeProvider');
  }
  return context;
};

export const useFranchiseeOptional = () => {
  return useContext(FranchiseeContext);
};

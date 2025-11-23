import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Budget, AppSettings, BudgetStatus, PaymentMethod } from '../types';

interface StoreContextType {
  budgets: Budget[];
  settings: AppSettings;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'status'>) => void;
  updateBudgetStatus: (id: string, status: BudgetStatus) => void;
  updateBudgetPayment: (id: string, boletoDueDate: string) => void;
  markBoletoPaid: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  deleteBudget: (id: string) => void;
}

const defaultSettings: AppSettings = {
  inkCostPerMl: 0.65,
  inkConsumptionFactor: 10,
  apiKey: '',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('spamidia_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('spamidia_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('spamidia_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('spamidia_settings', JSON.stringify(settings));
  }, [settings]);

  const addBudget = (data: Omit<Budget, 'id' | 'createdAt' | 'status'>) => {
    const newBudget: Budget = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: BudgetStatus.PENDING_APPROVAL,
      boletoIssued: false,
      boletoPaid: false,
    };
    setBudgets((prev) => [newBudget, ...prev]);
  };

  const updateBudgetStatus = (id: string, status: BudgetStatus) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              approvedAt: status === BudgetStatus.APPROVED ? new Date().toISOString() : b.approvedAt,
              completedAt: status === BudgetStatus.COMPLETED ? new Date().toISOString() : b.completedAt,
            }
          : b
      )
    );
  };

  const updateBudgetPayment = (id: string, boletoDueDate: string) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, boletoIssued: true, boletoDueDate } : b
      )
    );
  };

  const markBoletoPaid = (id: string) => {
    setBudgets((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, boletoPaid: true } : b
        )
      );
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        budgets,
        settings,
        addBudget,
        updateBudgetStatus,
        updateBudgetPayment,
        markBoletoPaid,
        updateSettings,
        deleteBudget,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
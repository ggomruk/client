'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PanelContextType {
  showIndicators: boolean;
  setShowIndicators: (show: boolean) => void;
  isBacktestMode: boolean;
  panelStack: ('indicators' | 'backtest')[];
  updatePanelStack: (panel: 'indicators' | 'backtest', show: boolean) => void;
}

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export const PanelProvider: React.FC<{ children: ReactNode; isBacktestMode: boolean }> = ({ 
  children, 
  isBacktestMode 
}) => {
  const [showIndicators, setShowIndicators] = useState(false);
  const [panelStack, setPanelStack] = useState<('indicators' | 'backtest')[]>([]);

  const updatePanelStack = useCallback((panel: 'indicators' | 'backtest', show: boolean) => {
    setPanelStack(prev => {
      // Remove panel from stack if it exists
      const filtered = prev.filter(p => p !== panel);
      
      // If showing, add to end (will be on top)
      if (show) {
        return [...filtered, panel];
      }
      
      return filtered;
    });
  }, []);

  return (
    <PanelContext.Provider value={{
      showIndicators,
      setShowIndicators,
      isBacktestMode,
      panelStack,
      updatePanelStack,
    }}>
      {children}
    </PanelContext.Provider>
  );
};

export const usePanel = () => {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanel must be used within PanelProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useServerWebsocket } from '../_provider/server.websocket';
import { useAuth } from '@/app/contexts/AuthContext';
import { BacktestResult, BacktestProgress, BacktestComplete, BacktestError } from '../_types/backtest';
import backtestService from '../../services/backtestService';

interface BacktestContextType {
  backtests: Map<string, BacktestResult>;
  activeBacktest: BacktestResult | null;
  loading: boolean;
  submitBacktest: (params: any) => Promise<string>;
  getBacktest: (backtestId: string) => BacktestResult | undefined;
  refreshBacktests: () => Promise<void>;
}

const BacktestContext = createContext<BacktestContextType | undefined>(undefined);

export const useBacktest = () => {
  const context = useContext(BacktestContext);
  if (!context) {
    throw new Error('useBacktest must be used within BacktestProvider');
  }
  return context;
};

interface BacktestProviderProps {
  children: ReactNode;
}

export const BacktestProvider: React.FC<BacktestProviderProps> = ({ children }) => {
  const { socket, isConnected } = useServerWebsocket();
  const { user } = useAuth();
  const [backtests, setBacktests] = useState<Map<string, BacktestResult>>(new Map());
  const [activeBacktest, setActiveBacktest] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup WebSocket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle backtest started
    const handleBacktestStarted = (data: { backtestId: string; userId: string; params: any }) => {
      console.log('Backtest started:', data);
      
      const newBacktest: BacktestResult = {
        backtestId: data.backtestId,
        userId: data.userId,
        status: 'pending',
        progress: 0,
        params: data.params,
        createdAt: new Date().toISOString(),
      };

      setBacktests(prev => new Map(prev).set(data.backtestId, newBacktest));
      setActiveBacktest(newBacktest);
    };

    // Handle progress updates
    const handleProgress = (data: BacktestProgress) => {
      console.log('Backtest progress:', data);
      
      setBacktests(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.backtestId);
        
        if (existing) {
          updated.set(data.backtestId, {
            ...existing,
            status: 'processing',
            progress: data.progress,
          });
        }
        
        return updated;
      });

      // Update active backtest if it matches
      setActiveBacktest(prev => 
        prev?.backtestId === data.backtestId 
          ? { ...prev, status: 'processing', progress: data.progress }
          : prev
      );
    };

    // Handle completion
    const handleComplete = (data: BacktestComplete) => {
      console.log('Backtest complete:', data);
      
      setBacktests(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.backtestId);
        
        if (existing) {
          updated.set(data.backtestId, {
            ...existing,
            status: 'completed',
            progress: 100,
            result: data.result,
            completedAt: new Date().toISOString(),
          });
        }
        
        return updated;
      });

      // Update active backtest if it matches
      setActiveBacktest(prev => 
        prev?.backtestId === data.backtestId 
          ? { ...prev, status: 'completed', progress: 100, result: data.result, completedAt: new Date().toISOString() }
          : prev
      );
    };

    // Handle errors
    const handleError = (data: BacktestError) => {
      console.error('Backtest error:', data);
      
      setBacktests(prev => {
        const updated = new Map(prev);
        const existing = updated.get(data.backtestId);
        
        if (existing) {
          updated.set(data.backtestId, {
            ...existing,
            status: 'error',
            error: data.error,
          });
        }
        
        return updated;
      });

      // Update active backtest if it matches
      setActiveBacktest(prev => 
        prev?.backtestId === data.backtestId 
          ? { ...prev, status: 'error', error: data.error }
          : prev
      );
    };

    socket.on('backtest:started', handleBacktestStarted);
    socket.on('backtest:progress', handleProgress);
    socket.on('backtest:complete', handleComplete);
    socket.on('backtest:error', handleError);

    return () => {
      socket.off('backtest:started', handleBacktestStarted);
      socket.off('backtest:progress', handleProgress);
      socket.off('backtest:complete', handleComplete);
      socket.off('backtest:error', handleError);
    };
  }, [socket, isConnected]);

  // Submit a new backtest
  const submitBacktest = useCallback(async (params: any): Promise<string> => {
    try {
      setLoading(true);
      const response = await backtestService.submitBacktest(params);
      
      if (response.ok && response.data) {
        return response.data.backtestId;
      } else {
        throw new Error(response.error || 'Failed to submit backtest');
      }
    } catch (error: any) {
      console.error('Failed to submit backtest:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific backtest
  const getBacktest = useCallback((backtestId: string): BacktestResult | undefined => {
    return backtests.get(backtestId);
  }, [backtests]);

  // Refresh backtests from server
  const refreshBacktests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await backtestService.getUserBacktests();
      
      if (response.ok && response.data) {
        const backtestMap = new Map<string, BacktestResult>();
        response.data.forEach(bt => backtestMap.set(bt.backtestId, bt));
        setBacktests(backtestMap);
      } else {
        console.error('Failed to refresh backtests:', response.error);
      }
    } catch (error) {
      console.error('Failed to refresh backtests:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load backtests on mount
  useEffect(() => {
    if (user && isConnected) {
      refreshBacktests();
    }
  }, [user, isConnected, refreshBacktests]);

  return (
    <BacktestContext.Provider
      value={{
        backtests,
        activeBacktest,
        loading,
        submitBacktest,
        getBacktest,
        refreshBacktests,
      }}
    >
      {children}
    </BacktestContext.Provider>
  );
};

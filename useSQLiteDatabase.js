import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@parfumkar_transactions';

export const useSQLiteDatabase = () => {
  const initDatabase = useCallback(async () => {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existingData) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }, []);

  const addTransaction = useCallback(async (transaction) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const transactions = data ? JSON.parse(data) : [];
      const newTransaction = {
        id: Date.now().toString(),
        ...transaction,
        createdAt: new Date().toISOString(),
      };
      transactions.push(newTransaction);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Add transaction error:', error);
      throw error;
    }
  }, []);

  const getTransactions = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get transactions error:', error);
      return [];
    }
  }, []);

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const transactions = data ? JSON.parse(data) : [];
      const filtered = transactions.filter(t => t.id !== transactionId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (transactionId, updates) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const transactions = data ? JSON.parse(data) : [];
      const index = transactions.findIndex(t => t.id === transactionId);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  }, []);

  const calculateMetrics = useCallback(async () => {
    try {
      const transactions = await getTransactions();
      
      let totalCost = 0;
      let totalRevenue = 0;
      let totalProfit = 0;
      let totalQuantity = 0;

      transactions.forEach(t => {
        const cost = parseFloat(t.purchasePrice || 0) * parseFloat(t.quantity || 0);
        const revenue = parseFloat(t.salePrice || 0) * parseFloat(t.quantity || 0);
        
        totalCost += cost;
        totalRevenue += revenue;
        totalProfit += (revenue - cost);
        totalQuantity += parseFloat(t.quantity || 0);
      });

      const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;
      const markupPercentage = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : 0;

      return {
        totalCost: totalCost.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalQuantity,
        profitMargin,
        markupPercentage,
        transactionCount: transactions.length,
      };
    } catch (error) {
      console.error('Calculate metrics error:', error);
      return null;
    }
  }, [getTransactions]);

  return {
    initDatabase,
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
    calculateMetrics,
  };
};

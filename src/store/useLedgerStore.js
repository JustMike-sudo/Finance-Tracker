import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMonthKey } from '../utils/dateUtils';

const createEmptySetup = (monthKey) => ({
  month: monthKey,
  totalCashInFlow: 0,
  fixedCosts: 0,
  pillars: { survival: 0, optional: 0, culture: 0, extra: 0 },
  netSavingsGoal: 0,
  weeklyThreshold: 0,
});

const useLedgerStore = create(
  persist(
    (set, get) => ({
      // Monthly setup
      monthlySetup: null,
      
      // Transactions for current month
      transactions: [],
      
      // Wallet sync
      walletBalance: 0,
      lastWalletSync: null,
      
      // Archives
      archives: {},

      // ─── Actions ───
      
      setMonthlySetup: (setup) => {
        const pillarSum = Object.values(setup.pillars).reduce((s, v) => s + v, 0);
        const netSavingsGoal = setup.totalCashInFlow - setup.fixedCosts - pillarSum;
        const weeklyThreshold = pillarSum / 4;
        set({
          monthlySetup: {
            ...setup,
            month: getMonthKey(),
            netSavingsGoal: Math.max(0, netSavingsGoal),
            weeklyThreshold,
          },
        });
      },

      addTransaction: (amount, pillar, label = '', isWalletMismatch = false) => {
        const tx = {
          id: crypto.randomUUID(),
          amount: parseFloat(amount),
          pillar,
          timestamp: new Date().toISOString(),
          label,
          isWalletMismatch,
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
      },

      syncWallet: (physicalCash) => {
        const state = get();
        const { monthlySetup, transactions } = state;
        if (!monthlySetup) return 0;
        
        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const virtualBalance = monthlySetup.totalCashInFlow - monthlySetup.fixedCosts - totalSpent;
        const mismatch = virtualBalance - physicalCash;
        
        if (mismatch > 0) {
          const tx = {
            id: crypto.randomUUID(),
            amount: parseFloat(mismatch.toFixed(2)),
            pillar: 'extra',
            timestamp: new Date().toISOString(),
            label: 'Wallet Mismatch',
            isWalletMismatch: true,
          };
          set((state) => ({
            transactions: [tx, ...state.transactions],
            walletBalance: physicalCash,
            lastWalletSync: new Date().toISOString(),
          }));
          return mismatch;
        }
        
        set({ walletBalance: physicalCash, lastWalletSync: new Date().toISOString() });
        return 0;
      },

      lockMonth: (reflection) => {
        const state = get();
        const monthKey = state.monthlySetup?.month || getMonthKey();
        
        set((state) => ({
          archives: {
            ...state.archives,
            [monthKey]: {
              setup: { ...state.monthlySetup },
              transactions: [...state.transactions],
              reflection: reflection || { wentWell: '', toImprove: '', nextMonth: '' },
              lockedAt: new Date().toISOString(),
            },
          },
          monthlySetup: null,
          transactions: [],
          walletBalance: 0,
          lastWalletSync: null,
        }));
      },

      saveReflection: (monthKey, reflection) => {
        set((state) => {
          if (state.archives[monthKey]) {
            return {
              archives: {
                ...state.archives,
                [monthKey]: { ...state.archives[monthKey], reflection },
              },
            };
          }
          return state;
        });
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(t => t.id !== id),
        }));
      },

      // Selectors
      getCurrentMonthTransactions: () => {
        const state = get();
        const currentMonth = getMonthKey();
        return state.transactions.filter(t => {
          const txMonth = t.timestamp.substring(0, 7);
          return txMonth === currentMonth;
        });
      },
    }),
    {
      name: 'fusion-ledger-storage',
    }
  )
);

export default useLedgerStore;

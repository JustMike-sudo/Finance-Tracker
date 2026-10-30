import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMonthKey } from '../utils/dateUtils';
import {
  roundMoney,
  calcNetSavingsGoal,
  calcWeeklyThreshold,
  calcVirtualBalance,
  calcWalletMismatch,
} from '../utils/calculations';

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
        set({
          monthlySetup: {
            ...setup,
            month: getMonthKey(),
            netSavingsGoal: Math.max(0, calcNetSavingsGoal(setup)),
            weeklyThreshold: calcWeeklyThreshold(setup),
          },
        });
      },

      addTransaction: (amount, pillar, label = '', isWalletMismatch = false) => {
        const value = roundMoney(parseFloat(amount));
        if (!Number.isFinite(value) || value <= 0) return;
        const tx = {
          id: crypto.randomUUID(),
          amount: value,
          pillar,
          timestamp: new Date().toISOString(),
          label,
          isWalletMismatch,
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
      },

      syncWallet: (physicalCash) => {
        const { monthlySetup, transactions } = get();
        if (!monthlySetup) return 0;

        const mismatch = calcWalletMismatch(calcVirtualBalance(monthlySetup, transactions), physicalCash);
        const syncedAt = new Date().toISOString();

        if (mismatch > 0) {
          const tx = {
            id: crypto.randomUUID(),
            amount: mismatch,
            pillar: 'extra',
            timestamp: syncedAt,
            label: 'Wallet Mismatch',
            isWalletMismatch: true,
          };
          set((state) => ({
            transactions: [tx, ...state.transactions],
            walletBalance: physicalCash,
            lastWalletSync: syncedAt,
          }));
          return mismatch;
        }

        set({ walletBalance: physicalCash, lastWalletSync: syncedAt });
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

      // Replaces the whole ledger. Callers must pass data checked by parseBackup().
      importData: (data) => {
        set({
          monthlySetup: data.monthlySetup,
          transactions: data.transactions,
          walletBalance: data.walletBalance,
          lastWalletSync: data.lastWalletSync,
          archives: data.archives,
        });
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

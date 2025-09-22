import { api } from './apiConfig';
// Types
export interface QuilttSession {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface TransactionFilters {
  limit?: number;
  cursor?: string;
  accountIds?: string[];
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}

export interface BankAccountParams {
  session: any;
}

export interface TransactionsParams {
  session: any;
  filters?: TransactionFilters;
}

// API Functions
export async function getBankAccount(params: BankAccountParams) {
  return api.post('/get/bank-account', params);
}

export async function getTransactions(params: TransactionsParams) {
  return api.post('/transactions/list', params);
}

export async function getBudgets(params: any) {
  return api.post('/budgets/get', params);
}

export async function getFinancialGoals(params: BankAccountParams) {
  return api.post('/goals/list', params);
}

export async function getAccountsSummary(params: BankAccountParams) {
  return api.post('/accounts/summary', params);
}

export async function connectBankAccount(email: string, userId: string) {
  return api.post('/connect/bank', {
    currentUser: {
      uid: userId,
      email: email,
    },
  });
}

// Utility functions for data processing
export const formatCurrency = (
  amount: number,
  currencyCode = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const getCategoryIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    Housing: '🏠',
    Utilities: '⚡',
    Groceries: '🛒',
    Transportation: '🚗',
    Insurance: '🛡️',
    Healthcare: '🏥',
    'Dining Out': '🍽️',
    Entertainment: '🎬',
    Shopping: '🛍️',
    Hobbies: '🎨',
    Travel: '✈️',
    Subscriptions: '📱',
    'Emergency Fund': '🚨',
    Retirement: '🏖️',
    Investments: '📈',
    'Debt Payoff': '💰',
  };

  return iconMap[category] || '📊';
};

export const getCategoryColor = (budgetType: string): string => {
  const colorMap: { [key: string]: string } = {
    needs: '#EF4444',
    wants: '#F59E0B',
    savings: '#10B981',
  };

  return colorMap[budgetType] || '#3B82F6';
};

export const processTransactionEnrichment = (transaction: any): any => {
  const enrichment = transaction.remoteData?.fingoal?.enrichment?.response;

  if (enrichment) {
    return {
      ...transaction,
      merchantName: enrichment.merchantName || transaction.description,
      merchantLogo: enrichment.merchantLogoUrl,
      category: enrichment.category,
      isRecurring: enrichment.isRecurring || false,
      merchantLocation: {
        address: enrichment.merchantAddress1,
        city: enrichment.merchantCity,
        state: enrichment.merchantState,
        country: enrichment.merchantCountry,
        latitude: enrichment.merchantLatitude,
        longitude: enrichment.merchantLongitude,
      },
    };
  }

  return transaction;
};

export const groupTransactionsByDate = (
  transactions: any[]
): { [key: string]: any[] } => {
  return transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});
};

export const calculateCashFlow = (
  transactions: any[]
): {
  income: number;
  expenses: number;
  netFlow: number;
} => {
  let income = 0;
  let expenses = 0;

  transactions.forEach((transaction) => {
    const amount = Math.abs(parseFloat(transaction.amount));

    if (transaction.entryType === 'credit' || transaction.amount > 0) {
      income += amount;
    } else {
      expenses += amount;
    }
  });

  return {
    income,
    expenses,
    netFlow: income - expenses,
  };
};

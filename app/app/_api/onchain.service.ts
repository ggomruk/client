import axiosInstance from './axios';

// Types matching the server OnChain module schemas
export type BlockchainType = 'bitcoin' | 'ethereum';
export type TransactionDirection = 'to_exchange' | 'from_exchange' | 'unknown';
export type WalletType = 'exchange' | 'whale' | 'institution' | 'smart_money' | 'unknown';

export interface WhaleTransaction {
  _id: string;
  txHash: string;
  blockchain: BlockchainType;
  fromAddress: string;
  fromLabel?: string;
  toAddress: string;
  toLabel?: string;
  amount: number;
  symbol: string;
  amountUsd: number;
  timestamp: string;
  direction?: TransactionDirection;
  exchangeName?: string;
}

export interface ExchangeFlow {
  _id: string;
  exchange: string;
  blockchain: BlockchainType;
  symbol: string;
  timestamp: string;
  inflowAmount: number;
  inflowUsd: number;
  inflowCount: number;
  outflowAmount: number;
  outflowUsd: number;
  outflowCount: number;
  netFlowAmount: number;
  netFlowUsd: number;
}

export interface ExchangeFlowResponse {
  exchange: string;
  period: string;
  stats: {
    totalInflowUsd: number;
    totalOutflowUsd: number;
    totalNetFlowUsd: number;
    inflowCount: number;
    outflowCount: number;
  };
  hourlyData: ExchangeFlow[];
}

export interface WhaleWallet {
  _id: string;
  address: string;
  blockchain: BlockchainType;
  label?: string;
  walletType: WalletType;
  exchangeName?: string;
  balance?: number;
  balanceUsd?: number;
  lastActiveAt?: string;
  transactionCount?: number;
  isKnownAddress: boolean;
  isVerified?: boolean;
}

export interface TransactionStatsItem {
  _id: BlockchainType; // blockchain
  count: number;
  totalUsd: number;
  avgUsd: number;
  maxUsd: number;
}

export interface ExchangeFlowStatsItem {
  _id: string; // exchange name
  totalInflowUsd: number;
  totalOutflowUsd: number;
  netFlowUsd: number;
}

export interface OnChainStatsResponse {
  period: string;
  transactions: TransactionStatsItem[];
  exchangeFlows: ExchangeFlowStatsItem[];
}

export interface GetTransactionsQuery {
  page?: number;
  limit?: number;
  blockchain?: BlockchainType;
  minAmountUsd?: number;
  maxAmountUsd?: number;
  direction?: TransactionDirection;
  address?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedTransactionsResponse {
  data: WhaleTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const BASE_URL = '/onchain';

export const onchainService = {
  // === TRANSACTIONS ===
  getTransactions: async (query: GetTransactionsQuery = {}): Promise<PaginatedTransactionsResponse> => {
    const response = await axiosInstance.get<{ data: PaginatedTransactionsResponse }>(`${BASE_URL}/transactions`, { params: query });
    return response.data.data;
  },

  getLatestTransactions: async (limit: number = 20): Promise<WhaleTransaction[]> => {
    const response = await axiosInstance.get<{ data: WhaleTransaction[] }>(`${BASE_URL}/transactions/latest`, { params: { limit } });
    return response.data.data;
  },

  getTransactionByHash: async (txHash: string): Promise<WhaleTransaction> => {
    const response = await axiosInstance.get<{ data: WhaleTransaction }>(`${BASE_URL}/transactions/${txHash}`);
    return response.data.data;
  },

  // === WALLETS ===
  getKnownWallets: async (blockchain?: BlockchainType): Promise<WhaleWallet[]> => {
    const response = await axiosInstance.get<{ data: WhaleWallet[] }>(`${BASE_URL}/wallets/known`, { params: { blockchain } });
    return response.data.data;
  },

  getWallet: async (address: string, blockchain?: BlockchainType): Promise<WhaleWallet> => {
    const response = await axiosInstance.get<{ data: WhaleWallet }>(`${BASE_URL}/wallets/${address}`, { params: { blockchain } });
    return response.data.data;
  },

  getWalletHistory: async (address: string, params: { blockchain?: BlockchainType; limit?: number } = {}): Promise<WhaleTransaction[]> => {
    const response = await axiosInstance.get<{ data: WhaleTransaction[] }>(`${BASE_URL}/wallets/${address}/history`, { params });
    return response.data.data;
  },

  // === EXCHANGE FLOWS ===
  getExchangeFlows: async (exchange: string, hours: number = 24, blockchain?: BlockchainType): Promise<ExchangeFlowResponse> => {
    const response = await axiosInstance.get<{ data: ExchangeFlowResponse }>(`${BASE_URL}/exchange-flows`, { 
      params: { exchange, hours, blockchain } 
    });
    return response.data.data;
  },

  // === STATS ===
  getStats: async (hours: number = 24): Promise<OnChainStatsResponse> => {
    const response = await axiosInstance.get<{ data: OnChainStatsResponse }>(`${BASE_URL}/stats`, { params: { hours } });
    return response.data.data;
  },

  // === WATCHLIST ===
  getWatchlist: async () => {
    const response = await axiosInstance.get<{ data: unknown[] }>(`${BASE_URL}/watchlist`);
    return response.data.data;
  },

  addToWatchlist: async (address: string, blockchain: BlockchainType, nickname?: string) => {
    const response = await axiosInstance.post<{ data: unknown }>(`${BASE_URL}/watchlist`, { 
      address, 
      blockchain,
      nickname 
    });
    return response.data.data;
  },

  removeFromWatchlist: async (id: string) => {
    await axiosInstance.delete(`${BASE_URL}/watchlist/${id}`);
  },
};

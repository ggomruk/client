import axios from 'axios';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';

export interface TickerData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

export const binanceService = {
  async get24hrTicker(symbol: string): Promise<TickerData> {
    try {
      const response = await axios.get(`${BINANCE_API_URL}/ticker/24hr`, {
        params: { symbol },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticker for ${symbol}:`, error);
      throw error;
    }
  },

  async getKlines(symbol: string, interval: string = '1h', limit: number = 20): Promise<number[]> {
    try {
      const response = await axios.get(`${BINANCE_API_URL}/klines`, {
        params: {
          symbol,
          interval,
          limit,
        },
      });
      // Binance kline format: [open time, open, high, low, close, volume, ...]
      // We want the close price (index 4)
      return response.data.map((k: any[]) => parseFloat(k[4]));
    } catch (error) {
      console.error(`Error fetching klines for ${symbol}:`, error);
      return [];
    }
  },
};

// API service for alerts features
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export enum AlertType {
  PRICE_ABOVE = 'price_above',
  PRICE_BELOW = 'price_below',
  PRICE_CHANGE_PERCENT = 'price_change_percent',
  INDICATOR_SIGNAL = 'indicator_signal',
}

export enum AlertStatus {
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  CANCELLED = 'cancelled',
}

export interface CreateAlertDTO {
  symbol: string;
  alertType: AlertType;
  targetValue: number;
  indicatorParams?: Record<string, any>;
  message?: string;
}

export interface Alert {
  _id: string;
  userId: string;
  symbol: string;
  alertType: AlertType;
  targetValue: number;
  indicatorParams?: Record<string, any>;
  message?: string;
  status: AlertStatus;
  triggeredAt?: Date;
  triggeredPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertStats {
  total: number;
  active: number;
  triggered: number;
  cancelled: number;
}

class AlertsService {
  private getAuthHeader() {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async createAlert(dto: CreateAlertDTO): Promise<Alert> {
    const response = await axios.post(
      `${API_BASE_URL}/alerts`,
      dto,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getUserAlerts(): Promise<Alert[]> {
    const response = await axios.get(
      `${API_BASE_URL}/alerts`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    const response = await axios.get(
      `${API_BASE_URL}/alerts/active`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getAlertStats(): Promise<AlertStats> {
    const response = await axios.get(
      `${API_BASE_URL}/alerts/stats`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getCurrentPrice(symbol: string): Promise<{ symbol: string; price: number; timestamp: Date }> {
    const response = await axios.get(
      `${API_BASE_URL}/alerts/price/${symbol}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async cancelAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/alerts/${alertId}/cancel`,
      {},
      this.getAuthHeader()
    );
    return response.data;
  }

  async deleteAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(
      `${API_BASE_URL}/alerts/${alertId}`,
      this.getAuthHeader()
    );
    return response.data;
  }
}

export const alertsService = new AlertsService();

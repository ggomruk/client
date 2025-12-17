'use client';

import { useState, useEffect } from 'react';
import { alertsService, CreateAlertDTO, Alert, AlertType, AlertStatus } from '../_api/alerts.service';
import { io, Socket } from 'socket.io-client';

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, triggered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState<CreateAlertDTO>({
    symbol: 'BTCUSDT',
    alertType: AlertType.PRICE_ABOVE,
    targetValue: 50000,
    message: '',
  });

  useEffect(() => {
    loadAlerts();
    loadStats();
    setupWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const setupWebSocket = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const newSocket = io('http://localhost:4000/ws', {
      transports: ['websocket'],
    });

    newSocket.emit('backtest:subscribe', { userId });

    newSocket.on('alert:triggered', (data: any) => {
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.message || 'Price Alert Triggered!', {
          body: `${data.symbol}: $${data.currentPrice}`,
          icon: '/favicon.ico',
        });
      }

      // Reload alerts
      loadAlerts();
      loadStats();
    });

    setSocket(newSocket);
  };

  const loadAlerts = async () => {
    try {
      const data = await alertsService.getUserAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await alertsService.getAlertStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await alertsService.createAlert(formData);
      setShowCreateForm(false);
      setFormData({
        symbol: 'BTCUSDT',
        alertType: AlertType.PRICE_ABOVE,
        targetValue: 50000,
        message: '',
      });
      loadAlerts();
      loadStats();

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create alert');
    }
  };

  const handleCancelAlert = async (alertId: string) => {
    try {
      await alertsService.cancelAlert(alertId);
      loadAlerts();
      loadStats();
    } catch (err) {
      alert('Failed to cancel alert');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      await alertsService.deleteAlert(alertId);
      loadAlerts();
      loadStats();
    } catch (err) {
      alert('Failed to delete alert');
    }
  };

  const getAlertTypeLabel = (type: AlertType) => {
    switch (type) {
      case AlertType.PRICE_ABOVE: return 'Price Above';
      case AlertType.PRICE_BELOW: return 'Price Below';
      case AlertType.PRICE_CHANGE_PERCENT: return 'Price Change %';
      case AlertType.INDICATOR_SIGNAL: return 'Indicator Signal';
      default: return type;
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      triggered: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading alerts...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Price Alerts</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : '+ Create Alert'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Alerts</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-800">{stats.active}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Triggered</p>
          <p className="text-2xl font-bold text-blue-800">{stats.triggered}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-gray-800">{stats.cancelled}</p>
        </div>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateAlert} className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Alert</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
              <select
                value={formData.alertType}
                onChange={(e) => setFormData({ ...formData, alertType: e.target.value as AlertType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={AlertType.PRICE_ABOVE}>Price Above</option>
                <option value={AlertType.PRICE_BELOW}>Price Below</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
            <input
              type="number"
              step="0.01"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Custom alert message"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Create Alert
          </button>
        </form>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No alerts yet. Create your first alert!
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{alert.symbol}</h3>
                  <p className="text-sm text-gray-600">{getAlertTypeLabel(alert.alertType)}: ${alert.targetValue.toLocaleString()}</p>
                  {alert.message && <p className="text-sm text-gray-500 mt-1">{alert.message}</p>}
                </div>
                <div className="flex gap-2 items-center">
                  {getStatusBadge(alert.status)}
                  {alert.status === AlertStatus.ACTIVE && (
                    <button
                      onClick={() => handleCancelAlert(alert._id)}
                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {alert.triggeredAt && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <p className="text-blue-800">
                    Triggered at ${alert.triggeredPrice?.toLocaleString()} on {new Date(alert.triggeredAt).toLocaleString()}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

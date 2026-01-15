'use client';

import { useState, useEffect, useCallback } from 'react';
import { alertsService, CreateAlertDTO, Alert, AlertType, AlertStatus } from '../_api/alerts.service';
import { io, Socket } from 'socket.io-client';

export default function AlertsPage() {
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

  const loadAlerts = useCallback(async () => {
    try {
      const data = await alertsService.getUserAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await alertsService.getAlertStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const setupWebSocket = useCallback(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const newSocket = io(`${wsUrl}/ws`, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
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
  }, [loadAlerts, loadStats]);

  useEffect(() => {
    loadAlerts();
    loadStats();
    setupWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAlerts, loadStats, setupWebSocket]);

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
      active: 'bg-[#05df72]/20 text-[#05df72]',
      triggered: 'bg-[#06b6d4]/20 text-[#06b6d4]',
      cancelled: 'bg-[#3f3f46] text-[#a1a1aa]',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-[#a1a1aa]">Loading alerts...</div>;
  }

  return (
    <div className="overflow-y-auto p-8">
      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[30px] font-bold gradient-text leading-[36px]">
            Price Alerts
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {showCreateForm ? 'Cancel' : '+ Create Alert'}
          </button>
        </div>
        <p className="text-base text-[#a1a1aa]">
          Set up price alerts and get notified when conditions are met
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 glass rounded-lg">
          <p className="text-sm text-[#a1a1aa]">Total Alerts</p>
          <p className="text-2xl font-bold text-[#fafafa]">{stats.total}</p>
        </div>
        <div className="p-4 glass rounded-lg">
          <p className="text-sm text-[#05df72]">Active</p>
          <p className="text-2xl font-bold text-[#05df72]">{stats.active}</p>
        </div>
        <div className="p-4 glass rounded-lg">
          <p className="text-sm text-[#06b6d4]">Triggered</p>
          <p className="text-2xl font-bold text-[#06b6d4]">{stats.triggered}</p>
        </div>
        <div className="p-4 glass rounded-lg">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-gray-800">{stats.cancelled}</p>
        </div>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateAlert} className="mb-6 p-6 glass rounded-xl">
          <h3 className="text-lg font-semibold text-[#fafafa] mb-4">Create New Alert</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full px-3 py-2 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] focus:border-[#7c3aed] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Alert Type</label>
              <select
                value={formData.alertType}
                onChange={(e) => setFormData({ ...formData, alertType: e.target.value as AlertType })}
                className="w-full px-3 py-2 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] focus:border-[#7c3aed] focus:outline-none"
              >
                <option value={AlertType.PRICE_ABOVE}>Price Above</option>
                <option value={AlertType.PRICE_BELOW}>Price Below</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Target Value</label>
            <input
              type="number"
              step="0.01"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] focus:border-[#7c3aed] focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">Message (Optional)</label>
            <input
              type="text"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 bg-[#27272a] border border-[#3f3f46] rounded-lg text-[#fafafa] focus:border-[#7c3aed] focus:outline-none"
              placeholder="Custom alert message"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Create Alert
          </button>
        </form>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-[#a1a1aa] glass rounded-xl p-8">
            No alerts yet. Create your first alert!
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className="p-4 glass rounded-xl hover-glow transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-[#fafafa]">{alert.symbol}</h3>
                  <p className="text-sm text-[#a1a1aa]">{getAlertTypeLabel(alert.alertType)}: ${alert.targetValue.toLocaleString()}</p>
                  {alert.message && <p className="text-sm text-[#a1a1aa] mt-1">{alert.message}</p>}
                </div>
                <div className="flex gap-2 items-center">
                  {getStatusBadge(alert.status)}
                  {alert.status === AlertStatus.ACTIVE && (
                    <button
                      onClick={() => handleCancelAlert(alert._id)}
                      className="px-3 py-1 text-xs bg-[#f59e0b] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="px-3 py-1 text-xs bg-[#ff6467] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {alert.triggeredAt && (
                <div className="mt-2 p-2 bg-[#06b6d4]/20 rounded-lg text-sm">
                  <p className="text-[#06b6d4]">
                    Triggered at ${alert.triggeredPrice?.toLocaleString()} on {new Date(alert.triggeredAt).toLocaleString()}
                  </p>
                </div>
              )}

              <p className="text-xs text-[#71717a] mt-2">
                Created: {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

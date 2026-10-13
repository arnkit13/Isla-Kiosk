// API Client connecting to Spring Boot Backend
const API_BASE = '/api';

export const api = {
  // Menu
  async getMenu() {
    try {
      const res = await fetch(`${API_BASE}/menu`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      return await res.json();
    } catch (err) {
      console.warn('API error, using local fallback:', err);
      return null;
    }
  },

  async getAddOns() {
    try {
      const res = await fetch(`${API_BASE}/menu/addons`);
      if (!res.ok) throw new Error('Failed to fetch addons');
      return await res.json();
    } catch (err) {
      console.warn('API error:', err);
      return [
        { id: 'add-1', name: 'Coffee Jelly', price: 11 },
        { id: 'add-2', name: 'Espresso Shot', price: 11 },
        { id: 'add-3', name: 'Strawberry Jam', price: 11 },
        { id: 'add-4', name: 'Cream Cloud', price: 11 },
        { id: 'add-5', name: 'Condensed Milk', price: 11 },
        { id: 'add-6', name: 'Syrup (Vanilla/Hazelnut/Caramel)', price: 11 },
      ];
    }
  },

  // Orders
  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return await res.json();
  },

  async getAllOrders(status) {
    const url = status ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  },

  async getWaitingList() {
    const res = await fetch(`${API_BASE}/orders/waiting-list`);
    if (!res.ok) throw new Error('Failed to fetch waiting list');
    return await res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  },

  async cancelOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // Sales
  async getDailySales(dateStr) {
    const url = dateStr ? `${API_BASE}/sales/daily?date=${dateStr}` : `${API_BASE}/sales/daily`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch daily sales');
    return await res.json();
  },

  async getMonthlySales(year, month) {
    let url = `${API_BASE}/sales/monthly`;
    if (year && month) {
      url += `?year=${year}&month=${month}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch monthly sales');
    return await res.json();
  },

  async getOverallSummary() {
    const res = await fetch(`${API_BASE}/sales/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/sales/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return await res.json();
  }
};

import React, { useState, useEffect, useCallback } from 'react';
import LoginPortal from './components/LoginPortal';
import BartenderView from './components/BartenderView';
import OwnerDashboard from './components/OwnerDashboard';
import ReceiptModal from './components/ReceiptModal';
import { api } from './services/api';
import { FALLBACK_MENU } from './data/menuData';

// Pleasant notification chime using Web Audio API
const playReadyChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio might be blocked until user gesture
  }
};

export default function App() {
  // Screen routing: 'portal' | 'bartender' | 'owner'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('isla_kiosk_role') || 'portal';
  });

  const [menuItems, setMenuItems] = useState(FALLBACK_MENU);
  const [allOrders, setAllOrders] = useState([]);
  const [waitingOrders, setWaitingOrders] = useState([]);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const handleSetRole = (role) => {
    setCurrentRole(role);
    localStorage.setItem('isla_kiosk_role', role);
  };

  // Load menu from backend
  useEffect(() => {
    async function loadMenu() {
      const serverMenu = await api.getMenu();
      if (serverMenu && serverMenu.length > 0) {
        const merged = serverMenu.map((item) => {
          const fallback = FALLBACK_MENU.find((f) => f.id === item.id);
          return {
            ...item,
            color: fallback?.color || '#5C3A21',
            imageUrl: item.imageUrl || fallback?.imageUrl || '',
          };
        });
        setMenuItems(merged);
      }
    }
    loadMenu();
  }, []);

  // Poll orders & waiting list
  const refreshOrders = useCallback(async () => {
    try {
      const [ordersList, waitingList] = await Promise.all([
        api.getAllOrders(),
        api.getWaitingList(),
      ]);
      if (ordersList) setAllOrders(ordersList);
      if (waitingList) setWaitingOrders(waitingList);
    } catch (err) {
      console.warn('Sync error:', err);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
    const interval = setInterval(refreshOrders, 3500);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  // Handle order placed
  const handleOrderPlaced = async (orderPayload) => {
    const created = await api.createOrder(orderPayload);
    await refreshOrders();
    return created;
  };

  // Handle status update (e.g. READY or COMPLETED)
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'READY') {
      playReadyChime();
    }
    await api.updateOrderStatus(orderId, newStatus);
    await refreshOrders();
  };

  return (
    <div className="app-container">
      {/* SCREEN 1: Role Login Portal */}
      {currentRole === 'portal' && (
        <LoginPortal
          onLoginBartender={() => handleSetRole('bartender')}
          onLoginOwner={() => handleSetRole('owner')}
        />
      )}

      {/* SCREEN 2: Bartender Screen (Ordering POS + Now Preparing & Please Claim) */}
      {currentRole === 'bartender' && (
        <BartenderView
          menuItems={menuItems}
          waitingOrders={waitingOrders}
          onOrderPlaced={handleOrderPlaced}
          onUpdateStatus={handleUpdateStatus}
          onViewReceipt={(order) => setReceiptOrder(order)}
          onLogout={() => handleSetRole('portal')}
        />
      )}

      {/* SCREEN 3: Owner Screen (Daily/Monthly Analytics & Excel Export) */}
      {currentRole === 'owner' && (
        <OwnerDashboard
          onViewReceipt={(order) => setReceiptOrder(order)}
          onLogout={() => handleSetRole('portal')}
        />
      )}

      {/* Receipt Modal (Common across screens if needed) */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
}

import React from 'react';
import { Coffee, Bell, CheckCircle2 } from 'lucide-react';

export default function CustomerDisplay({ orders }) {
  const preparingOrders = orders.filter(
    (o) => o.status === 'PREPARING' || o.status === 'PENDING'
  );
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="tv-display-container">
      {/* Banner */}
      <div className="tv-banner">
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.04em', margin: 0, color: '#FFFFFF' }}>
          ISLA DEL CAFE • ORDER QUEUE
        </h1>
        <p style={{ color: 'var(--accent-gold)', fontSize: '1rem', marginTop: '6px', fontWeight: 600 }}>
          Please watch for your order number below. Freshly crafted beverages.
        </p>
      </div>

      {/* Split Grid */}
      <div className="tv-grid">
        {/* LEFT: NOW PREPARING */}
        <div className="tv-column">
          <div className="tv-col-header">
            <div className="tv-col-title">
              <Coffee size={28} color="var(--color-espresso)" />
              <span>Now Preparing</span>
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-espresso)' }}>
              {preparingOrders.length}
            </span>
          </div>

          <div className="tv-cards-list">
            {preparingOrders.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '60px', fontSize: '1.1rem', fontWeight: 600 }}>
                All orders prepared
              </div>
            ) : (
              preparingOrders.map((o) => (
                <div key={o.id} className="tv-order-pill">
                  <div className="tv-num">{o.orderNumber}</div>
                  <div className="tv-name">{o.customerName}</div>
                  <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    {o.items?.length || 1} {o.items?.length === 1 ? 'drink' : 'drinks'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: READY FOR PICKUP */}
        <div className="tv-column tv-col-ready">
          <div className="tv-col-header" style={{ borderColor: '#A7F3D0' }}>
            <div className="tv-col-title">
              <Bell size={28} color="#047857" />
              <span style={{ color: '#047857' }}>Ready For Pickup</span>
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#047857' }}>
              {readyOrders.length}
            </span>
          </div>

          <div className="tv-cards-list">
            {readyOrders.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '60px', fontSize: '1.1rem', fontWeight: 600 }}>
                No orders ready for pickup currently
              </div>
            ) : (
              readyOrders.map((o) => (
                <div key={o.id} className="tv-order-pill">
                  <div className="tv-num">{o.orderNumber}</div>
                  <div className="tv-name" style={{ color: '#047857' }}>
                    {o.customerName}
                  </div>
                  <span style={{ background: '#047857', color: '#FFFFFF', fontWeight: 800, padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem' }}>
                    PLEASE CLAIM
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

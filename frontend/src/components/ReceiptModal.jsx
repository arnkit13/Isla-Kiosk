import React from 'react';
import { X, Printer } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '390px', background: 'transparent', border: 'none', boxShadow: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="receipt-paper">
          {/* Header */}
          <div className="receipt-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <img
                src="/isla-logo.png"
                alt="ISLA DEL CAFE"
                style={{ width: '56px', height: '56px', objectFit: 'contain' }}
              />
            </div>
            <div className="receipt-title">ISLA DEL CAFE</div>
            <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '2px' }}>Carcar Branch, Cebu</div>
            <div style={{ fontSize: '0.74rem', color: '#777' }}>isladelcafe.ph</div>
            <div className="receipt-divider"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
              <span>ORDER {order.orderNumber}</span>
              <span>{order.status || 'PENDING'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#444', marginTop: '4px' }}>
              <span>Customer:</span>
              <span style={{ fontWeight: 'bold' }}>{order.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
              <span>Date:</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>₱{item.itemTotal?.toFixed(2)}</span>
                </div>
                {item.notes && (
                  <div style={{ fontSize: '0.75rem', color: '#777', fontStyle: 'italic', paddingLeft: '16px', marginTop: '2px' }}>
                    Note: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="receipt-divider"></div>

          {/* Financials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.05rem' }}>
              <span>TOTAL</span>
              <span>₱{order.totalAmount?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
              <span>Payment ({order.paymentMethod || 'Cash'}):</span>
              <span>₱{(order.amountPaid || order.totalAmount)?.toFixed(2)}</span>
            </div>
            {order.changeAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857', fontWeight: 'bold' }}>
                <span>Change:</span>
                <span>₱{order.changeAmount?.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="receipt-divider"></div>

          {/* Footer message */}
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#555', marginTop: '12px' }}>
            <p style={{ fontWeight: 'bold' }}>Thank you for visiting Isla Del Cafe!</p>
            <p style={{ marginTop: '4px', fontSize: '0.72rem', color: '#777' }}>Please present this slip at the pickup counter.</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--color-espresso)',
              color: '#FFFFFF',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Printer size={18} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--bg-surface)',
              color: 'var(--color-espresso)',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

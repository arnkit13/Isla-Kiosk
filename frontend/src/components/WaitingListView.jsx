import React, { useState } from 'react';
import { Clock, CheckCircle2, Flame, Bell, Receipt, Search, RefreshCw, User } from 'lucide-react';
import DrinkImage from './DrinkImage';

export default function WaitingListView({
  orders,
  onUpdateStatus,
  onViewReceipt,
  onRefresh,
}) {
  const [filterStatus, setFilterStatus] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus =
        order.status === 'PENDING' ||
        order.status === 'PREPARING' ||
        order.status === 'READY';
    } else if (filterStatus !== 'all') {
      matchesStatus = order.status === filterStatus;
    }

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order.customerName?.toLowerCase().includes(query) ||
      order.orderNumber?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const getTimeElapsed = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  return (
    <div className="waiting-list-view">
      {/* Header Bar */}
      <div className="queue-header-bar">
        <div className="queue-title-group">
          <h2>Waiting List & Live Order Queue</h2>
          <p className="queue-subtitle">
            Manage live orders, start beverage preparation, and mark ready for customer pickup
          </p>
        </div>

        {/* Filter buttons & search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="search-bar-wrapper" style={{ minWidth: '220px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              style={{ padding: '8px 14px 8px 38px', fontSize: '0.85rem' }}
              placeholder="Search order number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="queue-filters">
            {[
              { id: 'active', label: 'Active Queue' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'PREPARING', label: 'Preparing' },
              { id: 'READY', label: 'Ready' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'all', label: 'All Orders' },
            ].map((f) => (
              <button
                key={f.id}
                className={`queue-filter-btn ${filterStatus === f.id ? 'active' : ''}`}
                onClick={() => setFilterStatus(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            title="Refresh Orders"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-espresso)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Queue Grid */}
      {filteredOrders.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-espresso)', marginBottom: '6px' }}>
            No orders found in this view
          </h3>
          <p style={{ fontSize: '0.88rem' }}>
            {filterStatus === 'active'
              ? 'All customer drinks have been completed. Go to Bartender POS to take new orders.'
              : 'Try changing the status filter or search query.'}
          </p>
        </div>
      ) : (
        <div className="queue-grid">
          {filteredOrders.map((order) => {
            const statusClass = `status-${order.status?.toLowerCase()}`;
            return (
              <div key={order.id} className={`queue-card ${statusClass}`}>
                {/* Header */}
                <div>
                  <div className="queue-card-header">
                    <span className="queue-order-badge">{order.orderNumber}</span>
                    <span className="queue-status-tag">{order.status}</span>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div className="queue-customer-name">
                      <User size={18} color="var(--color-espresso)" />
                      <span>{order.customerName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        {getTimeElapsed(order.createdAt)}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        • {order.paymentMethod} • ₱{order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Box with Thumbnails */}
                <div className="queue-items-box">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="queue-item-row">
                      <div className="queue-item-left">
                        <DrinkImage
                          imageUrl={item.imageUrl}
                          name={item.name}
                          category={item.category}
                          variant="queue"
                        />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-espresso)' }}>
                            {item.quantity}x {item.name}
                          </div>
                          {item.selectedAddOns?.length > 0 && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--accent-caramel)', fontWeight: 600 }}>
                              +{item.selectedAddOns.join(', ')}
                            </div>
                          )}
                          {item.notes && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                              Note: {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-espresso)' }}>
                        ₱{item.itemTotal?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Actions */}
                <div className="queue-card-actions">
                  {order.status === 'PENDING' && (
                    <button
                      className="action-btn action-btn-prep"
                      onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                    >
                      <Flame size={15} />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      className="action-btn action-btn-ready"
                      onClick={() => onUpdateStatus(order.id, 'READY')}
                    >
                      <Bell size={15} />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      className="action-btn action-btn-complete"
                      onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                    >
                      <CheckCircle2 size={15} />
                      <span>Complete / Served</span>
                    </button>
                  )}

                  {order.status === 'COMPLETED' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontSize: '0.85rem', fontWeight: 800, padding: '8px' }}>
                      <CheckCircle2 size={16} />
                      <span>Order Completed</span>
                    </div>
                  )}

                  <button
                    onClick={() => onViewReceipt(order)}
                    title="View Receipt"
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-sand-dark)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-espresso)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Receipt size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

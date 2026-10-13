import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Banknote,
  AlertCircle,
  Check,
  Coffee,
  Bell,
  Clock,
  LogOut,
  Receipt,
  User,
  Flame,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

import { CATEGORIES } from '../data/menuData';
import DrinkImage from './DrinkImage';

export default function BartenderView({
  menuItems = [],
  waitingOrders = [],
  onOrderPlaced,
  onUpdateStatus,
  onViewReceipt,
  onLogout,
}) {
  const [bartenderTab, setBartenderTab] = useState('pos'); // 'pos' | 'queue'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState(false);
  const cartSidebarRef = useRef(null);

  const handleScrollToCart = () => {
    if (cartSidebarRef.current) {
      cartSidebarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Direct 1-Click Add to Cart (no add-on modal)
  const handleDirectAddToCart = (item) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.menuItemId === item.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        const exist = next[existingIdx];
        const newQty = exist.quantity + 1;
        next[existingIdx] = {
          ...exist,
          quantity: newQty,
          itemTotal: exist.unitPrice * newQty,
        };
        return next;
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          category: item.category,
          unitPrice: item.price,
          quantity: 1,
          selectedAddOns: [],
          notes: '',
          itemTotal: item.price,
          imageUrl: item.imageUrl || '',
        },
      ];
    });
  };

  const handleUpdateQty = (index, delta) => {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      next[index] = {
        ...item,
        quantity: newQty,
        itemTotal: item.unitPrice * newQty,
      };
      return next;
    });
  };

  const handleRemoveItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
    setCustomerName('');
    setCashTendered('');
    setNameError(false);
  };

  // Cart calculations
  const grandTotal = cart.reduce((acc, curr) => acc + curr.itemTotal, 0);
  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = tenderedNum >= grandTotal ? tenderedNum - grandTotal : 0;

  // Submit Order
  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      setNameError(true);
      return;
    }
    if (cart.length === 0) return;

    setNameError(false);
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        paymentMethod,
        amountPaid:
          paymentMethod === 'Cash'
            ? tenderedNum >= grandTotal
              ? tenderedNum
              : grandTotal
            : grandTotal,
        changeAmount: paymentMethod === 'Cash' ? changeDue : 0,
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          category: i.category,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          selectedAddOns: [],
          notes: i.notes || '',
          itemTotal: i.itemTotal,
        })),
      };

      const created = await onOrderPlaced(orderPayload);
      handleClearCart();
      if (created && onViewReceipt) {
        onViewReceipt(created);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      alert('Could not place order. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Queue Counts
  const preparingOrders = waitingOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PREPARING'
  );
  const readyOrders = waitingOrders.filter((o) => o.status === 'READY');

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
    <div className="bartender-view">
      {/* Top Bar */}
      <header className="bartender-top-bar">
        <div className="bartender-title-box" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          <img
            src="/isla-logo.png"
            alt="ISLA DEL CAFE"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              objectFit: 'contain',
              background: '#FFFFFF',
              padding: '3px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          />
          <div>
            <span className="bartender-role-tag">BARISTA TERMINAL</span>
            <h1 className="bartender-heading">ISLA DEL CAFE</h1>
          </div>
        </div>

        {/* View Switcher: POS vs Queue */}
        <div className="bartender-nav-tabs">
          <button
            id="tab-pos-ordering"
            type="button"
            className={`bartender-nav-btn ${bartenderTab === 'pos' ? 'active' : ''}`}
            onClick={() => setBartenderTab('pos')}
          >
            <ShoppingBag size={17} />
            <span>Ordering & POS</span>
            {cart.length > 0 && (
              <span className="bartender-tab-badge cart-badge">{totalItemsCount}</span>
            )}
          </button>

          <button
            id="tab-live-queue"
            type="button"
            className={`bartender-nav-btn ${bartenderTab === 'queue' ? 'active' : ''}`}
            onClick={() => setBartenderTab('queue')}
          >
            <Clock size={17} />
            <span>Now Preparing & Please Claim</span>
            {(preparingOrders.length > 0 || readyOrders.length > 0) && (
              <span className="bartender-tab-badge queue-badge">
                {preparingOrders.length + readyOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Info & Exit */}
        <div className="bartender-top-right">
          <div
            className="queue-quick-ticker"
            onClick={() => setBartenderTab('queue')}
            title="Click to view live queue"
          >
            <span className="ticker-pill preparing">
              <Flame size={13} /> {preparingOrders.length} Preparing
            </span>
            <span className="ticker-pill ready">
              <Bell size={13} /> {readyOrders.length} Claim
            </span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="bartender-exit-btn"
              title="Exit Bartender Terminal"
            >
              <LogOut size={15} />
              <span>Exit</span>
            </button>
          )}
        </div>
      </header>

      {/* VIEW 1: POS ORDERING */}
      {bartenderTab === 'pos' && (
        <main className="main-view-container">
          <div className="pos-layout">
            {/* Menu Catalog Section */}
            <section className="menu-section">
              {/* Category Filter Pills */}
              <div className="category-bar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.label}</span>
                    {cat.priceTag && <span className="cat-badge">{cat.priceTag}</span>}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="search-bar-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search coffee, matcha, milk-based, juice, blended..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Menu Grid */}
              <div className="menu-grid">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="drink-card"
                    onClick={() => handleDirectAddToCart(item)}
                    title={`Click to add ${item.name} to order`}
                  >
                    {/* Picture Area */}
                    <div className="drink-card-image-box">
                      <DrinkImage
                        imageUrl={item.imageUrl}
                        name={item.name}
                        category={item.category}
                        variant="card"
                      />
                      {item.bestSeller && (
                        <span className="bestseller-ribbon">Popular</span>
                      )}
                    </div>

                    {/* Drink Info & Price */}
                    <div className="drink-card-body">
                      <div>
                        <span className="drink-category-tag">{item.category}</span>
                        <h3 className="drink-title">{item.name}</h3>
                        <p className="drink-desc">{item.description}</p>
                      </div>

                      <div className="drink-footer">
                        <span className="drink-price">₱{item.price}</span>
                        <button
                          type="button"
                          className="add-btn"
                          title="Add to order"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectAddToCart(item);
                          }}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cart & Checkout Sidebar */}
            <aside className="cart-sidebar" ref={cartSidebarRef} id="cart-sidebar">
              {/* Cart Header */}
              <div className="cart-header">
                <div className="cart-title">
                  <ShoppingBag size={20} color="var(--accent-caramel)" />
                  <span>Current Order</span>
                  {cart.length > 0 && (
                    <span className="cat-badge">{totalItemsCount}</span>
                  )}
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    className="clear-cart-btn"
                    onClick={handleClearCart}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Name Input (Required) */}
              <div className={`customer-input-box ${nameError ? 'error' : ''}`}>
                <label className="input-label">Customer Name (Required)</label>
                <input
                  type="text"
                  className="customer-input"
                  placeholder="e.g. Arn"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                />
                {nameError && (
                  <span
                    style={{
                      color: '#D94F70',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    Please enter customer name before placing order
                  </span>
                )}
              </div>

              {/* Cart Items List */}
              <div className="cart-items-list">
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <div className="cart-empty-icon">
                      <Coffee size={24} />
                    </div>
                    <p style={{ fontWeight: 700, color: 'var(--color-espresso)' }}>
                      Order is empty
                    </p>
                    <p style={{ fontSize: '0.82rem' }}>
                      Click any beverage card on the left to add it directly to this order.
                    </p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="cart-item-row">
                      <div className="cart-item-main">
                        <DrinkImage
                          imageUrl={item.imageUrl}
                          name={item.name}
                          category={item.category}
                          variant="thumb"
                        />
                        <div className="cart-item-info">
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-unit-price">
                            ₱{item.unitPrice} each
                          </div>
                        </div>
                        <div className="cart-item-total">
                          ₱{item.itemTotal.toFixed(2)}
                        </div>
                      </div>

                      <div className="cart-item-footer">
                        <div className="qty-control">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleUpdateQty(index, -1)}
                            title="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="qty-text">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleUpdateQty(index, 1)}
                            title="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => handleRemoveItem(index)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Financial Summary & Checkout */}
              {cart.length > 0 && (
                <div className="cart-summary">
                  {/* Payment Method Selector */}
                  <div className="payment-methods">
                    {['Cash', 'GCash', 'Card'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={`pay-btn ${paymentMethod === method ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        {method === 'Cash' && <Banknote size={14} />}
                        {method === 'GCash' && <Check size={14} />}
                        {method === 'Card' && <CreditCard size={14} />}
                        <span>{method}</span>
                      </button>
                    ))}
                  </div>

                  {/* Cash Tender & Change */}
                  {paymentMethod === 'Cash' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="cash-tender-row">
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          Tendered: ₱
                        </span>
                        <input
                          type="number"
                          className="cash-tender-input"
                          placeholder={grandTotal.toString()}
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Exact', val: grandTotal },
                          { label: '₱50', val: 50 },
                          { label: '₱100', val: 100 },
                          { label: '₱200', val: 200 },
                          { label: '₱500', val: 500 },
                          { label: '₱1000', val: 1000 },
                        ].map((b, idx) => (
                          <button
                            key={idx}
                            type="button"
                            style={{
                              background: 'var(--bg-sand-dark)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-pill)',
                              padding: '3px 9px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: 'var(--color-espresso)',
                              cursor: 'pointer',
                            }}
                            onClick={() => setCashTendered(b.val.toString())}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>

                      <div className="change-display">
                        <span style={{ color: 'var(--color-text-muted)' }}>Change Due:</span>
                        <span
                          style={{
                            color: '#047857',
                            fontSize: '1.05rem',
                            fontWeight: 800,
                          }}
                        >
                          ₱{changeDue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="totals-row">
                    <span className="totals-label">Grand Total</span>
                    <span className="grand-total-amount">
                      ₱{grandTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="button"
                    id="place-order-submit-btn"
                    className="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || cart.length === 0}
                  >
                    {isSubmitting ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span>Place Order & Send to Queue</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </aside>
          </div>

          {/* Mobile Floating Cart Summary Bar */}
          {cart.length > 0 && (
            <div
              className="mobile-floating-cart-bar"
              onClick={handleScrollToCart}
              role="button"
              tabIndex={0}
            >
              <div className="mobile-floating-cart-left">
                <div className="mobile-floating-cart-icon-pill">
                  <ShoppingBag size={18} />
                  <span>{totalItemsCount}</span>
                </div>
                <div className="mobile-floating-cart-text">
                  <span className="mobile-floating-cart-total">₱{grandTotal.toFixed(2)}</span>
                  <span className="mobile-floating-cart-count">
                    {totalItemsCount} {totalItemsCount === 1 ? 'drink' : 'drinks'} in order
                  </span>
                </div>
              </div>
              <div className="mobile-floating-cart-btn">
                <span>View Order</span>
                <ArrowRight size={16} />
              </div>
            </div>
          )}
        </main>

      )}

      {/* VIEW 2: NOW PREPARING & PLEASE CLAIM (Integrated Queue Board) */}
      {bartenderTab === 'queue' && (
        <main className="main-view-container">
          <div className="integrated-queue-view">
            <div className="queue-controls-bar">
              <div>
                <h2 className="integrated-queue-title">Live Beverage Queue</h2>
                <p className="integrated-queue-subtitle">
                  Track drinks in preparation and notify customers when ready for claim
                </p>
              </div>
              <button
                type="button"
                className="queue-new-order-btn"
                onClick={() => setBartenderTab('pos')}
              >
                <Plus size={16} />
                <span>Take New Order</span>
              </button>
            </div>

            <div className="split-queue-board">
              {/* COLUMN 1: NOW PREPARING */}
              <div className="split-queue-col preparing-col">
                <div className="split-col-header preparing-header">
                  <div className="split-col-title-group">
                    <Flame size={20} color="#C94A29" />
                    <h3>Now Preparing</h3>
                  </div>
                  <span className="split-col-badge preparing-badge">
                    {preparingOrders.length}
                  </span>
                </div>
                <p className="split-col-subtext">
                  Beverages currently being crafted by barista
                </p>

                <div className="split-col-cards-list">
                  {preparingOrders.length === 0 ? (
                    <div className="split-col-empty">
                      <CheckCircle2 size={36} color="var(--accent-warm)" />
                      <p className="empty-title">All caught up!</p>
                      <p className="empty-desc">No orders waiting to be prepared.</p>
                    </div>
                  ) : (
                    preparingOrders.map((order) => (
                      <div key={order.id} className="bartender-order-card preparing-card">
                        <div className="card-top-info">
                          <span className="order-number-pill">{order.orderNumber}</span>
                          <span className="order-elapsed-time">
                            <Clock size={12} /> {getTimeElapsed(order.createdAt)}
                          </span>
                        </div>

                        <div className="order-customer-row">
                          <User size={16} color="var(--color-espresso)" />
                          <span className="order-customer-name">{order.customerName}</span>
                        </div>

                        {/* WHAT THEY ORDERED (Prominent & Clear, No Add-ons) */}
                        <div className="order-items-manifest">
                          <div className="manifest-label">Items to Prepare:</div>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="manifest-item-line">
                              <span className="manifest-qty">{item.quantity}x</span>
                              <span className="manifest-name">{item.name}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="mark-ready-btn"
                          onClick={() => onUpdateStatus(order.id, 'READY')}
                        >
                          <Bell size={16} />
                          <span>Ready &bull; Move to Please Claim</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 2: PLEASE CLAIM */}
              <div className="split-queue-col claim-col">
                <div className="split-col-header claim-header">
                  <div className="split-col-title-group">
                    <Bell size={20} color="#2E7D32" />
                    <h3>Please Claim</h3>
                  </div>
                  <span className="split-col-badge claim-badge">
                    {readyOrders.length}
                  </span>
                </div>
                <p className="split-col-subtext">
                  Drinks ready at counter for customer pickup
                </p>

                <div className="split-col-cards-list">
                  {readyOrders.length === 0 ? (
                    <div className="split-col-empty">
                      <Clock size={36} color="var(--color-text-muted)" />
                      <p className="empty-title">No orders waiting for claim</p>
                      <p className="empty-desc">Mark orders ready from the preparing column.</p>
                    </div>
                  ) : (
                    readyOrders.map((order) => (
                      <div key={order.id} className="bartender-order-card claim-card">
                        <div className="card-top-info">
                          <span className="order-number-pill ready-pill">
                            {order.orderNumber}
                          </span>
                          <span className="order-status-ready-tag">READY FOR CLAIM</span>
                        </div>

                        <div className="order-customer-row">
                          <User size={16} color="var(--color-espresso)" />
                          <span className="order-customer-name">{order.customerName}</span>
                        </div>

                        {/* WHAT THEY ORDERED */}
                        <div className="order-items-manifest claim-manifest">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="manifest-item-line">
                              <span className="manifest-qty">{item.quantity}x</span>
                              <span className="manifest-name">{item.name}</span>
                            </div>
                          ))}
                        </div>

                        <div className="claim-card-actions">
                          <button
                            type="button"
                            className="mark-completed-btn"
                            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                          >
                            <CheckCircle2 size={16} />
                            <span>Claimed & Done</span>
                          </button>
                          <button
                            type="button"
                            className="view-receipt-mini-btn"
                            onClick={() => onViewReceipt(order)}
                            title="View Receipt"
                          >
                            <Receipt size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { ADDONS_LIST } from '../data/menuData';
import DrinkImage from './DrinkImage';

export default function DrinkCustomizerModal({ item, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const toggleAddOn = (addonName) => {
    if (selectedAddOns.includes(addonName)) {
      setSelectedAddOns(selectedAddOns.filter((name) => name !== addonName));
    } else {
      setSelectedAddOns([...selectedAddOns, addonName]);
    }
  };

  const addOnsTotal = selectedAddOns.length * 11;
  const unitTotal = item.price + addOnsTotal;
  const grandTotal = unitTotal * quantity;

  const handleConfirm = () => {
    onAddToCart({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      unitPrice: item.price,
      quantity,
      selectedAddOns,
      addOnsUnitPrice: addOnsTotal,
      itemTotal: grandTotal,
      notes: notes.trim(),
      imageUrl: item.imageUrl || '',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header with Drink Image */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '140px', width: '100%', background: 'var(--bg-sand-dark)' }}>
            <DrinkImage
              imageUrl={item.imageUrl}
              name={item.name}
              category={item.category}
              variant="card"
            />
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              color: 'var(--color-espresso)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drink Details & Form */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '60vh', overflowY: 'auto' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-caramel)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.category}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-espresso)', margin: '2px 0 4px' }}>
              {item.name}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {item.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="input-label">Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-sand-light)', border: '1px solid var(--color-border)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                className="qty-btn"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} />
              </button>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, minWidth: '32px', textAlign: 'center', color: 'var(--color-espresso)' }}>
                {quantity}
              </span>
              <button
                type="button"
                className="qty-btn"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} />
              </button>
              <div style={{ marginLeft: 'auto', fontSize: '0.92rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                ₱{item.price.toFixed(2)} base
              </div>
            </div>
          </div>

          {/* Add-ons selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Add-ons (+₱11 each)</label>
              {selectedAddOns.length > 0 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-caramel)', fontWeight: 700 }}>
                  +₱{addOnsTotal.toFixed(2)} / cup
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {ADDONS_LIST.map((addon) => {
                const isSelected = selectedAddOns.includes(addon.name);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddOn(addon.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: isSelected ? 'var(--color-espresso)' : 'var(--bg-sand-light)',
                      border: `1.5px solid ${isSelected ? 'var(--color-espresso)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-espresso)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <span>{addon.name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.6 }}>+₱11</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes input */}
          <div>
            <label className="input-label">Barista Instructions / Notes</label>
            <input
              type="text"
              placeholder="e.g. Less ice, 25% sweetness, extra hot..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="customer-input"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-sand-light)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-sand-light)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Amount</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-espresso)', fontFamily: 'var(--font-display)' }}>
              ₱{grandTotal.toFixed(2)}
            </div>
          </div>
          <button
            type="button"
            className="place-order-btn"
            style={{ width: 'auto', padding: '12px 24px' }}
            onClick={handleConfirm}
          >
            <Plus size={18} />
            <span>Add to Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}

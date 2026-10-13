import React from 'react';
import { Coffee, Image as ImageIcon } from 'lucide-react';

export default function DrinkImage({
  imageUrl,
  name,
  category,
  className = '',
  style = {},
  variant = 'card', // 'card' | 'thumb' | 'queue'
}) {
  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);

  if (hasImage) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={variant === 'card' ? 'drink-image' : 'cart-item-thumb-img'}
        style={style}
      />
    );
  }

  // Blank photo placeholder for when user hasn't added pictures yet
  if (variant === 'thumb' || variant === 'queue') {
    return (
      <div
        className="cart-item-thumb"
        style={{
          background: 'linear-gradient(135deg, #F0E8DC 0%, #E5DAC8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#5C3A21',
          fontSize: '0.75rem',
          fontWeight: 800,
          ...style,
        }}
        title={`${name} (Photo to be added)`}
      >
        <Coffee size={16} color="#6F4E37" />
      </div>
    );
  }

  return (
    <div className={`drink-image-placeholder ${className}`} style={style}>
      <div className="drink-placeholder-icon">
        <Coffee size={20} color="#5C3A21" />
      </div>
      <span className="drink-placeholder-text">Drink Photo</span>
    </div>
  );
}

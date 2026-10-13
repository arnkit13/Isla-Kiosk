import React, { useState, useEffect } from 'react';
import { Coffee, ClipboardList, BarChart3, Tv, Palmtree } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, waitingCount }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="kiosk-navbar">
      {/* Brand & Branch */}
      <div className="brand-wrapper">
        <div className="brand-logo-badge">
          <Palmtree size={24} strokeWidth={2.2} />
        </div>
        <div className="brand-titles">
          <div className="brand-title">ISLA DEL CAFE</div>
          <div className="brand-subtitle">Carcar Branch • Kiosk System</div>
        </div>
      </div>

      {/* Navigation Mode Switcher */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pos')}
          title="Bartender POS Order Terminal"
        >
          <Coffee size={18} />
          <span>Bartender POS</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
          title="Live Waiting List Queue"
        >
          <ClipboardList size={18} />
          <span>Waiting List</span>
          {waitingCount > 0 && <span className="nav-badge">{waitingCount}</span>}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'owner' ? 'active' : ''}`}
          onClick={() => setActiveTab('owner')}
          title="Owner Sales Reports"
        >
          <BarChart3 size={18} />
          <span>Owner Sales</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'tv' ? 'active' : ''}`}
          onClick={() => setActiveTab('tv')}
          title="Customer Queue Monitor"
        >
          <Tv size={18} />
          <span>TV Display</span>
        </button>
      </nav>

      {/* Right status & time */}
      <div className="navbar-right">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>Online</span>
        </div>
        <div className="current-time">{timeStr}</div>
      </div>
    </header>
  );
}

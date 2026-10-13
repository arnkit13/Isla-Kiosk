import React, { useState } from 'react';
import { Coffee, ShieldCheck, ArrowRight, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPortal({ onLoginBartender, onLoginOwner }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOwnerSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'admin') {
      setErrorMessage('');
      onLoginOwner();
    } else {
      setErrorMessage('Invalid credentials. Use username: admin and password: admin');
    }
  };

  return (
    <div className="login-portal-wrapper">
      <div className="login-portal-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-logo-badge">
            <img
              src="/isla-logo.png"
              alt="ISLA DEL CAFE"
              className="login-logo-img"
            />
          </div>
          <h1 className="login-brand-title">ISLA DEL CAFE</h1>
          <p className="login-brand-subtitle">Carcar Branch, Cebu • Terminal Portal</p>
        </div>

        {/* Portals Grid */}
        <div className="login-portals-grid">
          {/* Bartender Portal (1-Click Login) */}
          <div className="login-option-card bartender-card">
            <div className="login-option-badge">BARTENDER TERMINAL</div>
            <div className="login-option-icon">
              <Coffee size={32} />
            </div>
            <h2 className="login-option-title">Bartender & Barista</h2>
            <p className="login-option-desc">
              Direct drink ordering, customer transactions, and live queue with Now Preparing & Please Claim.
            </p>

            <div className="login-perks-list">
              <div className="login-perk-item">• 1-Click fast drink ordering (no password needed)</div>
              <div className="login-perk-item">• Live Now Preparing & Please Claim management</div>
              <div className="login-perk-item">• Cash, GCash & receipt generator</div>
            </div>

            <button
              id="login-bartender-btn"
              type="button"
              className="login-action-btn bartender-btn"
              onClick={onLoginBartender}
            >
              <span>Login as Bartender</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Owner Portal (admin / admin) */}
          <div className="login-option-card owner-card">
            <div className="login-option-badge owner-badge">OWNER & ADMIN</div>
            <div className="login-option-icon owner-icon">
              <ShieldCheck size={32} />
            </div>
            <h2 className="login-option-title">Owner Dashboard</h2>
            <p className="login-option-desc">
              Monitor daily and monthly gross sales, transaction ledgers, best-sellers, and export reports to Excel.
            </p>

            <form onSubmit={handleOwnerSubmit} className="login-form">
              {errorMessage && (
                <div className="login-error-box">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="login-input-group">
                <label className="login-input-label">Admin Username</label>
                <div className="login-input-wrapper">
                  <User size={16} className="login-input-icon" />
                  <input
                    id="admin-username-input"
                    type="text"
                    className="login-input"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMessage('');
                    }}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-input-group">
                <label className="login-input-label">Admin Password</label>
                <div className="login-input-wrapper">
                  <Lock size={16} className="login-input-icon" />
                  <input
                    id="admin-password-input"
                    type="password"
                    className="login-input"
                    placeholder="admin"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                id="login-owner-btn"
                type="submit"
                className="login-action-btn owner-btn"
              >
                <span>Login as Owner</span>
                <ArrowRight size={18} />
              </button>
              <div className="login-hint-text">
                Owner credentials: <strong>admin</strong> / <strong>admin</strong>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

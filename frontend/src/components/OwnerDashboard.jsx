import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Coffee,
  ShoppingBag,
  Award,
  Download,
  RotateCcw,
  Receipt,
  Calendar,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react';
import { api } from '../services/api';
import { exportDailySalesToExcel, exportMonthlySalesToExcel } from '../utils/excelExport';

export default function OwnerDashboard({ onViewReceipt, onLogout }) {
  const [activePeriod, setActivePeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDailySales = async (date) => {
    setIsLoading(true);
    try {
      const data = await api.getDailySales(date);
      setDailyData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMonthlySales = async (year, month) => {
    setIsLoading(true);
    try {
      const data = await api.getMonthlySales(year, month);
      setMonthlyData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activePeriod === 'daily') {
      loadDailySales(selectedDate);
    } else {
      loadMonthlySales(selectedYear, selectedMonth);
    }
  }, [activePeriod, selectedDate, selectedMonth, selectedYear]);

  const handleResetDemo = async () => {
    if (
      window.confirm(
        'Reset sample sales data with full month records and today transactions?'
      )
    ) {
      await api.resetDemoData();
      if (activePeriod === 'daily') {
        loadDailySales(selectedDate);
      } else {
        loadMonthlySales(selectedYear, selectedMonth);
      }
    }
  };

  const handleExportExcel = () => {
    if (activePeriod === 'daily') {
      exportDailySalesToExcel(dailyData, selectedDate);
    } else {
      exportMonthlySalesToExcel(monthlyData, selectedYear, selectedMonth);
    }
  };

  const maxHourlySales = dailyData?.hourlySales
    ? Math.max(...dailyData.hourlySales.map((h) => h.sales), 100)
    : 100;

  const maxMonthlySales = monthlyData?.dailySales
    ? Math.max(...monthlyData.dailySales.map((d) => d.sales), 1000)
    : 1000;

  return (
    <div className="owner-view">
      {/* Header Bar */}
      <div className="owner-header-bar">
        <div>
          <h2>Owner Sales Reports & Performance</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            Daily revenue totals, monthly sales trends, and beverage analytics
          </p>
        </div>

        {/* Date and Period Controls */}
        <div className="date-controls">
          <div className="period-toggle">
            <button
              className={`period-btn ${activePeriod === 'daily' ? 'active' : ''}`}
              onClick={() => setActivePeriod('daily')}
            >
              Daily Sales
            </button>
            <button
              className={`period-btn ${activePeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setActivePeriod('monthly')}
            >
              Monthly Sales
            </button>
          </div>

          {activePeriod === 'daily' ? (
            <input
              type="date"
              className="date-input-field"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="date-input-field"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {mName}
                  </option>
                ))}
              </select>
              <select
                className="date-input-field"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportExcel}
            title="Download Excel spreadsheet (.xlsx)"
            style={{
              background: 'var(--color-espresso)',
              border: 'none',
              color: 'var(--color-ivory)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <FileSpreadsheet size={16} color="var(--accent-warm)" />
            <span>Export to Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleResetDemo}
            title="Reset Demo Data"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Data</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout from Owner Dashboard"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-espresso)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">
              {activePeriod === 'daily' ? 'Day Revenue' : 'Month Revenue'}
            </span>
            <div className="metric-icon-box">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">
            ₱
            {(activePeriod === 'daily'
              ? dailyData?.totalRevenue || 0
              : monthlyData?.totalRevenue || 0
            ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="metric-subtext">
            {activePeriod === 'daily'
              ? `Total sales on ${selectedDate}`
              : `Sales for ${monthlyData?.monthName || 'Month'} ${selectedYear}`}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Orders Placed</span>
            <div className="metric-icon-box">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="metric-value">
            {activePeriod === 'daily'
              ? dailyData?.totalOrders || 0
              : monthlyData?.totalOrders || 0}
          </div>
          <div className="metric-subtext">Completed customer tickets</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Drinks Brewed</span>
            <div className="metric-icon-box">
              <Coffee size={20} />
            </div>
          </div>
          <div className="metric-value">
            {activePeriod === 'daily'
              ? dailyData?.totalDrinks || 0
              : monthlyData?.totalDrinks || 0}
          </div>
          <div className="metric-subtext">Cups prepared</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">
              {activePeriod === 'daily' ? 'Average Ticket' : 'Avg Daily Sales'}
            </span>
            <div className="metric-icon-box">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value">
            ₱
            {(activePeriod === 'daily'
              ? dailyData?.averageOrderValue || 0
              : monthlyData?.averageDailyRevenue || 0
            ).toFixed(2)}
          </div>
          <div className="metric-subtext">
            {activePeriod === 'daily' ? 'Per transaction average' : 'Calendar day average'}
          </div>
        </div>
      </div>

      {/* DETAILED CHARTS & BREAKDOWNS */}
      {activePeriod === 'daily' ? (
        <div className="dashboard-grid">
          {/* Left: Hourly Sales Visualizer */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-title">Hourly Sales Activity</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Customer order volume by hour
              </span>
            </div>

            <div className="bar-chart-container">
              {dailyData?.hourlySales?.map((h) => {
                const heightPct = (h.sales / maxHourlySales) * 100;
                return (
                  <div key={h.hour} className="bar-column">
                    <div
                      className="bar-fill"
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    >
                      <div className="bar-tooltip">
                        ₱{h.sales.toFixed(0)} ({h.orders} orders)
                      </div>
                    </div>
                    <span className="bar-label">{h.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Split & Category breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '10px' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Payment Methods:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(dailyData?.paymentBreakdown || {}).map(([method, amt]) => (
                    <div
                      key={method}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.88rem',
                        padding: '8px 12px',
                        background: 'var(--bg-sand-light)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{method}</span>
                      <strong style={{ color: 'var(--color-espresso)' }}>₱{amt.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Series Breakdown:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(dailyData?.categoryBreakdown || {}).map(([cat, amt]) => (
                    <div
                      key={cat}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.88rem',
                        padding: '8px 12px',
                        background: 'var(--bg-sand-light)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{cat}</span>
                      <strong style={{ color: 'var(--color-espresso)' }}>₱{amt.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Best Sellers Leaderboard */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-title">Best Sellers for Selected Day</div>
              <Award size={18} color="var(--accent-caramel)" />
            </div>

            <div className="leaderboard-list">
              {dailyData?.topSellingItems?.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px' }}>
                  No sales recorded for this date
                </div>
              ) : (
                dailyData?.topSellingItems?.map((item, idx) => (
                  <div key={idx} className="leaderboard-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={`rank-badge ${idx === 0 ? 'rank-1' : ''}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-espresso)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {item.quantity} cups sold
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-espresso)', fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                      ₱{item.revenue.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MONTHLY SALES VIEW */
        <div className="dashboard-grid">
          {/* Left: Day-by-Day Monthly Trend Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-title">
                {monthlyData?.monthName} {selectedYear} Daily Revenue Trend
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-espresso)', fontWeight: 800 }}>
                Total: ₱{(monthlyData?.totalRevenue || 0).toLocaleString()}
              </span>
            </div>

            <div className="bar-chart-container" style={{ height: '260px' }}>
              {monthlyData?.dailySales?.map((d) => {
                const heightPct = (d.sales / maxMonthlySales) * 100;
                return (
                  <div key={d.day} className="bar-column">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${Math.max(3, heightPct)}%`,
                        background:
                          d.sales > 0
                            ? 'linear-gradient(180deg, var(--color-espresso) 0%, rgba(43,23,14,0.4) 100%)'
                            : 'rgba(0,0,0,0.04)',
                      }}
                    >
                      <div className="bar-tooltip">
                        Day {d.day}: ₱{d.sales.toFixed(0)} ({d.orders} orders)
                      </div>
                    </div>
                    <span className="bar-label">{d.day}</span>
                  </div>
                );
              })}
            </div>

            {/* Monthly Series breakdown */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Monthly Series Revenue:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                {Object.entries(monthlyData?.categoryBreakdown || {}).map(([cat, amt]) => {
                  const pct = monthlyData?.totalRevenue
                    ? ((amt / monthlyData.totalRevenue) * 100).toFixed(1)
                    : 0;
                  return (
                    <div
                      key={cat}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-sand-light)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{cat}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-espresso)', fontSize: '1.05rem' }}>
                          ₱{amt.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Monthly Top Sellers */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-title">Month's Top Sellers</div>
              <Award size={18} color="var(--accent-caramel)" />
            </div>

            <div className="leaderboard-list">
              {monthlyData?.topSellingItems?.map((item, idx) => (
                <div key={idx} className="leaderboard-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className={`rank-badge ${idx === 0 ? 'rank-1' : ''}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-espresso)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {item.quantity} cups sold
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--color-espresso)', fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                    ₱{item.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DAILY ORDERS LEDGER TABLE */}
      {activePeriod === 'daily' && dailyData?.orders && (
        <div className="chart-card" style={{ marginTop: '12px' }}>
          <div className="chart-card-header">
            <div className="chart-title">Transaction Ledger ({selectedDate})</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {dailyData.orders.length} transactions recorded
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 10px' }}>Order #</th>
                  <th style={{ padding: '12px 10px' }}>Time</th>
                  <th style={{ padding: '12px 10px' }}>Customer Name</th>
                  <th style={{ padding: '12px 10px' }}>Items</th>
                  <th style={{ padding: '12px 10px' }}>Payment</th>
                  <th style={{ padding: '12px 10px' }}>Total</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.orders.map((order) => {
                  const time = order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--color-espresso)' }}>
                        {order.orderNumber}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--color-text-muted)' }}>{time}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--color-espresso)' }}>{order.customerName}</td>
                      <td style={{ padding: '12px 10px' }}>
                        {order.items?.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.82rem' }}>
                            {it.quantity}x {it.name}
                            {it.selectedAddOns?.length > 0 && ` (+${it.selectedAddOns.join(', ')})`}
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>{order.paymentMethod}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--color-espresso)' }}>
                        ₱{order.totalAmount?.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="queue-status-tag" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <button
                          onClick={() => onViewReceipt(order)}
                          style={{
                            background: 'var(--bg-sand-dark)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-espresso)',
                            borderRadius: 'var(--radius-xs)',
                            cursor: 'pointer',
                            padding: '6px 8px',
                          }}
                          title="View Receipt"
                        >
                          <Receipt size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

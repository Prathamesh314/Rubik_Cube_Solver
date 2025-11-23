'use client';

import React, { useState, useEffect } from 'react';
import { Users, Gamepad2, Trophy, TrendingUp, Activity, Clock, Calendar, ArrowUpRight, ArrowDownRight, LogOut } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalGamesPlayed: number;
  gamesPlayedToday: number;
  activeUsers: number;
  averageGameTime: number;
  newUsersToday: number;
  userGrowth: number;
  gamesTodayGrowth?: number;
  dailyGames: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch real data from API
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/dashboard?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
        setLoggingOut(true);
      
        localStorage.removeItem("player");
        sessionStorage.removeItem("userId");

        // Redirect to login page or home page after successful logout
        window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container loading-container">
        <div className="loader">
          <div className="loader-ring"></div>
          <div className="loader-icon"><Gamepad2 size={24} /></div>
        </div>
        <p className="loading-text">Initializing System...</p>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container loading-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Dashboard</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (!stats) return null;

  const maxDailyGames = stats.dailyGames.length > 0 
    ? Math.max(...stats.dailyGames.map(d => d.count))
    : 1;

  return (
    <div className="dashboard-container">
      {/* Background Ambient Glows */}
      <div className="glow-bg glow-1" />
      <div className="glow-bg glow-2" />

      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">
              <span className="title-icon"><Activity size={28} /></span>
              Command Center
            </h1>
            <p className="dashboard-subtitle">Live analytics & performance metrics</p>
          </div>
          
          <div className="controls-wrapper">
            <div className="time-tabs">
              {['day', 'week', 'month'].map((t) => (
                <button
                  key={t}
                  className={`tab-btn ${timeRange === t ? 'active' : ''}`}
                  onClick={() => setTimeRange(t as any)}
                >
                  {t === 'day' ? '24H' : t === 'week' ? '7D' : '30D'}
                </button>
              ))}
            </div>
            
            <button 
              className="logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={18} />
              <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* Primary Stats Row */}
        <div className="card stat-card accent-purple">
          <div className="card-header">
            <div className="icon-box"><Users size={20} /></div>
            <span className="card-label">Total Users</span>
          </div>
          <div className="card-body">
            <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
            <div className="stat-badge positive">
              <ArrowUpRight size={14} />
              <span>{stats.newUsersToday} today</span>
            </div>
          </div>
        </div>

        <div className="card stat-card accent-blue">
          <div className="card-header">
            <div className="icon-box"><Gamepad2 size={20} /></div>
            <span className="card-label">Total Games</span>
          </div>
          <div className="card-body">
            <div className="stat-value">{stats.totalGamesPlayed.toLocaleString()}</div>
            <div className="stat-meta">Lifetime plays</div>
          </div>
        </div>

        <div className="card stat-card accent-pink">
          <div className="card-header">
            <div className="icon-box"><TrendingUp size={20} /></div>
            <span className="card-label">Active Now</span>
          </div>
          <div className="card-body">
            <div className="stat-value">{stats.activeUsers.toLocaleString()}</div>
            <div className="live-indicator">
              <span className="pulse-dot"></span>
              Online
            </div>
          </div>
        </div>

        <div className="card stat-card accent-orange">
          <div className="card-header">
            <div className="icon-box"><Clock size={20} /></div>
            <span className="card-label">Avg Session</span>
          </div>
          <div className="card-body">
            <div className="stat-value">
              {stats.averageGameTime.toFixed(1)}
              <span className="unit">m</span>
            </div>
            <div className="stat-meta">Per player</div>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="card chart-card">
          <div className="chart-header-row">
            <div>
              <h3 className="card-title">Activity Volume</h3>
              <p className="card-subtitle">Games played over selected period</p>
            </div>
            <div className="chart-stat-highlight">
              <span className="highlight-label">Peak</span>
              <span className="highlight-value">{maxDailyGames}</span>
            </div>
          </div>
          
          <div className="chart-area">
            {stats.dailyGames.length > 0 ? (
              <>
                <div className="chart-grid-lines">
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                </div>
                <div className="bars-container">
                  {stats.dailyGames.map((day, index) => {
                    const heightPercentage = (day.count / maxDailyGames) * 100;
                    return (
                      <div key={day.date} className="bar-group">
                        <div className="bar-wrapper">
                          <div 
                            className="bar" 
                            style={{ 
                              height: `${heightPercentage}%`,
                              animationDelay: `${index * 0.1}s`
                            }}
                          >
                            <div className="tooltip">
                              <span className="tooltip-count">{day.count}</span>
                              <span className="tooltip-date">
                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="bar-label">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="no-data-message">
                <p>No game data available for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Stats / Highlights */}
        <div className="card highlight-card">
          <div className="highlight-header">
            <Trophy className="highlight-icon" size={24} />
            <h3>Performance</h3>
          </div>
          
          <div className="highlight-metrics">
            <div className="metric-row">
              <span className="metric-label">Games Today</span>
              <span className="metric-val">{stats.gamesPlayedToday}</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${Math.min((stats.gamesPlayedToday / maxDailyGames) * 100, 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="metric-row mt-4">
              <span className="metric-label">User Growth</span>
              <div className="badge-wrapper">
                <span className={`metric-badge ${stats.userGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}%
                </span>
              </div>
            </div>
            <p className="metric-desc">Growth rate compared to previous 7 day period.</p>
          </div>
        </div>
      </main>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg-dark: #09090b;
    --card-bg: rgba(24, 24, 27, 0.6);
    --card-border: rgba(255, 255, 255, 0.08);
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;
    
    --accent-purple: #8b5cf6;
    --accent-blue: #3b82f6;
    --accent-pink: #ec4899;
    --accent-orange: #f97316;
    --accent-green: #10b981;
  }

  /* Layout & Container */
  .dashboard-container {
    min-height: 100vh;
    background-color: var(--bg-dark);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    padding: 2rem;
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient Background Glows */
  .glow-bg {
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    z-index: 0;
    opacity: 0.4;
    pointer-events: none;
  }

  .glow-1 {
    top: -10%;
    left: -10%;
    width: 50vw;
    height: 50vw;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%);
  }

  .glow-2 {
    bottom: -10%;
    right: -10%;
    width: 40vw;
    height: 40vw;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.25), transparent 70%);
  }

  /* Header */
  .dashboard-header {
    position: relative;
    z-index: 10;
    margin-bottom: 2.5rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .dashboard-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    letter-spacing: -0.025em;
    background: linear-gradient(to right, #fff, #cbd5e1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .title-icon {
    color: var(--accent-blue);
    display: flex;
  }

  .dashboard-subtitle {
    margin: 0.5rem 0 0 0;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  /* Controls */
  .controls-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .time-tabs {
    background: rgba(255, 255, 255, 0.03);
    padding: 4px;
    border-radius: 12px;
    border: 1px solid var(--card-border);
    display: flex;
    gap: 4px;
  }

  .tab-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 6px 16px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'JetBrains Mono', monospace;
  }

  .tab-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  .tab-btn.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }

  .logout-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-1px);
  }

  .logout-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .logout-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  /* Grid Layout */
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    position: relative;
    z-index: 10;
  }

  /* Card Styles */
  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s, border-color 0.2s;
  }

  .card:hover {
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    grid-column: span 1;
  }

  .accent-purple .icon-box { color: var(--accent-purple); background: rgba(139, 92, 246, 0.1); }
  .accent-blue .icon-box { color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); }
  .accent-pink .icon-box { color: var(--accent-pink); background: rgba(236, 72, 153, 0.1); }
  .accent-orange .icon-box { color: var(--accent-orange); background: rgba(249, 115, 22, 0.1); }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .unit {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-left: 2px;
  }

  .stat-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
  }

  .stat-badge.positive {
    background: rgba(16, 185, 129, 0.15);
    color: var(--accent-green);
  }

  .stat-badge.negative {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .stat-meta {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--accent-pink);
    font-weight: 600;
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
    animation: pulse 2s infinite;
  }

  /* Chart Section */
  .chart-card {
    grid-column: span 3;
    display: flex;
    flex-direction: column;
    min-height: 320px;
  }

  .chart-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .chart-stat-highlight {
    text-align: right;
  }

  .highlight-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .highlight-value {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }

  .chart-area {
    flex: 1;
    position: relative;
    display: flex;
  }

  .no-data-message {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .chart-grid-lines {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 24px; /* space for labels */
    pointer-events: none;
  }

  .line {
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
  }

  .bars-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding-bottom: 8px;
    z-index: 1;
  }

  .bar-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    gap: 12px;
  }

  .bar-wrapper {
    width: 100%;
    height: 85%; /* Leave room for labels */
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
  }

  .bar {
    width: 40px;
    background: linear-gradient(180deg, #60a5fa 0%, rgba(59, 130, 246, 0.3) 100%);
    border-radius: 6px 6px 2px 2px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: growUp 0.8s ease-out backwards;
    cursor: pointer;
  }

  .bar:hover {
    background: linear-gradient(180deg, #93c5fd 0%, rgba(59, 130, 246, 0.6) 100%);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
    transform: scaleY(1.02);
  }

  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 8px 12px;
    border-radius: 8px;
    pointer-events: none;
    opacity: 0;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
    z-index: 20;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }

  .bar:hover .tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(-12px);
  }

  .tooltip-count {
    font-weight: 700;
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
  }

  .tooltip-date {
    font-size: 0.7rem;
    color: #94a3b8;
    white-space: nowrap;
  }

  .bar-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
  }

  /* Highlight Card (Performance) */
  .highlight-card {
    grid-column: span 1;
    background: linear-gradient(145deg, rgba(24, 24, 27, 0.6) 0%, rgba(16, 185, 129, 0.05) 100%);
  }

  .highlight-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.5rem;
    color: var(--accent-green);
  }
  
  .highlight-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #fff;
  }

  .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .metric-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .metric-val {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .progress-bar-bg {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--accent-green);
    border-radius: 3px;
    transition: width 0.6s ease;
  }

  .mt-4 { margin-top: 1.5rem; }

  .metric-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .metric-badge.positive {
    background: #10b981;
    color: #000;
  }

  .metric-badge.negative {
    background: #ef4444;
    color: #fff;
  }

  .metric-desc {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 1rem;
    line-height: 1.5;
  }

  /* Loading State */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .loader {
    position: relative;
    width: 64px;
    height: 64px;
    margin-bottom: 1.5rem;
  }

  .loader-ring {
    position: absolute;
    inset: 0;
    border: 4px solid rgba(59, 130, 246, 0.1);
    border-top-color: var(--accent-blue);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loader-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-blue);
  }

  .loading-text {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  /* Error State */
  .error-state {
    text-align: center;
    padding: 2rem;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-state h3 {
    color: #ef4444;
    margin-bottom: 0.5rem;
  }

  .error-state p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .retry-button {
    background: var(--accent-blue);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-button:hover {
    background: #60a5fa;
    transform: translateY(-2px);
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes growUp { from { height: 0; opacity: 0; } to { opacity: 1; } }

  /* Responsive */
  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .chart-card {
      grid-column: span 2;
    }
    .highlight-card {
      grid-column: span 2;
    }
  }

  @media (max-width: 640px) {
    .dashboard-container { padding: 1rem; }
    .dashboard-grid { grid-template-columns: 1fr; }
    .stat-card, .chart-card, .highlight-card { grid-column: span 1; }
    .header-content { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .controls-wrapper { 
      width: 100%; 
      flex-direction: column;
      gap: 0.75rem;
    }
    .time-tabs { width: 100%; justify-content: space-between; }
    .tab-btn { flex: 1; }
    .logout-btn {
      width: 100%;
      justify-content: center;
    }
    .bar { width: 24px; }
  }
`;
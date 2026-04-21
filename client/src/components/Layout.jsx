import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />
      <main className="main-content">
        <header style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          background: 'rgba(15, 23, 42, 0.4)',
          position: 'sticky',
          top: 0,
          paddingBottom: '1rem',
          zIndex: 40
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>DGETI Guanajuato Tracker - Inversión Pública</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sync: Online</span>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reporte Global</button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

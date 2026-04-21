import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, School, CalendarCheck, Settings, FileText, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Planteles', icon: School, path: '/planteles' },
    { name: 'Seguimiento Mensual', icon: CalendarCheck, path: '/monthly' },
    { name: 'Configuraciones', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="sidebar glass-panel">
      <div className="logo-section" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.4rem', backgroundColor: 'var(--primary)', borderRadius: '0.5rem' }}>
          <FileText size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>DGETI <span style={{ color: 'var(--primary)' }}>Tracker</span></h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Guanajuato Proyectos</p>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => clsx(
              'btn',
              isActive ? 'btn-primary' : 'btn-ghost'
            )}
            style={{ 
              justifyContent: 'space-between', 
              width: '100%', 
              paddingLeft: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <item.icon size={18} />
              <span>{item.name}</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            AD
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Administrador</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

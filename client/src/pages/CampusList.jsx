import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, ArrowUpRight, Clock, MapPin, Hash } from 'lucide-react';
import { clsx } from 'clsx';
import { format, subDays } from 'date-fns';

const CampusList = () => {
  const navigate = useNavigate();
  const [planteles, setPlanteles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    inactivityDate: ''
  });
  const [showInactivity, setShowInactivity] = useState(false);

  useEffect(() => {
    fetchPlanteles();
  }, [filters, showInactivity]);

  const fetchPlanteles = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (showInactivity && !filters.inactivityDate) {
        params.inactiveSince = format(new Date(), 'yyyy-MM-dd');
      }
      const { data } = await axios.get('/api/planteles', { params });
      setPlanteles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completado': return 'badge-green';
      case 'En proceso': return 'badge-amber';
      case 'Sin entregar': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o CCT..." 
            style={{ 
              width: '100%', 
              padding: '0.6rem 1rem 0.6rem 2.5rem', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '0.5rem',
              color: 'var(--text-main)',
              fontFamily: 'inherit'
            }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <select 
          className="btn btn-ghost" 
          style={{ padding: '0.6rem', outline: 'none' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="" style={{ background: '#1e293b' }}>Todos los Estados</option>
          <option value="Sin entregar" style={{ background: '#1e293b' }}>Sin Entregar</option>
          <option value="En proceso" style={{ background: '#1e293b' }}>En Proceso</option>
          <option value="Completado" style={{ background: '#1e293b' }}>Completado</option>
          <option value="Aprobado" style={{ background: '#1e293b' }}>Aprobado</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
          <input 
            type="checkbox" 
            checked={showInactivity} 
            onChange={(e) => setShowInactivity(e.target.checked)}
          />
          Mostrar Inactivos
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando información...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {planteles.map((p) => (
            <div 
              key={p.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.5rem', 
                cursor: 'pointer', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                transition: 'transform 0.2s'
              }}
              onClick={() => navigate(`/campus/${p.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{p.nombre}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Hash size={12} /> {p.cct}
                  </p>
                </div>
                <div className={clsx('badge', getStatusBadge(p.estado))}>
                  {p.estado || 'Sin Registro'}
                </div>
              </div>

              <div style={{ margin: '0.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                   <span>Avance Global</span>
                   <span>{p.avance_porcentaje}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${p.avance_porcentaje}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 5px var(--primary)' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={12} /> {p.ubicacion}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> {p.last_admin_activity ? format(new Date(p.last_admin_activity), 'dd/MM/yy') : 'Sin actividad'}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampusList;

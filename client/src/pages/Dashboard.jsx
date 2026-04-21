import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { TrendingUp, Users, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const DashboardCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minWidth: '220px', transition: 'transform 0.3s ease' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ padding: '0.6rem', background: `rgba(${color}, 0.1)`, borderRadius: '0.75rem', border: `1px solid rgba(${color}, 0.2)` }}>
        <Icon size={24} color={`rgb(${color})`} />
      </div>
      <div style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Live
      </div>
    </div>
    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{title}</h3>
    <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{value}</div>
    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <TrendingUp size={12} /> {subtext}
    </p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  const chartData = [
    { name: 'Enero', avance: 20 },
    { name: 'Febrero', avance: 45 },
    { name: 'Marzo', avance: 67 },
    { name: 'Abril', avance: 80 },
    { name: 'Mayo', avance: 95 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stats Grid */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <DashboardCard title="Total Planteles" value={stats?.total || 0} subtext="+0% este mes" icon={Users} color="16, 185, 129" />
        <DashboardCard title="Promedio Avance" value={`${stats?.globalAverage || 0}%`} subtext="Progreso real global" icon={CheckCircle} color="99, 102, 241" />
        <DashboardCard title="En Proceso" value="12" subtext="Iniciando" icon={AlertTriangle} color="245, 158, 11" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h3 style={{ fontWeight: 700 }}>Avance de Obra Global</h3>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Semanal</button>
                <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Mensual</button>
             </div>
          </div>
          <div style={{ height: '300px' }}>
             <Bar 
               data={{
                 labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                 datasets: [
                   {
                     label: 'Avance %',
                     data: [15, 30, 45, 60, 75, 80],
                     backgroundColor: '#10b981',
                     borderRadius: 8,
                     borderSkipped: false,
                   }
                 ]
               }}
               options={{
                 responsive: true,
                 maintainAspectRatio: false,
                 plugins: {
                   legend: { display: false },
                   tooltip: {
                     backgroundColor: '#1e293b',
                     titleFont: { family: 'Outfit', size: 14 },
                     bodyFont: { family: 'Outfit', size: 13 },
                     padding: 12,
                     cornerRadius: 8,
                   }
                 },
                 scales: {
                   y: { 
                     beginAtZero: true, 
                     max: 100,
                     grid: { color: 'rgba(255,255,255,0.05)' },
                     ticks: { color: '#94a3b8' }
                   },
                   x: { 
                     grid: { display: false },
                     ticks: { color: '#94a3b8' }
                   }
                 }
               }}
             />
          </div>
        </div>

        {/* Top 5 / Bottom 5 Lists */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>Top 5 - Mejores Avances</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.top5.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '15px' }}>{idx + 1}</span>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.nombre.substring(0, 15)}...</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.cct}</p>
                    </div>
                  </div>
                  <div className="badge badge-green">{p.avance_porcentaje}%</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--danger)' }}>Top 5 - Menores Avances</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.bottom5.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: '15px' }}>{idx + 1}</span>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.nombre.substring(0, 15)}...</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.cct}</p>
                    </div>
                  </div>
                  <div className="badge badge-red">{p.avance_porcentaje}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

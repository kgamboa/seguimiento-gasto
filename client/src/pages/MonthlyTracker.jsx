import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Calendar, Download, FileSpreadsheet, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const MonthlyTracker = () => {
  const [planteles, setPlanteles] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));
  const [loading, setLoading] = useState(true);

  // Generate last 6 months list
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  }).reverse();

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/planteles');
      setPlanteles(data);
    } catch (err) {
      toast.error('Error al cargar datos mensuales');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (proyectoId, field, currentValue) => {
    try {
      const payload = {
        mes: format(selectedMonth, 'yyyy-MM-01'),
        [field]: !currentValue
      };
      await axios.post(`/api/monthly/${proyectoId}`, payload);
      toast.success('Estado actualizado');
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Seguimiento Mensual de Gastos</h2>
          <p style={{ color: 'var(--text-muted)' }}>Control de Estados de Cuenta y Facturación</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0.25rem' }}>
              {months.map((m, i) => (
                <button 
                  key={i}
                  className={format(m, 'MMM') === format(selectedMonth, 'MMM') ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, border: 'none' }}
                  onClick={() => setSelectedMonth(m)}
                >
                  {format(m, 'MMM', { locale: es })}
                </button>
              ))}
           </div>
           <button className="btn btn-ghost"><Download size={16} /> Exportar Excel</button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)' }}>
              <th style={{ padding: '1.25rem' }}>Plantel</th>
              <th style={{ padding: '1.25rem' }}>CCT</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>Edo. Cuenta</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>Facturas / Docs</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>Cuadra con Excel</th>
              <th style={{ padding: '1.25rem', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planteles.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem' }}>
                   <p style={{ fontWeight: 600 }}>{p.nombre}</p>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.ubicacion}</p>
                </td>
                <td style={{ padding: '1.25rem' }}>{p.cct}</td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                   <div 
                      onClick={() => handleToggle(p.proyecto_id, 'entrega_estado_cuenta', p.entrega_estado_cuenta)}
                      style={{ 
                         cursor: 'pointer', margin: '0 auto', width: '24px', height: '24px', borderRadius: '4px',
                         background: p.entrega_estado_cuenta ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.entrega_estado_cuenta ? '#10b981' : '#ef4444'
                      }}
                   >
                      {p.entrega_estado_cuenta ? <Check size={16} /> : <X size={16} />}
                   </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                   <div 
                      onClick={() => handleToggle(p.proyecto_id, 'subio_facturas', p.subio_facturas)}
                      style={{ 
                         cursor: 'pointer', margin: '0 auto', width: '24px', height: '24px', borderRadius: '4px',
                         background: p.subio_facturas ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.subio_facturas ? '#10b981' : '#ef4444'
                      }}
                   >
                      {p.subio_facturas ? <Check size={16} /> : <X size={16} />}
                   </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                   <div 
                      onClick={() => handleToggle(p.proyecto_id, 'cuadra_excel', p.cuadra_excel)}
                      style={{ 
                         cursor: 'pointer', margin: '0 auto', width: '24px', height: '24px', borderRadius: '4px',
                         background: p.cuadra_excel ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.cuadra_excel ? '#10b981' : '#ef4444'
                      }}
                   >
                      {p.cuadra_excel ? <Check size={16} /> : <X size={16} />}
                   </div>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                   <button className="btn btn-ghost" style={{ padding: '0.4rem' }} title="Detalles"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyTracker;

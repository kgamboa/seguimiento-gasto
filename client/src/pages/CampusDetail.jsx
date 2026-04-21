import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, X, MessageSquare, AlertCircle, Calendar, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const CampusDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/plantel/${id}`);
      setData(data);
      if (data.phases.length > 0) setSelectedPhase(data.phases[0]);
    } catch (err) {
      toast.error('Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (phaseId) => {
    try {
      const { data } = await axios.get(`/api/phase/${phaseId}/replies`);
      setReplies(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedPhase) fetchReplies(selectedPhase.id);
  }, [selectedPhase]);

  const handleUpdatePhase = async (phaseId, payload) => {
    try {
      await axios.patch(`/api/phase/${phaseId}`, payload);
      toast.success('Fase actualizada');
      fetchDetail(); // Refresh
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPhase) return;
    try {
      await axios.post(`/api/phase/${selectedPhase.id}/reply`, {
        remitente_id: 1, // Simulated admin id
        mensaje: newMessage
      });
      setNewMessage('');
      fetchReplies(selectedPhase.id);
    } catch (err) {
      toast.error('Error al enviar mensaje');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{data.nombre}</h2>
            <div style={{ textAlign: 'right' }}>
               <p style={{ color: 'var(--text-muted)' }}>CCT: {data.cct}</p>
               <p style={{ fontWeight: 700, color: 'var(--primary)' }}>Avance: {data.avance_porcentaje}%</p>
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Phases Checklist */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Documentación Final</h3>
          {data?.phases.map((phase) => (
            <div 
              key={phase.id} 
              onClick={() => setSelectedPhase(phase)}
              style={{ 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                background: selectedPhase?.id === phase.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                border: selectedPhase?.id === phase.id ? '1px solid var(--primary)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: phase.estado === 'Correcto' ? 'rgba(16, 185, 129, 0.2)' : phase.estado === 'Por Corregir' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: phase.estado === 'Correcto' ? '#10b981' : phase.estado === 'Por Corregir' ? '#f59e0b' : '#ef4444'
                 }}>
                    {phase.estado === 'Correcto' ? <Check size={16} /> : <AlertCircle size={16} />}
                 </div>
                 <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{phase.fase_nombre}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{phase.estado}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phase Details & Chat */}
        {selectedPhase && (
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedPhase.fase_nombre}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Detalle y Observaciones</p>
               </div>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={() => handleUpdatePhase(selectedPhase.id, { estado: 'Correcto' })}>Validar</button>
                  <button className="btn btn-ghost" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleUpdatePhase(selectedPhase.id, { estado: 'Por Corregir' })}>Corregir</button>
               </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
               <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <MessageSquare size={16} /> Mensajes y Retroalimentación
               </h4>
               
               <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  {replies.length > 0 ? (
                    replies.map((r, i) => (
                      <div key={i} style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', alignSelf: r.autor === 'Administrador' ? 'flex-end' : 'flex-start' }}>
                        <p style={{ fontSize: '0.85rem' }}>{r.mensaje}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{r.autor} - {format(new Date(r.fecha), 'HH:mm')}</p>
                      </div>
                    ))
                  ) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>No hay mensajes</p>}
               </div>

               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    className="glass-panel" 
                    placeholder="Escribir mensaje..." 
                    style={{ flex: 1, padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.2)' }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="btn btn-primary" onClick={handleSendMessage}><Send size={18} /></button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusDetail;

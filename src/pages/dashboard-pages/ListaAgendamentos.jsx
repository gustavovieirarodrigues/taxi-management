import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ListaAgendamentos = ({ userOnly = false }) => {
  const { user, userRole } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [viewMode, setViewMode] = useState('lista'); // 'lista' ou 'cliente'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelingRideId, setCancelingRideId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadAgendamentos();
    }
  }, [userOnly, user]);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('rides')
        .select('*, clients(name, phone), users(name)');

      // Se é motorista ou userOnly, filtrar por driver_id
      if (userRole === 'motorista' || userOnly) {
        if (user?.id) {
          query = query.eq('driver_id', user.id);
        }
      }

      const { data, error: err } = await query.order('scheduled_time', { ascending: false });

      if (err) {
        console.error('Erro Supabase:', err);
        throw err;
      }

      setAgendamentos(data || []);

      if (data && data.length === 0) {
        setError('');
      }
    } catch (err) {
      console.error('Erro completo:', err);
      setError('Erro ao carregar agendamentos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      concluida: '#10b981',
      atribuido: '#3b82f6',
      pendente: '#f59e0b',
      cancelada: '#ef4444',
      em_andamento: '#8b5cf6'
    };
    return colors[status] || '#808080';
  };

  const getStatusLabel = (status) => {
    const labels = {
      concluida: 'Concluída',
      atribuido: 'Atribuída',
      pendente: 'Pendente',
      cancelada: 'Cancelada',
      em_andamento: 'Em Andamento'
    };
    return labels[status] || status;
  };

  const updateRideStatus = async (rideId, newStatus, reason = null) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const updateData = { status: newStatus };
      if (newStatus === 'cancelada' && reason) {
        updateData.notes = reason;
      }

      const { error: err } = await supabase
        .from('rides')
        .update(updateData)
        .eq('id', rideId);

      if (err) {
        console.error('Erro ao atualizar status:', err);
        throw err;
      }

      // Atualizar a lista local
      setAgendamentos(agendamentos.map(ag =>
        ag.id === rideId ? { ...ag, status: newStatus, notes: reason } : ag
      ));

      setSuccessMessage(`Corrida marcada como ${newStatus === 'concluida' ? 'concluída' : 'cancelada'}!`);
      setCancelingRideId(null);
      setCancelReason('');
    } catch (err) {
      console.error('Erro completo:', err);
      setError('Erro ao atualizar status: ' + err.message);
      await loadAgendamentos();
    } finally {
      setLoading(false);
    }
  };

  // Filtrar agendamentos por searchTerm
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const clientName = (ag.clients?.name || '').toLowerCase();
    return clientName.includes(searchTerm.toLowerCase());
  });

  // Agrupar por cliente (usando dados filtrados)
  const agrupadoPorCliente = agendamentosFiltrados.reduce((acc, agendamento) => {
    const clientName = agendamento.clients?.name || 'Sem Cliente';
    if (!acc[clientName]) {
      acc[clientName] = [];
    }
    acc[clientName].push(agendamento);
    return acc;
  }, {});

  return (
    <>
      <h2 className="page-title-pro">
        {userOnly ? 'Meus Agendamentos' : 'Lista de Agendamentos'}
      </h2>

      {error && (
        <div className="alert-pro alert-error-pro">
          {error}
          <button className="alert-close-pro" onClick={() => setError('')}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="alert-pro alert-success-pro">
          {successMessage}
          <button className="alert-close-pro" onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          className="form-input-modal"
          placeholder="🔍 Buscar por nome do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px', width: '100%' }}
        />
      </div>

      {!userOnly && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            className="btn-schedule-pro"
            style={{
              background: viewMode === 'lista' ? '#3b82f6' : 'transparent',
              color: viewMode === 'lista' ? '#fff' : '#fff',
              border: viewMode === 'lista' ? '2px solid #3b82f6' : '2px solid #fff'
            }}
            onClick={() => setViewMode('lista')}
          >
            📋 Visualizar Lista
          </button>
          <button
            className="btn-schedule-pro"
            style={{
              background: viewMode === 'cliente' ? '#3b82f6' : 'transparent',
              color: viewMode === 'cliente' ? '#fff' : '#fff',
              border: viewMode === 'cliente' ? '2px solid #3b82f6' : '2px solid #fff'
            }}
            onClick={() => setViewMode('cliente')}
          >
            👥 Por Cliente
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#808080' }}>
          Carregando agendamentos...
        </div>
      ) : agendamentos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#808080' }}>
          Nenhum agendamento encontrado
        </div>
      ) : agendamentosFiltrados.length === 0 && searchTerm ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#808080' }}>
          Nenhum agendamento encontrado para "{searchTerm}"
        </div>
      ) : viewMode === 'lista' ? (
        // Vista em Lista
        <div className="table-container-pro">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Data/Hora</th>
                <th>Status</th>
                {userOnly && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {agendamentosFiltrados.map(agendamento => (
                <tr key={agendamento.id}>
                  <td>{agendamento.clients?.name || 'N/A'}</td>
                  <td>{agendamento.clients?.phone || '-'}</td>
                  <td>{agendamento.origin}</td>
                  <td>{agendamento.destination}</td>
                  <td>{new Date(agendamento.scheduled_time).toLocaleString('pt-BR')}</td>
                  <td>
                    <span style={{
                      background: getStatusColor(agendamento.status),
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusLabel(agendamento.status)}
                    </span>
                  </td>
                  {userOnly && (
                    <td>
                      {(agendamento.status === 'atribuido' || agendamento.status === 'pendente') && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => updateRideStatus(agendamento.id, 'concluida')}
                            disabled={loading}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#10b981',
                              color: '#fff',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                          >
                            ✓ Concluir
                          </button>
                          <button
                            onClick={() => setCancelingRideId(agendamento.id)}
                            disabled={loading}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Vista por Cliente
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {Object.entries(agrupadoPorCliente).map(([clientName, rides]) => (
            <div key={clientName} className="table-container-pro">
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h4 style={{ margin: '0', fontSize: '16px', letterSpacing: '1px' }}>
                  👤 {clientName}
                </h4>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#808080' }}>
                  {rides.length} agendamento(s)
                </p>
              </div>
              <div style={{ padding: '0' }}>
                {rides.map(ride => (
                  <div
                    key={ride.id}
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {ride.origin} → {ride.destination}
                      </span>
                      <span style={{
                        background: getStatusColor(ride.status),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusLabel(ride.status)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#bfbfbf' }}>
                      📅 {new Date(ride.scheduled_time).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cancelamento */}
      {cancelingRideId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1a1f3a',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid #3b82f6',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, color: '#fff', textAlign: 'center' }}>
              ⚠️ Cancelar Corrida
            </h3>

            <label style={{
              display: 'block',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Motivo do Cancelamento
            </label>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Explique o motivo do cancelamento..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #3b82f6',
                backgroundColor: '#0f1823',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '100px',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCancelingRideId(null)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #6b7280',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Voltar
              </button>

              <button
                onClick={() => updateRideStatus(cancelingRideId, 'cancelada', cancelReason)}
                disabled={loading || !cancelReason.trim()}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #ef4444',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  cursor: (loading || !cancelReason.trim()) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: (loading || !cancelReason.trim()) ? 0.6 : 1
                }}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListaAgendamentos;

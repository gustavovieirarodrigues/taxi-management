import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

const CalendarioAgendamentos = ({ userOnly = false }) => {
  const { user, userRole } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAgendamentos();
  }, [currentDate, user]);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('rides')
        .select('*, clients(name, phone)');

      // Se é motorista ou userOnly, filtrar por driver_id
      if (userRole === 'motorista' || userOnly) {
        query = query.eq('driver_id', user?.id);
      }

      const { data, error: err } = await query.order('scheduled_time', { ascending: true });

      if (err) throw err;
      setAgendamentos(data || []);
    } catch (err) {
      setError('Erro ao carregar agendamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAgendamentosDoMes = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return agendamentos.filter(ag => {
      const dataAg = new Date(ag.scheduled_time);
      return dataAg.getFullYear() === year && dataAg.getMonth() === month;
    });
  };

  const getAgendamentosDoDia = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return agendamentos.filter(ag => {
      const dataAg = new Date(ag.scheduled_time);
      return dataAg.getFullYear() === year &&
             dataAg.getMonth() === month &&
             dataAg.getDate() === day;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
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

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = [];

  // Preencher dias do mês anterior (vazios)
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }

  // Preencher dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const agendamentosDoDia = selectedDay ? getAgendamentosDoDia(selectedDay) : [];
  const totalAgendamentosDoMes = getAgendamentosDoMes().length;

  return (
    <>
      <h2 className="page-title-pro">Calendário de Agendamentos</h2>

      {error && (
        <div className="alert-pro alert-error-pro">
          {error}
          <button className="alert-close-pro" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'flex-start' }}>
        {/* Calendário */}
        <div className="calendar-container-pro">
          <div className="calendar-header-pro">
            <div className="calendar-title-pro">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <div className="calendar-nav-pro">
              <button onClick={previousMonth}>← Anterior</button>
              <button onClick={() => setCurrentDate(new Date())}>Hoje</button>
              <button onClick={nextMonth}>Próximo →</button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="calendar-grid-pro" style={{ marginBottom: '16px' }}>
            {dayNames.map(day => (
              <div
                key={day}
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '8px',
                  color: '#3b82f6',
                  fontSize: '12px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dias do calendário */}
          <div className="calendar-grid-pro">
            {daysArray.map((day, index) => {
              const agendamentosDia = day ? getAgendamentosDoDia(day) : [];
              const isSelected = day === selectedDay;
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className="calendar-day-pro"
                  onClick={() => day && setSelectedDay(day)}
                  style={{
                    opacity: day ? 1 : 0.3,
                    pointerEvents: day ? 'auto' : 'none',
                    background: isSelected ? '#3b82f6' : isToday ? 'rgba(59, 130, 246, 0.2)' : '#0f0f0f',
                    border: isSelected ? '2px solid #3b82f6' : isToday ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: day ? 'pointer' : 'default'
                  }}
                >
                  {day && (
                    <>
                      <div className="calendar-day-number-pro">{day}</div>
                      {agendamentosDia.length > 0 && (
                        <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '4px' }}>
                          {agendamentosDia.length} evento(s)
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: '#0f0f0f', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#808080', marginBottom: '4px' }}>Total de Agendamentos</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {totalAgendamentosDoMes}
            </div>
          </div>
        </div>

        {/* Painel de Detalhes */}
        <div className="table-container-pro">
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ margin: '0', fontSize: '16px', letterSpacing: '1px' }}>
              {selectedDay ? `Agendamentos do dia ${selectedDay}` : 'Selecione um dia'}
            </h4>
          </div>

          <div style={{ padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
            {agendamentosDoDia.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#808080', fontSize: '14px' }}>
                {selectedDay ? 'Nenhum agendamento neste dia' : 'Selecione um dia para ver os agendamentos'}
              </div>
            ) : (
              agendamentosDoDia.map(ag => (
                <div
                  key={ag.id}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    borderLeft: `4px solid ${getStatusColor(ag.status)}`
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>
                      {new Date(ag.scheduled_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500', marginTop: '4px' }}>
                      👤 {ag.clients?.name || 'Sem Cliente'}
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#bfbfbf', marginBottom: '8px' }}>
                    📍 {ag.origin}
                    <br />
                    📍 {ag.destination}
                  </div>

                  <div style={{
                    display: 'inline-block',
                    background: getStatusColor(ag.status),
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {ag.status.toUpperCase()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarioAgendamentos;

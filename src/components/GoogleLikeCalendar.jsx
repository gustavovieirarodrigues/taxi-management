import { useState } from 'react';
import { Button, Card, Row, Col, Badge, Modal, Table } from 'react-bootstrap';

export const GoogleLikeCalendar = ({ rides = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getRidesForDate = (date) => {
    if (!date) return [];
    return rides.filter(ride => {
      const rideDate = new Date(ride.scheduled_time);
      return (
        rideDate.getDate() === date.getDate() &&
        rideDate.getMonth() === date.getMonth() &&
        rideDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    setShowModal(true);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const daysArray = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const weeks = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    weeks.push(daysArray.slice(i, i + 7));
  }

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const selectedRides = getRidesForDate(selectedDate);

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          {/* Header com navegação */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0 text-primary">
              {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
            </h4>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handlePrevMonth}
                className="px-3"
              >
                ← Anterior
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleToday}
                className="px-3"
              >
                Hoje
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleNextMonth}
                className="px-3"
              >
                Próximo →
              </Button>
            </div>
          </div>

          {/* Dias da semana */}
          <Row className="mb-2 text-center fw-bold text-muted">
            <Col className="py-2" style={{ fontSize: '0.9rem' }}>DOM</Col>
            <Col className="py-2" style={{ fontSize: '0.9rem' }}>SEG</Col>
            <Col className="py-2" style={{ fontSize: '0.9rem' }}>TER</Col>
            <Col className="py-2" style={{ fontSize: '0.9rem' }}>QUA</Col>
            <Col className="py-2" style={{ fontSize: '0.9rem' }}>QUI</Col>
            <Col className="py-2" style={{ fontSize: '0.9rem' }}>SEX</Col>
            <Col className="py-2" style={{ fontSize: '0.9rem' }}>SAB</Col>
          </Row>

          <hr className="my-0 mb-3" />

          {/* Grade de datas */}
          {weeks.map((week, weekIndex) => (
            <Row key={weekIndex} className="mb-1 g-0">
              {week.map((day, dayIndex) => {
                const dayRides = day ? getRidesForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) : [];
                const isCurrentDay = isToday(day);

                return (
                  <Col key={dayIndex} className="p-1">
                    <div
                      onClick={() => day && handleDateClick(day)}
                      style={{
                        minHeight: '120px',
                        backgroundColor: day ? (isCurrentDay ? '#e3f2fd' : '#ffffff') : '#f5f5f5',
                        border: isCurrentDay ? '2px solid #0d6efd' : '1px solid #e0e0e0',
                        borderRadius: '6px',
                        padding: '8px',
                        cursor: day ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (day) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isCurrentDay ? '#e3f2fd' : '#ffffff';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {day && (
                        <>
                          {/* Número do dia */}
                          <div className="fw-bold mb-1" style={{
                            color: isCurrentDay ? '#0d6efd' : '#212529',
                            fontSize: '1rem',
                          }}>
                            {day}
                          </div>

                          {/* Corridas do dia */}
                          <div style={{ fontSize: '0.75rem' }}>
                            {dayRides.length > 0 ? (
                              <>
                                {dayRides.slice(0, 2).map((ride, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      backgroundColor: '#fff3cd',
                                      border: '1px solid #ffc107',
                                      borderRadius: '3px',
                                      padding: '2px 4px',
                                      marginBottom: '2px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      color: '#856404',
                                      fontWeight: '500',
                                    }}
                                    title={ride.clients?.name}
                                  >
                                    {new Date(ride.scheduled_time).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })} - {ride.clients?.name}
                                  </div>
                                ))}
                                {dayRides.length > 2 && (
                                  <div style={{
                                    color: '#0d6efd',
                                    fontWeight: '500',
                                  }}>
                                    +{dayRides.length - 2} mais
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        </>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          ))}
        </Card.Body>
      </Card>

      {/* Modal com detalhes do dia */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            Corridas de {selectedDate?.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRides.length === 0 ? (
            <div className="alert alert-info mb-0">
              ✓ Nenhuma corrida agendada para este dia
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-light">
                  <tr>
                    <th>Horário</th>
                    <th>Cliente</th>
                    <th>Telefone</th>
                    <th>Trajeto</th>
                    <th>Motorista</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRides
                    .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
                    .map(ride => (
                      <tr key={ride.id} className="align-middle">
                        <td className="fw-bold">
                          {new Date(ride.scheduled_time).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>{ride.clients?.name}</td>
                        <td>{ride.clients?.phone || '—'}</td>
                        <td>
                          <small>
                            {ride.origin} → {ride.destination}
                          </small>
                        </td>
                        <td>{ride.driver_id ? '✓ Atribuído' : '—'}</td>
                        <td>
                          <Badge
                            bg={
                              ride.status === 'concluida'
                                ? 'success'
                                : ride.status === 'atribuido'
                                ? 'info'
                                : ride.status === 'cancelada'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {ride.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

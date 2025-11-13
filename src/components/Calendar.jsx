import { useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';

export const Calendar = ({ rides, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getRidesForDate = (date) => {
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

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Preencher dias vazios no início
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Preencher dias do mês
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">Calendário de Agendamentos</h5>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        {/* Controles de Navegação */}
        <Row className="mb-4 align-items-center">
          <Col className="text-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handlePrevMonth}
              className="me-2"
            >
              ← Anterior
            </Button>
            <span className="fw-bold mx-3">{monthName.toUpperCase()}</span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleNextMonth}
              className="ms-2"
            >
              Próximo →
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleToday}
              className="ms-2"
            >
              Hoje
            </Button>
          </Col>
        </Row>

        {/* Grade do Calendário */}
        <Row className="g-2">
          {/* Cabeçalho dos dias da semana */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
            <Col key={day} xs={12 / 7} className="text-center fw-bold text-primary pb-2">
              {day}
            </Col>
          ))}

          {/* Dias do mês */}
          {days.map((day, index) => {
            if (day === null) {
              return <Col key={`empty-${index}`} xs={12 / 7} />;
            }

            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayRides = getRidesForDate(dateObj);
            const isToday =
              dateObj.toDateString() === new Date().toDateString();

            return (
              <Col key={day} xs={12 / 7} className="mb-2">
                <div
                  className={`p-2 rounded border text-center cursor-pointer h-100 ${
                    isToday
                      ? 'bg-info text-white border-info fw-bold'
                      : dayRides.length > 0
                      ? 'bg-success text-white border-success'
                      : 'border-light hover:bg-light'
                  }`}
                  style={{
                    minHeight: '80px',
                    cursor: dayRides.length > 0 ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => dayRides.length > 0 && onDateSelect(dateObj)}
                >
                  <div className="fw-bold">{day}</div>
                  {dayRides.length > 0 && (
                    <small>{dayRides.length} corrida(s)</small>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
};

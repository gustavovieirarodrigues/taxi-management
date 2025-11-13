import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Badge, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { GoogleLikeCalendar } from './GoogleLikeCalendar';

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [assignedRides, setAssignedRides] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [observation, setObservation] = useState('');

  useEffect(() => {
    loadRides();
    const interval = setInterval(loadRides, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadRides = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select('*, clients(name, phone)')
        .eq('driver_id', user?.id)
        .order('scheduled_time', { ascending: true });

      if (ridesError) throw ridesError;

      const assigned = ridesData?.filter(r => r.status === 'atribuido') || [];
      const completed = ridesData?.filter(r => r.status === 'concluida') || [];

      setAssignedRides(assigned);
      setCompletedRides(completed);
    } catch (err) {
      setError('Erro ao carregar corridas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRide = async (rideId) => {
    setSelectedRide(rides => assignedRides.find(r => r.id === rideId));
    setObservation('');
    setShowObservationModal(true);
  };

  const handleSaveObservation = async () => {
    if (!selectedRide) return;

    try {
      setError('');

      const { error } = await supabase
        .from('rides')
        .update({
          status: 'concluida',
          notes: observation,
          end_time: new Date().toISOString()
        })
        .eq('id', selectedRide.id);

      if (error) throw error;

      setSuccess('Corrida marcada como concluída!');
      setShowObservationModal(false);
      setObservation('');
      setSelectedRide(null);
      loadRides();
    } catch (err) {
      setError('Erro ao concluir corrida: ' + err.message);
    }
  };

  const handleCancelRide = async (rideId) => {
    if (confirm('Deseja recusar esta corrida?')) {
      try {
        setError('');

        const { error } = await supabase
          .from('rides')
          .update({ status: 'cancelada', driver_id: null })
          .eq('id', rideId);

        if (error) throw error;

        setSuccess('Corrida recusada!');
        loadRides();
      } catch (err) {
        setError('Erro ao recusar corrida: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div>Carregando suas corridas...</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-primary">Meu Painel de Corridas</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={loadRides} size="sm">
            🔄 Atualizar
          </Button>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="shadow-sm text-center border-warning">
            <Card.Body>
              <h6 className="text-muted mb-2">CORRIDAS ATRIBUÍDAS</h6>
              <h3 className="text-warning fw-bold">{assignedRides.length}</h3>
              {assignedRides.length > 0 && (
                <small className="text-muted">
                  Próxima: {new Date(assignedRides[0].scheduled_time).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm text-center border-success">
            <Card.Body>
              <h6 className="text-muted mb-2">CORRIDAS CONCLUÍDAS</h6>
              <h3 className="text-success fw-bold">{completedRides.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm text-center border-info">
            <Card.Body>
              <h6 className="text-muted mb-2">TOTAL</h6>
              <h3 className="text-info fw-bold">{assignedRides.length + completedRides.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs com Calendário e Corridas */}
      <Row>
        <Col>
          <Tabs defaultActiveKey="calendario" className="mb-4">
            {/* Tab Calendário */}
            <Tab eventKey="calendario" title="📅 Calendário">
              <div className="mt-3">
                <GoogleLikeCalendar rides={[...assignedRides, ...completedRides]} />
              </div>
            </Tab>

            {/* Tab Corridas Atribuídas */}
            <Tab eventKey="atribuidas" title={`📍 Atribuídas (${assignedRides.length})`}>
              <Card className="shadow-sm border-0 mt-3">
                <Card.Body>
                  {assignedRides.length === 0 ? (
                    <Alert variant="info" className="mb-0">
                      ✓ Nenhuma corrida atribuída no momento. Você será notificado quando receber uma nova corrida.
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table striped hover>
                        <thead className="table-light">
                          <tr>
                            <th>Cliente</th>
                            <th>Telefone</th>
                            <th>Origem</th>
                            <th>Destino</th>
                            <th>Data/Hora</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedRides
                            .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
                            .map((ride) => (
                              <tr key={ride.id} className="align-middle">
                                <td className="fw-bold">{ride.clients?.name}</td>
                                <td>{ride.clients?.phone || '—'}</td>
                                <td>{ride.origin}</td>
                                <td>{ride.destination}</td>
                                <td>
                                  <strong>{new Date(ride.scheduled_time).toLocaleString('pt-BR')}</strong>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="success"
                                      onClick={() => handleCompleteRide(ride.id)}
                                      title="Concluir com observação"
                                    >
                                      ✓ Concluir
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => handleCancelRide(ride.id)}
                                      title="Recusar corrida"
                                    >
                                      ✕ Recusar
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* Tab Histórico */}
            <Tab eventKey="historico" title={`✓ Histórico (${completedRides.length})`}>
              <Card className="shadow-sm border-0 mt-3">
                <Card.Body>
                  {completedRides.length === 0 ? (
                    <Alert variant="secondary" className="mb-0">
                      Nenhuma corrida concluída ainda.
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table striped hover size="sm">
                        <thead className="table-light">
                          <tr>
                            <th>Cliente</th>
                            <th>Tel.</th>
                            <th>Trajeto</th>
                            <th>Data/Hora</th>
                            <th>Observação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedRides
                            .sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time))
                            .map((ride) => (
                              <tr key={ride.id} className="align-middle">
                                <td className="fw-bold">{ride.clients?.name}</td>
                                <td>{ride.clients?.phone || '—'}</td>
                                <td>
                                  <small>
                                    {ride.origin} → {ride.destination}
                                  </small>
                                </td>
                                <td>{new Date(ride.scheduled_time).toLocaleString('pt-BR')}</td>
                                <td>
                                  {ride.notes ? (
                                    <small className="text-muted fst-italic">
                                      "{ride.notes}"
                                    </small>
                                  ) : (
                                    <small className="text-muted">—</small>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Modal de Observação */}
      <Modal show={showObservationModal} onHide={() => setShowObservationModal(false)}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Concluir Corrida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRide && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <p className="mb-2">
                  <strong>Cliente:</strong> {selectedRide.clients?.name}
                </p>
                <p className="mb-2">
                  <strong>Trajeto:</strong> {selectedRide.origin} → {selectedRide.destination}
                </p>
                <p className="mb-0">
                  <strong>Horário:</strong> {new Date(selectedRide.scheduled_time).toLocaleString('pt-BR')}
                </p>
              </div>

              <Form.Group>
                <Form.Label className="fw-bold">Observação (Opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ex: Cliente deixado no local correto, corrida tranquila..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Adicione qualquer informação importante sobre a corrida
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowObservationModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSaveObservation}>
            ✓ Confirmar Conclusão
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

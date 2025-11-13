import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Tab, Tabs } from 'react-bootstrap';
import { supabase } from '../services/supabase';
import { notificationService } from '../services/notificationService';
import { GoogleLikeCalendar } from './GoogleLikeCalendar';

export const ManagerDashboard = () => {
  const [rides, setRides] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalRide, setShowModalRide] = useState(false);
  const [showModalManager, setShowModalManager] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states - Corrida
  const [formRideData, setFormRideData] = useState({
    client_name: '',
    client_phone: '',
    origin: '',
    destination: '',
    scheduled_time: '',
    driver_id: '',
  });

  // Form states - Gerente
  const [formManagerData, setFormManagerData] = useState({
    email: '',
    password: '',
    name: '',
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select('*, clients(name, phone)')
        .order('scheduled_time', { ascending: true });

      if (ridesError) throw ridesError;
      setRides(ridesData || []);

      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      const { data: driversData, error: driversError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'motorista');

      if (driversError) throw driversError;
      setDrivers(driversData || []);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRideInputChange = (e) => {
    const { name, value } = e.target;
    setFormRideData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManagerInputChange = (e) => {
    const { name, value } = e.target;
    setFormManagerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateRide = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let clientId = null;
      const existingClient = clients.find(c => c.name === formRideData.client_name);

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: formRideData.client_name,
            phone: formRideData.client_phone
          })
          .select('id');

        if (clientError) throw clientError;
        clientId = data[0].id;
      }

      const { error: rideError } = await supabase
        .from('rides')
        .insert({
          client_id: clientId,
          origin: formRideData.origin,
          destination: formRideData.destination,
          scheduled_time: formRideData.scheduled_time,
          driver_id: formRideData.driver_id || null,
          status: 'pendente',
        });

      if (rideError) throw rideError;

      if (formRideData.driver_id) {
        const driver = drivers.find(d => d.id === formRideData.driver_id);
        await notificationService.notifyRideAssigned(
          formRideData.driver_id,
          driver.email,
          formRideData.client_name,
          formRideData.origin,
          formRideData.destination,
          formRideData.scheduled_time
        );
      }

      setSuccess('Corrida agendada com sucesso!');
      setFormRideData({
        client_name: '',
        client_phone: '',
        origin: '',
        destination: '',
        scheduled_time: '',
        driver_id: '',
      });
      setShowModalRide(false);
      loadData();
    } catch (err) {
      setError('Erro ao agendar corrida: ' + err.message);
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Criar conta via Supabase Auth
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formManagerData.email,
        password: formManagerData.password,
      });

      if (signupError) throw signupError;

      // Criar registro na tabela users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: formManagerData.email,
          name: formManagerData.name,
          role: 'gerente',
        });

      if (insertError) throw insertError;

      setSuccess('Gerente criado com sucesso!');
      setFormManagerData({
        email: '',
        password: '',
        name: '',
      });
      setShowModalManager(false);
      loadData();
    } catch (err) {
      setError('Erro ao criar gerente: ' + err.message);
    }
  };

  const handleAssignDriver = async (rideId, driverId) => {
    try {
      setError('');

      const ride = rides.find(r => r.id === rideId);
      const driver = drivers.find(d => d.id === driverId);

      const { error } = await supabase
        .from('rides')
        .update({ driver_id: driverId, status: 'atribuido' })
        .eq('id', rideId);

      if (error) throw error;

      if (ride && driver) {
        await notificationService.notifyRideAssigned(
          driverId,
          driver.email,
          ride.clients?.name || 'Cliente',
          ride.origin,
          ride.destination,
          ride.scheduled_time
        );
      }

      setSuccess('Motorista atribuído com sucesso!');
      loadData();
    } catch (err) {
      setError('Erro ao atribuir motorista: ' + err.message);
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (confirm('Tem certeza que deseja deletar esta corrida?')) {
      try {
        const { error } = await supabase
          .from('rides')
          .delete()
          .eq('id', rideId);

        if (error) throw error;
        setSuccess('Corrida deletada com sucesso!');
        loadData();
      } catch (err) {
        setError('Erro ao deletar corrida: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div>Carregando dados...</div>
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
          <h2 className="fw-bold text-primary">Painel do Gerente</h2>
        </Col>
        <Col className="text-end d-flex gap-2 justify-content-end">
          <Button variant="success" onClick={() => setShowModalRide(true)}>
            ➕ Nova Corrida
          </Button>
          <Button variant="info" onClick={() => setShowModalManager(true)}>
            👤 Novo Gerente
          </Button>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">TOTAL DE CORRIDAS</h6>
              <h3 className="text-primary fw-bold">{rides.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">PENDENTES</h6>
              <h3 className="text-warning fw-bold">{rides.filter(r => r.status === 'pendente').length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">ATRIBUÍDAS</h6>
              <h3 className="text-info fw-bold">{rides.filter(r => r.status === 'atribuido').length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">MOTORISTAS</h6>
              <h3 className="text-success fw-bold">{drivers.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs defaultActiveKey="calendario" className="mb-4">
        {/* Tab Calendário */}
        <Tab eventKey="calendario" title="📅 Calendário">
          <div className="mt-3">
            <GoogleLikeCalendar rides={rides} />
          </div>
        </Tab>

        {/* Tab Todas Corridas */}
        <Tab eventKey="corridas" title="🚗 Todas as Corridas">
          <Card>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Cliente</th>
                      <th>Tel.</th>
                      <th>Origem</th>
                      <th>Destino</th>
                      <th>Data/Hora</th>
                      <th>Motorista</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map(ride => (
                      <tr key={ride.id}>
                        <td className="fw-bold">{ride.clients?.name}</td>
                        <td>{ride.clients?.phone || '-'}</td>
                        <td>{ride.origin}</td>
                        <td>{ride.destination}</td>
                        <td>{new Date(ride.scheduled_time).toLocaleString('pt-BR')}</td>
                        <td>{ride.driver_id ? drivers.find(d => d.id === ride.driver_id)?.name : '—'}</td>
                        <td>
                          <span className={`badge bg-${
                            ride.status === 'concluida' ? 'success' :
                            ride.status === 'atribuido' ? 'info' :
                            ride.status === 'cancelada' ? 'danger' : 'warning'
                          }`}>
                            {ride.status}
                          </span>
                        </td>
                        <td>
                          {ride.status === 'pendente' && (
                            <Form.Select
                              size="sm"
                              onChange={(e) => handleAssignDriver(ride.id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Atribuir...</option>
                              {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.name}
                                </option>
                              ))}
                            </Form.Select>
                          )}
                          {ride.status !== 'concluida' && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteRide(ride.id)}
                              className="ms-2"
                            >
                              🗑️
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* Tab Motoristas */}
        <Tab eventKey="motoristas" title="👥 Motoristas">
          <Card>
            <Card.Body>
              <Row>
                {drivers.map(driver => (
                  <Col md={6} lg={4} key={driver.id} className="mb-3">
                    <Card className="shadow-sm h-100">
                      <Card.Body>
                        <h6 className="fw-bold text-primary">{driver.name}</h6>
                        <p className="text-muted small mb-2">📧 {driver.email}</p>
                        <p className="text-muted small mb-0">
                          Corridas: <strong>{rides.filter(r => r.driver_id === driver.id).length}</strong>
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal Nova Corrida */}
      <Modal show={showModalRide} onHide={() => setShowModalRide(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Agendar Nova Corrida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateRide}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome do Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="client_name"
                    value={formRideData.client_name}
                    onChange={handleRideInputChange}
                    placeholder="Ex: João Silva"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="client_phone"
                    value={formRideData.client_phone}
                    onChange={handleRideInputChange}
                    placeholder="(11) 98765-4321"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Origem</Form.Label>
              <Form.Control
                type="text"
                name="origin"
                value={formRideData.origin}
                onChange={handleRideInputChange}
                placeholder="Ex: Rua A, 123 - São Paulo"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Destino</Form.Label>
              <Form.Control
                type="text"
                name="destination"
                value={formRideData.destination}
                onChange={handleRideInputChange}
                placeholder="Ex: Av. Paulista, 1000 - São Paulo"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data e Hora</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="scheduled_time"
                    value={formRideData.scheduled_time}
                    onChange={handleRideInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Motorista (Opcional)</Form.Label>
                  <Form.Select
                    name="driver_id"
                    value={formRideData.driver_id}
                    onChange={handleRideInputChange}
                  >
                    <option value="">Atribuir depois...</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowModalRide(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                ✓ Agendar Corrida
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Novo Gerente */}
      <Modal show={showModalManager} onHide={() => setShowModalManager(false)}>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>Cadastrar Novo Gerente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateManager}>
            <Form.Group className="mb-3">
              <Form.Label>Nome Completo</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formManagerData.name}
                onChange={handleManagerInputChange}
                placeholder="Nome do gerente"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formManagerData.email}
                onChange={handleManagerInputChange}
                placeholder="gerente@empresa.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formManagerData.password}
                onChange={handleManagerInputChange}
                placeholder="Senha segura"
                required
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowModalManager(false)}>
                Cancelar
              </Button>
              <Button variant="info" type="submit">
                ✓ Criar Gerente
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

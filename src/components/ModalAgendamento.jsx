import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import '../styles/modal-agendamento.css';

const ModalAgendamento = ({ isOpen, onClose, category, onSuccess }) => {
  const [clientes, setClientes] = useState([]);
  const [carros, setCarros] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados do formulário
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteSugestoes, setClienteSugestoes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [telefoneSelecionado, setTelefoneSelecionado] = useState('');
  const [emailSelecionado, setEmailSelecionado] = useState('');

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    driver_id: '',
    car_id: '',
  });

  // Carregar clientes, carros e motoristas
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

      // Carregar carros ativos da categoria
      const { data: carrosData, error: carrosError } = await supabase
        .from('cars')
        .select('*')
        .eq('categoria', category)
        .eq('status', 'ativo')
        .order('modelo');
      if (carrosError) throw carrosError;
      setCarros(carrosData || []);

      // Carregar motoristas
      const { data: motoristasData, error: motoristasError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'motorista')
        .order('name');
      if (motoristasError) throw motoristasError;
      setMotoristas(motoristasData || []);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar cliente enquanto digita
  const handleClienteSearch = (value) => {
    setClienteSearch(value);
    setClienteSelecionado(null);
    setTelefoneSelecionado('');
    setEmailSelecionado('');

    if (value.length > 0) {
      const sugestoes = clientes.filter(c =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setClienteSugestoes(sugestoes);
    } else {
      setClienteSugestoes([]);
    }
  };

  // Selecionar cliente da sugestão
  const handleSelectCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setClienteSearch(cliente.name);
    setTelefoneSelecionado(cliente.phone || '');
    setEmailSelecionado(cliente.email || '');
    setClienteSugestoes([]);
  };

  // Atualizar campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Atualizar telefone do cliente
  const handleTelefoneChange = (e) => {
    setTelefoneSelecionado(e.target.value);
  };

  // Atualizar email do cliente
  const handleEmailChange = (e) => {
    setEmailSelecionado(e.target.value);
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!clienteSelecionado) {
      setError('Selecione um cliente');
      return;
    }

    if (!formData.origin || !formData.destination) {
      setError('Preencha origem e destino');
      return;
    }

    if (!formData.date || !formData.time) {
      setError('Preencha data e horário');
      return;
    }

    if (!formData.driver_id) {
      setError('Selecione um motorista');
      return;
    }

    if (!formData.car_id) {
      setError('Selecione um carro');
      return;
    }

    try {
      setLoading(true);

      // Combinar data e hora
      const scheduledTime = new Date(`${formData.date}T${formData.time}`);

      const { error: rideError } = await supabase
        .from('rides')
        .insert({
          client_id: clienteSelecionado.id,
          driver_id: formData.driver_id,
          car_id: formData.car_id,
          origin: formData.origin,
          destination: formData.destination,
          scheduled_time: scheduledTime.toISOString(),
          status: 'atribuido',
        });

      if (rideError) throw rideError;

      setSuccess('Agendamento criado com sucesso!');

      // Resetar formulário após um tempo
      setTimeout(() => {
        setClienteSearch('');
        setClienteSelecionado(null);
        setTelefoneSelecionado('');
        setEmailSelecionado('');
        setFormData({
          origin: '',
          destination: '',
          date: '',
          time: '',
          driver_id: '',
          car_id: '',
        });
        onSuccess && onSuccess();
        // Apenas fechar a modal, não redirecionar
        onClose();
      }, 1000);
    } catch (err) {
      setError('Erro ao criar agendamento: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-agendamento">
      <div className="modal-agendamento">
        <div className="modal-header-agendamento">
          <h2 className="modal-title-agendamento">AGENDAR CORRIDA - {category?.toUpperCase()}</h2>
          <button className="modal-close-agendamento" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-agendamento">
          {error && (
            <div className="alert-modal alert-error-modal">
              {error}
              <button className="alert-close-modal" onClick={() => setError('')}>×</button>
            </div>
          )}

          {success && (
            <div className="alert-modal alert-success-modal">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* CLIENTE */}
            <div className="form-group-modal">
              <label className="form-label-modal">👤 Cliente</label>
              <div className="input-with-suggestions">
                <input
                  type="text"
                  className="form-input-modal"
                  placeholder="Buscar cliente por nome..."
                  value={clienteSearch}
                  onChange={(e) => handleClienteSearch(e.target.value)}
                  required
                />
                {clienteSugestoes.length > 0 && (
                  <div className="suggestions-list">
                    {clienteSugestoes.map(cliente => (
                      <div
                        key={cliente.id}
                        className="suggestion-item"
                        onClick={() => handleSelectCliente(cliente)}
                      >
                        <div className="suggestion-name">{cliente.name}</div>
                        <div className="suggestion-phone">{cliente.phone || '-'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TELEFONE DO CLIENTE */}
            <div className="form-group-modal">
              <label className="form-label-modal">📞 Telefone</label>
              <input
                type="tel"
                className="form-input-modal"
                value={telefoneSelecionado}
                onChange={handleTelefoneChange}
                placeholder="Preenchido automaticamente ou editar manualmente"
              />
            </div>

            {/* EMAIL DO CLIENTE */}
            <div className="form-group-modal">
              <label className="form-label-modal">📧 Email</label>
              <input
                type="email"
                className="form-input-modal"
                value={emailSelecionado}
                onChange={handleEmailChange}
                placeholder="Preenchido automaticamente ou editar manualmente"
              />
            </div>

            {/* ORIGEM */}
            <div className="form-group-modal">
              <label className="form-label-modal">📍 Origem</label>
              <input
                type="text"
                name="origin"
                className="form-input-modal"
                placeholder="Ex: Rua Exemplo, 123 - São Paulo"
                value={formData.origin}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* DESTINO */}
            <div className="form-group-modal">
              <label className="form-label-modal">📍 Destino</label>
              <input
                type="text"
                name="destination"
                className="form-input-modal"
                placeholder="Ex: Av. Paulista, 1000 - São Paulo"
                value={formData.destination}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* DATA E HORA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group-modal">
                <label className="form-label-modal">📅 Data</label>
                <input
                  type="date"
                  name="date"
                  className="form-input-modal"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group-modal">
                <label className="form-label-modal">⏰ Horário</label>
                <input
                  type="time"
                  name="time"
                  className="form-input-modal"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* MOTORISTA */}
            <div className="form-group-modal">
              <label className="form-label-modal">👨‍✈️ Motorista</label>
              <select
                name="driver_id"
                className="form-select-modal"
                value={formData.driver_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione um motorista...</option>
                {motoristas.map(motorista => (
                  <option key={motorista.id} value={motorista.id}>
                    {motorista.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CARRO */}
            <div className="form-group-modal">
              <label className="form-label-modal">🚗 Carro</label>
              <select
                name="car_id"
                className="form-select-modal"
                value={formData.car_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione um carro...</option>
                {carros.map(carro => (
                  <option key={carro.id} value={carro.id}>
                    {carro.modelo} ({carro.placa})
                  </option>
                ))}
              </select>
            </div>

            {/* BOTÕES */}
            <div className="modal-footer-agendamento">
              <button
                type="button"
                className="btn-modal btn-secondary-modal"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-modal btn-primary-modal"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Agendar Corrida'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgendamento;

import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const CadastroCarros = () => {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [updatingCarId, setUpdatingCarId] = useState(null);
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    categoria: 'vans',
    ano: new Date().getFullYear(),
    status: 'ativo',
  });

  useEffect(() => {
    loadCarros();
  }, []);

  const loadCarros = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        console.error('Erro ao carregar carros:', err);
        throw err;
      }

      setCarros(data || []);
    } catch (err) {
      console.error('Erro completo:', err);
      setError('Erro ao carregar carros: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (carroId, novoStatus) => {
    try {
      setUpdatingCarId(carroId);
      setError('');
      setSuccess('');

      const { error: err } = await supabase
        .from('cars')
        .update({ status: novoStatus })
        .eq('id', carroId);

      if (err) {
        console.error('Erro ao atualizar status:', err);
        throw err;
      }

      // Atualizar a lista local
      setCarros(carros.map(carro =>
        carro.id === carroId ? { ...carro, status: novoStatus } : carro
      ));

      setSuccess('Status atualizado com sucesso!');
    } catch (err) {
      console.error('Erro completo:', err);
      setError('Erro ao atualizar status: ' + err.message);
      // Recarregar para sincronizar em caso de erro
      await loadCarros();
    } finally {
      setUpdatingCarId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validação básica
    if (!formData.placa.trim() || !formData.modelo.trim()) {
      setError('Placa e modelo são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('cars')
        .insert([
          {
            placa: formData.placa.toUpperCase(),
            modelo: formData.modelo,
            categoria: formData.categoria,
            ano: parseInt(formData.ano),
            status: formData.status,
          }
        ])
        .select();

      if (err) {
        console.error('Erro ao cadastrar carro:', err);
        throw err;
      }

      setSuccess('Carro cadastrado com sucesso!');
      setFormData({
        placa: '',
        modelo: '',
        categoria: 'vans',
        ano: new Date().getFullYear(),
        status: 'ativo',
      });

      // Recarregar lista de carros
      await loadCarros();
    } catch (err) {
      console.error('Erro completo:', err);
      setError('Erro ao cadastrar carro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title-pro">Cadastro de Carros</h2>

      {success && <div className="alert-pro alert-success-pro">{success}</div>}
      {error && <div className="alert-pro alert-error-pro">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Formulário */}
        <div className="form-container-pro">
          <h3 style={{ marginBottom: '24px', fontSize: '18px', letterSpacing: '1px' }}>
            ADICIONAR NOVO CARRO
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group-pro">
              <label className="form-label-pro">Placa</label>
              <input
                type="text"
                className="form-input-pro"
                name="placa"
                placeholder="ABC-1234"
                value={formData.placa}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group-pro">
              <label className="form-label-pro">Modelo</label>
              <input
                type="text"
                className="form-input-pro"
                name="modelo"
                placeholder="Honda Civic"
                value={formData.modelo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group-pro">
              <label className="form-label-pro">Categoria</label>
              <select
                className="form-select-pro"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
              >
                <option value="vans">Vans</option>
                <option value="suvs">SUVs</option>
                <option value="blindados">Blindados</option>
                <option value="executivo">Executivo</option>
              </select>
            </div>

            <div className="form-group-pro">
              <label className="form-label-pro">Ano</label>
              <input
                type="number"
                className="form-input-pro"
                name="ano"
                min="2000"
                max={new Date().getFullYear() + 1}
                value={formData.ano}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group-pro">
              <label className="form-label-pro">Status</label>
              <select
                className="form-select-pro"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>

            <button
              type="submit"
              className="form-button-pro"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Cadastrar Carro'}
            </button>
          </form>
        </div>

        {/* Lista de Carros */}
        <div className="table-container-pro">
          <h3 style={{ padding: '24px 24px 0', fontSize: '18px', letterSpacing: '1px' }}>
            CARROS CADASTRADOS
          </h3>
          {carros.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#808080' }}>
              Nenhum carro cadastrado ainda
            </div>
          ) : (
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Categoria</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {carros.map(carro => (
                  <tr key={carro.id}>
                    <td>{carro.placa}</td>
                    <td>{carro.modelo}</td>
                    <td>{carro.categoria}</td>
                    <td>
                      <select
                        value={carro.status}
                        onChange={(e) => handleStatusChange(carro.id, e.target.value)}
                        disabled={updatingCarId === carro.id}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid #3b82f6',
                          backgroundColor: '#1a1f3a',
                          color: '#fff',
                          cursor: updatingCarId === carro.id ? 'not-allowed' : 'pointer',
                          opacity: updatingCarId === carro.id ? 0.6 : 1,
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="manutencao">Manutenção</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default CadastroCarros;

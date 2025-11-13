import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const CadastroClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingClientId, setEditingClientId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setClientes(data || []);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
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

  const handleEdit = (cliente) => {
    setFormData({
      name: cliente.name,
      phone: cliente.phone,
      email: cliente.email || '',
      address: cliente.address || '',
    });
    setEditingClientId(cliente.id);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingClientId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingClientId) {
        // Atualizar cliente existente
        const { error: err } = await supabase
          .from('clients')
          .update({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            address: formData.address || null,
          })
          .eq('id', editingClientId);

        if (err) throw err;

        setSuccess('Cliente atualizado com sucesso!');
        handleCancelEdit();
      } else {
        // Criar novo cliente
        const { error: err } = await supabase
          .from('clients')
          .insert({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            address: formData.address || null,
          });

        if (err) throw err;

        setSuccess('Cliente cadastrado com sucesso!');
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
        });
      }

      await loadClientes();
    } catch (err) {
      setError(editingClientId ? 'Erro ao atualizar cliente: ' + err.message : 'Erro ao cadastrar cliente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title-pro">Cadastro de Clientes</h2>

      {success && (
        <div className="alert-pro alert-success-pro">
          {success}
          <button className="alert-close-pro" onClick={() => setSuccess('')}>×</button>
        </div>
      )}
      {error && (
        <div className="alert-pro alert-error-pro">
          {error}
          <button className="alert-close-pro" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Formulário */}
        <div className="form-container-pro">
          <h3 style={{ marginBottom: '24px', fontSize: '18px', letterSpacing: '1px' }}>
            {editingClientId ? '✏️ EDITAR CLIENTE' : 'ADICIONAR NOVO CLIENTE'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group-pro">
              <label className="form-label-pro">Nome Completo</label>
              <input
                type="text"
                className="form-input-pro"
                name="name"
                placeholder="João Silva"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group-pro">
              <label className="form-label-pro">Telefone</label>
              <input
                type="tel"
                className="form-input-pro"
                name="phone"
                placeholder="(11) 98765-4321"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group-pro">
              <label className="form-label-pro">Email</label>
              <input
                type="email"
                className="form-input-pro"
                name="email"
                placeholder="joao@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group-pro">
              <label className="form-label-pro">Endereço</label>
              <input
                type="text"
                className="form-input-pro"
                name="address"
                placeholder="Rua Exemplo, 123"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="form-button-pro"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Salvando...' : editingClientId ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
              </button>

              {editingClientId && (
                <button
                  type="button"
                  className="form-button-pro"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    border: '2px solid #6b7280'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6b7280';
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Clientes */}
        <div className="table-container-pro">
          <h3 style={{ padding: '24px 24px 0', fontSize: '18px', letterSpacing: '1px' }}>
            CLIENTES CADASTRADOS ({clientes.length})
          </h3>
          {clientes.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#808080' }}>
              Nenhum cliente cadastrado ainda
            </div>
          ) : (
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cliente => (
                  <tr key={cliente.id}>
                    <td>{cliente.name}</td>
                    <td>{cliente.phone || '-'}</td>
                    <td>{cliente.email || '-'}</td>
                    <td>{cliente.address || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(cliente)}
                        disabled={loading}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          opacity: loading ? 0.6 : 1,
                          transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) e.target.style.backgroundColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#3b82f6';
                        }}
                      >
                        ✏️ Editar
                      </button>
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

export default CadastroClientes;

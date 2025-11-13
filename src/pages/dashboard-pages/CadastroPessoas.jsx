import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const CadastroPessoas = () => {
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'motorista',
  });

  useEffect(() => {
    loadPessoas();
  }, []);

  const loadPessoas = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setPessoas(data || []);
    } catch (err) {
      setError('Erro ao carregar pessoas');
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

  const handleEdit = (pessoa) => {
    setFormData({
      email: pessoa.email,
      password: '',
      name: pessoa.name,
      role: pessoa.role,
    });
    setEditingUserId(pessoa.id);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'motorista',
    });
  };

  const handleDisableUser = async (userId) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const { error: err } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (err) throw err;

      setSuccess('Usuário desabilitado com sucesso!');
      await loadPessoas();
    } catch (err) {
      console.error('Erro ao desabilitar usuário:', err);
      setError('Erro ao desabilitar usuário: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editingUserId) {
        // Atualizar usuário existente
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: formData.name,
            role: formData.role,
          })
          .eq('id', editingUserId);

        if (updateError) throw updateError;

        setSuccess('Usuário atualizado com sucesso!');
        handleCancelEdit();
      } else {
        // Criar novo usuário
        const { data, error: signupError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signupError) throw signupError;

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: formData.email,
            name: formData.name,
            role: formData.role,
            is_active: true,
          });

        if (insertError) throw insertError;

        setSuccess(`${formData.role === 'gerente' ? 'Gerente' : 'Motorista'} cadastrado com sucesso!`);
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'motorista',
        });
      }

      await loadPessoas();
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title-pro">Cadastro de Pessoas</h2>

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
            {editingUserId ? '✏️ EDITAR PESSOA' : 'CADASTRAR NOVA PESSOA'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group-pro">
              <label className="form-label-pro">Nome Completo</label>
              <input
                type="text"
                className="form-input-pro"
                name="name"
                placeholder="João da Silva"
                value={formData.name}
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
                readOnly={editingUserId ? true : false}
                required={!editingUserId}
              />
            </div>

            {!editingUserId && (
              <div className="form-group-pro">
                <label className="form-label-pro">Senha</label>
                <input
                  type="password"
                  className="form-input-pro"
                  name="password"
                  placeholder="Senha segura"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="form-group-pro">
              <label className="form-label-pro">Tipo de Conta</label>
              <select
                className="form-select-pro"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="motorista">Motorista</option>
                <option value="gerente">Gerente</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="form-button-pro"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Salvando...' : editingUserId ? 'Atualizar Pessoa' : 'Cadastrar Pessoa'}
              </button>

              {editingUserId && (
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

        {/* Lista de Pessoas */}
        <div className="table-container-pro">
          <h3 style={{ padding: '24px 24px 0', fontSize: '18px', letterSpacing: '1px' }}>
            PESSOAS CADASTRADAS ({pessoas.length})
          </h3>
          {pessoas.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#808080' }}>
              Nenhuma pessoa cadastrada ainda
            </div>
          ) : (
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Data Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pessoas.map(pessoa => (
                  <tr key={pessoa.id}>
                    <td>{pessoa.name}</td>
                    <td>{pessoa.email}</td>
                    <td>
                      <span style={{
                        background: pessoa.role === 'gerente' ? '#3b82f6' : '#10b981',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {pessoa.role === 'gerente' ? 'GERENTE' : 'MOTORISTA'}
                      </span>
                    </td>
                    <td>{new Date(pessoa.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(pessoa)}
                          disabled={loading}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja desabilitar este usuário?')) {
                              handleDisableUser(pessoa.id);
                            }
                          }}
                          disabled={loading}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                        >
                          🗑️ Desabilitar
                        </button>
                      </div>
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

export default CadastroPessoas;

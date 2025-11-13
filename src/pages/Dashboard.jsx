import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard-pro.css';

// Importar componentes das páginas
import AgendamentoCategorias from '../pages/dashboard-pages/AgendamentoCategorias';
import CadastroCarros from '../pages/dashboard-pages/CadastroCarros';
import CadastroClientes from '../pages/dashboard-pages/CadastroClientes';
import CadastroPessoas from '../pages/dashboard-pages/CadastroPessoas';
import ListaAgendamentos from '../pages/dashboard-pages/ListaAgendamentos';
import CalendarioAgendamentos from '../pages/dashboard-pages/CalendarioAgendamentos';

export const Dashboard = () => {
  const { user, userRole, userName, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('agendamento');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  // Determinar página padrão baseado no role
  const defaultPage = userRole === 'gerente' ? 'agendamento' : 'meus-agendamentos';

  // Definir página padrão quando auth termina de carregar
  useEffect(() => {
    if (!loading && userRole) {
      setActivePage(defaultPage);
    }
  }, [loading, userRole, defaultPage]);

  const handleLogout = async () => {
    try {
      setLogoutError('');
      await logout();
      // Adicionar pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 300);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      setLogoutError('Erro ao desconectar. Tente novamente.');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    closeSidebar();
  };

  // Garantir que isManager espera o role carregar
  const isManager = userRole === 'gerente';

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0a0e27',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-pro">
      {/* Menu Toggle Button */}
      <button className={`menu-toggle ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      <div className={`overlay-pro ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar */}
      <div className={`sidebar-pro ${sidebarOpen ? 'active' : ''}`}>
        {/* User Info */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 'bold' }}>
            👤 {userName || 'Usuário'}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#808080',
            marginTop: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {isManager ? '👨‍💼 Gerente' : '🚗 Motorista'}
          </div>
        </div>

        <nav>
          {isManager && (
            <>
              <button
                className={activePage === 'agendamento' ? 'active' : ''}
                onClick={() => handlePageChange('agendamento')}
              >
                📅 Agendamento
              </button>

              <button
                className={activePage === 'carros' ? 'active' : ''}
                onClick={() => handlePageChange('carros')}
              >
                🚗 Cadastro de Carros
              </button>

              <button
                className={activePage === 'clientes' ? 'active' : ''}
                onClick={() => handlePageChange('clientes')}
              >
                👥 Cadastro Clientes
              </button>

              <button
                className={activePage === 'pessoas' ? 'active' : ''}
                onClick={() => handlePageChange('pessoas')}
              >
                👤 Cadastro de Pessoas
              </button>

              <button
                className={activePage === 'lista' ? 'active' : ''}
                onClick={() => handlePageChange('lista')}
              >
                📋 Lista de Agendamentos
              </button>

              <button
                className={activePage === 'calendario' ? 'active' : ''}
                onClick={() => handlePageChange('calendario')}
              >
                📆 Calendário
              </button>
            </>
          )}

          {!isManager && (
            <>
              <button
                className={activePage === 'meus-agendamentos' ? 'active' : ''}
                onClick={() => handlePageChange('meus-agendamentos')}
              >
                📋 Meus Agendamentos
              </button>

              <button
                className={activePage === 'meu-calendario' ? 'active' : ''}
                onClick={() => handlePageChange('meu-calendario')}
              >
                📆 Meu Calendário
              </button>
            </>
          )}

          <button
            onClick={handleLogout}
            style={{
              color: '#ef4444',
              marginTop: '40px',
              backgroundColor: 'transparent',
              border: '2px solid #ef4444',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#ef4444';
            }}
          >
            🚪 Sair
          </button>

          {logoutError && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#ef4444',
              color: '#fff',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {logoutError}
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content-pro">
        {/* Header */}
        {activePage === 'agendamento' && isManager && (
          <div className="header-pro">
            <h1>EXECDRIVER</h1>
            <p>EXCELÊNCIA EM TRANSPORTE</p>
          </div>
        )}

        {/* Páginas */}
        {activePage === 'agendamento' && isManager && <AgendamentoCategorias />}
        {activePage === 'carros' && isManager && <CadastroCarros />}
        {activePage === 'clientes' && isManager && <CadastroClientes />}
        {activePage === 'pessoas' && isManager && <CadastroPessoas />}
        {activePage === 'lista' && isManager && <ListaAgendamentos />}
        {activePage === 'calendario' && isManager && <CalendarioAgendamentos />}
        {activePage === 'meus-agendamentos' && !isManager && <ListaAgendamentos userOnly={true} />}
        {activePage === 'meu-calendario' && !isManager && <CalendarioAgendamentos userOnly={true} />}
      </div>
    </div>
  );
};

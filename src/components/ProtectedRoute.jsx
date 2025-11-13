import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Spinner } from 'react-bootstrap';

export const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

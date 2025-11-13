import { useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Acesso Negado</Alert.Heading>
        <p>
          Você não tem permissão para acessar esta página.
        </p>
        <hr />
        <Button onClick={() => navigate('/dashboard')} variant="outline-danger">
          Voltar ao Dashboard
        </Button>
      </Alert>
    </Container>
  );
};

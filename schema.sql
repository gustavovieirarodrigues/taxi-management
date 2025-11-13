-- Tabela de usuários (gerentes e motoristas)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('gerente', 'motorista')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de carros
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT UNIQUE NOT NULL,
  modelo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('vans', 'suvs', 'blindados', 'executivo')),
  ano INTEGER NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'manutencao')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de corridas
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'atribuido', 'em_andamento', 'concluida', 'cancelada')),
  distance DECIMAL,
  price DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_client_id ON rides(client_id);
CREATE INDEX IF NOT EXISTS idx_rides_car_id ON rides(car_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_scheduled_time ON rides(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Permitir signup público"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem ver seus próprios dados"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Gerentes podem ver todos os usuários"
  ON users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

CREATE POLICY "Gerentes podem editar usuários"
  ON users FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

-- Políticas RLS para clients
CREATE POLICY "Todos podem ver clientes"
  ON clients FOR SELECT
  USING (true);

CREATE POLICY "Gerentes podem criar e atualizar clientes"
  ON clients FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

CREATE POLICY "Gerentes podem editar clientes"
  ON clients FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

-- Políticas RLS para cars
CREATE POLICY "Todos podem ver carros ativos"
  ON cars FOR SELECT
  USING (status = 'ativo' OR auth.uid() IN (SELECT id FROM users WHERE role = 'gerente'));

CREATE POLICY "Gerentes podem criar carros"
  ON cars FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

CREATE POLICY "Gerentes podem editar carros"
  ON cars FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

-- Políticas RLS para rides
CREATE POLICY "Gerentes podem ver todas as corridas"
  ON rides FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

CREATE POLICY "Motoristas podem ver suas próprias corridas"
  ON rides FOR SELECT
  USING (
    driver_id = auth.uid()
  );

CREATE POLICY "Gerentes podem criar corridas"
  ON rides FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

CREATE POLICY "Gerentes podem atualizar corridas"
  ON rides FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'gerente'
    )
  );

CREATE POLICY "Motoristas podem atualizar suas corridas"
  ON rides FOR UPDATE
  USING (
    driver_id = auth.uid()
  );

-- Políticas RLS para notifications
CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON notifications FOR SELECT
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Qualquer usuário autenticado pode inserir notificações"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

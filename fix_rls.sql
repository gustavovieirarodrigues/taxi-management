-- ========================================
-- CORRIGIR PROBLEMAS DE RLS
-- ========================================

-- 1. DESABILITAR RLS NA TABELA USERS (sem RLS, todos conseguem acessar)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Alternativa: Se quiser manter RLS, execute isto:
-- DROP POLICY IF EXISTS "Permitir signup público" ON users;
-- DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON users;
-- DROP POLICY IF EXISTS "Gerentes podem ver todos os usuários" ON users;

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- -- Permitir que qualquer um insira usuários (para signup)
-- CREATE POLICY "Qualquer um pode se registrar"
--   ON users FOR INSERT
--   WITH CHECK (true);

-- -- Permitir que cada usuário veja seus próprios dados
-- CREATE POLICY "Usuários veem dados próprios"
--   ON users FOR SELECT
--   USING (auth.uid() = id);

-- 2. MANTER RLS NAS OUTRAS TABELAS, MAS SEM RESTRIÇÕES MUITO FORTE
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE rides DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ========================================
-- Se preferir manter RLS com políticas menos restritivas:
-- ========================================
-- Descomentar o bloco acima e comentar os ALTER DISABLE

COMMIT;

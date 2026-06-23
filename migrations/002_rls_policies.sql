-- ============================================================
-- NOCPedia — Migration 002: Row Level Security Policies
-- Descrição: Políticas RLS equivalentes às regras Firestore,
--            funções helper e trigger de auto-criação de perfil.
-- Executar via: supabase migration up ou SQL Editor
-- ============================================================

-- ============================================================
-- 1. Funções Helper
-- ============================================================

-- is_admin(): verifica se o usuário autenticado tem role 'admin'
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- current_user_id(): retorna o UUID do usuário autenticado como TEXT
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
BEGIN
  RETURN auth.uid()::text;
END;
$$;

-- ============================================================
-- 2. Habilitar RLS em todas as tabelas
-- ============================================================
ALTER TABLE commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Políticas: commands
-- Equivalência Firestore: leitura pública, escrita apenas admin
-- ============================================================

CREATE POLICY "commands_select_public" ON commands
  FOR SELECT USING (true);

CREATE POLICY "commands_insert_admin" ON commands
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "commands_update_admin" ON commands
  FOR UPDATE USING (is_admin());

CREATE POLICY "commands_delete_admin" ON commands
  FOR DELETE USING (is_admin());

-- ============================================================
-- 4. Políticas: clientes
-- Equivalência Firestore:
--   SELECT: admin ou cliente vinculado
--   INSERT: apenas admin
--   UPDATE: admin ou cliente vinculado
--   DELETE: apenas admin
-- ============================================================

CREATE POLICY "clientes_select" ON clientes
  FOR SELECT USING (
    is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
          AND role = 'cliente'
          AND cliente_id = clientes.id
      )
    )
  );

CREATE POLICY "clientes_insert_admin" ON clientes
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "clientes_update" ON clientes
  FOR UPDATE USING (
    is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
          AND role = 'cliente'
          AND cliente_id = clientes.id
      )
    )
  );

CREATE POLICY "clientes_delete_admin" ON clientes
  FOR DELETE USING (is_admin());

-- ============================================================
-- 5. Políticas: ativos
-- Equivalência Firestore: mesmas regras do cliente pai
--   SELECT: admin ou cliente vinculado ao cliente_id do ativo
--   INSERT: admin ou cliente vinculado ao cliente_id do ativo
--   UPDATE: admin ou cliente vinculado ao cliente_id do ativo
--   DELETE: admin ou cliente vinculado ao cliente_id do ativo
-- ============================================================

CREATE POLICY "ativos_select" ON ativos
  FOR SELECT USING (
    is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
          AND role = 'cliente'
          AND cliente_id = ativos.cliente_id
      )
    )
  );

CREATE POLICY "ativos_insert" ON ativos
  FOR INSERT WITH CHECK (
    is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
          AND role = 'cliente'
          AND cliente_id = ativos.cliente_id
      )
    )
  );

CREATE POLICY "ativos_update" ON ativos
  FOR UPDATE USING (
    is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
          AND role = 'cliente'
          AND cliente_id = ativos.cliente_id
      )
    )
  );

CREATE POLICY "ativos_delete" ON ativos
  FOR DELETE USING (
    is_admin()
    OR (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
          AND role = 'cliente'
          AND cliente_id = ativos.cliente_id
      )
    )
  );

-- ============================================================
-- 6. Políticas: user_profiles
-- Equivalência Firestore:
--   SELECT: autenticado (próprio perfil ou admin vê todos)
--   INSERT: apenas admin (trigger cuida do auto-cadastro)
--   UPDATE: admin ou próprio usuário
--   DELETE: apenas admin
-- ============================================================

CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "user_profiles_insert_admin" ON user_profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (
    id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "user_profiles_delete_admin" ON user_profiles
  FOR DELETE USING (is_admin());

-- ============================================================
-- 7. Políticas: backups
-- Equivalência Firestore: apenas admin
-- ============================================================

CREATE POLICY "backups_select_admin" ON backups
  FOR SELECT USING (is_admin());

CREATE POLICY "backups_insert_admin" ON backups
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "backups_delete_admin" ON backups
  FOR DELETE USING (is_admin());

-- ============================================================
-- 8. Trigger: Auto-criação de perfil ao registrar novo usuário
-- Cria automaticamente um registro em user_profiles quando
-- um novo usuário se cadastra via Supabase Auth.
-- Admin automático para email noc.itmanage@gmail.com
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email = 'noc.itmanage@gmail.com' THEN 'admin'
      ELSE 'viewer'
    END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

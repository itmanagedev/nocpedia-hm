-- Drop existing incorrect tables
DROP TABLE IF EXISTS command_items CASCADE;
DROP TABLE IF EXISTS ativos CASCADE;
DROP TABLE IF EXISTS commands CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS backups CASCADE;

-- Extensão necessária para busca textual com trigramas
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Tabela: clientes
CREATE TABLE clientes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia     TEXT NOT NULL CHECK (char_length(nome_fantasia) BETWEEN 1 AND 200),
  razao_social      TEXT,
  cnpj              TEXT,
  website           TEXT,
  contato_nome      TEXT,
  contato_telefone  TEXT,
  contato_email     TEXT,
  noc_nome          TEXT,
  noc_telefone      TEXT,
  noc_email         TEXT,
  infraestrutura    JSONB[] DEFAULT '{}',
  cep               TEXT,
  pais              TEXT,
  estado            TEXT,
  cidade            TEXT,
  endereco          TEXT,
  geolocalizacao    TEXT,
  documentos        JSONB[] DEFAULT '{}',
  created_by        UUID,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome_fantasia);
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);

-- 2. Tabela: user_profiles (modified for migration - no auth.users FK, add firebase_uid)
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'cliente')),
  cliente_id  UUID REFERENCES clientes(id) ON DELETE SET NULL,
  firebase_uid TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 3. Tabela: commands
CREATE TABLE commands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL CHECK (char_length(titulo) BETWEEN 1 AND 200),
  descricao   TEXT CHECK (char_length(descricao) <= 1000),
  itens       JSONB[] NOT NULL CHECK (array_length(itens, 1) BETWEEN 1 AND 20),
  observacoes TEXT CHECK (char_length(observacoes) <= 5000),
  fabricante  TEXT NOT NULL,
  categoria   TEXT NOT NULL,
  subgrupo    TEXT,
  is_premium  BOOLEAN DEFAULT FALSE,
  tags        TEXT[] DEFAULT '{}',
  link_externo TEXT,
  created_by  UUID REFERENCES user_profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commands_fabricante ON commands(fabricante);
CREATE INDEX IF NOT EXISTS idx_commands_categoria ON commands(categoria);
CREATE INDEX IF NOT EXISTS idx_commands_titulo_trgm ON commands USING GIN(titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_commands_tags ON commands USING GIN(tags);

-- 4. Tabela: ativos
CREATE TABLE ativos (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id              UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  categoria_acesso        TEXT NOT NULL,
  nome                    TEXT NOT NULL,
  tipo                    TEXT NOT NULL,
  fabricante              TEXT NOT NULL,
  modelo                  TEXT,
  tags                    TEXT[] DEFAULT '{}',
  ipv4_hostname           TEXT,
  ipv6_hostname           TEXT,
  url_fqdn_domain         TEXT,
  ssh_user                TEXT,
  ssh_password            TEXT,
  ssh_port                TEXT,
  other_user              TEXT,
  other_password          TEXT,
  other_port              TEXT,
  console_password        TEXT,
  snmp_community          TEXT,
  pop_location            TEXT,
  observacoes             TEXT,
  backup_file_content     TEXT,
  backup_file_name        TEXT,
  network_topology_link   TEXT,
  network_topology_file_name TEXT,
  link_type               TEXT,
  id_circuito             TEXT,
  velocidade_contratada   TEXT,
  enlace_ipv4             TEXT,
  id_vlan_ipv4            TEXT,
  enlace_ipv6             TEXT,
  id_vlan_ipv6            TEXT,
  multihop                TEXT,
  multihop_ipv6           TEXT,
  community_blackhole     TEXT,
  endereco_abordagem      TEXT,
  contato_noc             TEXT,
  email_noc               TEXT,
  endereco_cliente        TEXT,
  ipv4_publico            TEXT,
  ipv6_publico            TEXT,
  pppoe_user              TEXT,
  pppoe_password          TEXT,
  last_mile               TEXT,
  contato_last_mile       TEXT,
  created_by              UUID,
  created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ativos_cliente ON ativos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ativos_categoria ON ativos(categoria_acesso);

-- 5. Tabela: backups
CREATE TABLE backups (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  created_by  TEXT NOT NULL DEFAULT 'system',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at DESC);

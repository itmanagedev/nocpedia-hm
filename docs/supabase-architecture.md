# Supabase Architecture — NOCPedia Migration

## Equivalência Firebase → Supabase

| Firebase | Supabase | Status |
|----------|----------|--------|
| Authentication | Auth (built-in) | ✅ Mapeado |
| Firestore (NoSQL) | PostgreSQL (relacional) | ✅ Mapeado |
| Storage | Storage (S3-compatible) | 🟡 Não usado hoje, mapear |
| Security Rules | Row Level Security (RLS) | ✅ Mapeado |
| Real-time listeners | Realtime (CDC via replication) | ✅ Mapeado |
| Cloud Functions | Edge Functions (Deno) | 🟡 Não usado hoje |
| Offline persistence | [cliente local] | ⚠️ Requer estratégia |

---

## 1. Auth — Supabase Auth

### Provedores
| Firebase | Supabase |
|----------|----------|
| Google (signInWithPopup) | Google OAuth (`signInWithOAuth`) |
| Email/Senha | Email Auth (`signInWithPassword`, `signUp`) |

### Operações Mapeadas

| Firebase (App.tsx) | Supabase Equivalente |
|--------------------|----------------------|
| `onAuthStateChanged(auth, callback)` | `supabase.auth.onAuthStateChange((event, session) => ...)` |
| `signInWithPopup(auth, provider)` | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| `signInWithEmailAndPassword(auth, email, pass)` | `supabase.auth.signInWithPassword({ email, password })` |
| `createUserWithEmailAndPassword(auth, email, pass)` | `supabase.auth.signUp({ email, password })` |
| `signOut(auth)` | `supabase.auth.signOut()` |
| `auth.currentUser` | `supabase.auth.getSession()` / `session.user` |
| Secondary app (create user by admin) | `supabase.auth.admin.createUser()` (Server-side / Edge Function) |

### Fluxo de Auto-Criação de Perfil
Atualmente em `App.tsx:1167-1196`:
1. Ao logar, busca `users/{uid}` → **Supabase**: `SELECT * FROM user_profiles WHERE id = auth.uid()`
2. Se não existe, cria com role 'viewer' (ou 'admin' se email = `noc.itmanage@gmail.com`) → **Supabase**: `INSERT INTO user_profiles` via trigger `ON_AUTH_USER_CREATED` ou RPC
3. Força admin se email = default → **Supabase**: trigger `BEFORE INSERT` na `user_profiles`

### Admin Hardcoded
- Email: `noc.itmanage@gmail.com` → Mapear via trigger/Edge Function que verifica email na criação do perfil

---

## 2. Database — PostgreSQL Schema

### 2.1 Estrutura Geral
Firestore coleções aninhadas viram tabelas relacionais. A subcoleção `ativos` vira tabela própria com FK.

### 2.2 Tabela: `commands`
Equivalente à coleção Firestore `commands/`.

```sql
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
  uid         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_commands_fabricante ON commands(fabricante);
CREATE INDEX idx_commands_categoria ON commands(categoria);
CREATE INDEX idx_commands_tags ON commands USING GIN(tags);
CREATE INDEX idx_commands_titulo_trgm ON commands USING GIN(titulo gin_trgm_ops);
```

**Migração dos dados:**
- `createdAt` (Timestamp) → `created_at` (timestamptz)
- `updatedAt` → `updated_at`
- `isPremium` → `is_premium`
- `linkExterno` → `link_externo`
- `itens` (array de {comando, explicacao}) → `JSONB[]` — exatamente o mesmo formato

### 2.3 Tabela: `user_profiles`
Equivalente à coleção Firestore `users/`. Nome diferente para evitar conflito com `auth.users` do Supabase.

```sql
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'cliente')),
  cliente_id  UUID REFERENCES clientes(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'noc.itmanage@gmail.com' THEN 'admin' ELSE 'viewer' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 2.4 Tabela: `clientes`
Equivalente à coleção Firestore `clientes/`.

```sql
CREATE TABLE clientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia   TEXT NOT NULL CHECK (char_length(nome_fantasia) BETWEEN 1 AND 200),
  razao_social    TEXT,
  cnpj            TEXT,
  website         TEXT,
  contato_nome    TEXT,
  contato_telefone TEXT,
  contato_email   TEXT,
  noc_nome        TEXT,
  noc_telefone    TEXT,
  noc_email       TEXT,
  infraestrutura  JSONB[] DEFAULT '{}',
  cep             TEXT,
  pais            TEXT,
  estado          TEXT,
  cidade          TEXT,
  endereco        TEXT,
  geolocalizacao  TEXT,
  documentos      JSONB[] DEFAULT '{}',
  uid             TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clientes_nome ON clientes(nome_fantasia);
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);
```

**Nota sobre documentos Base64:** Os anexos (`documentos[].content`) armazenados como Base64 inline continuarão na tabela como JSONB. Futuramente podem migrar para Supabase Storage.

### 2.5 Tabela: `ativos`
Equivalente à subcoleção Firestore `clientes/{id}/ativos/`. Agora é uma tabela plana com FK.

```sql
CREATE TABLE ativos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id            UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  categoria_acesso      TEXT NOT NULL,
  nome                  TEXT NOT NULL,
  tipo                  TEXT NOT NULL,
  fabricante            TEXT NOT NULL,
  modelo                TEXT,
  tags                  TEXT[] DEFAULT '{}',
  url_logo              TEXT,
  ipv4_hostname         TEXT,
  ipv4_loopback         TEXT,
  ipv6_hostname         TEXT,
  ipv6_loopback         TEXT,
  url_fqdn_domain       TEXT,
  ssh_port              TEXT,
  ssh_user              TEXT,
  ssh_password          TEXT,
  other_port            TEXT,
  other_user            TEXT,
  other_password        TEXT,
  port_aux_ip_addr      TEXT,
  pop_location          TEXT,
  snmp_community        TEXT,
  console_password      TEXT,
  status                TEXT,
  observacoes           TEXT,
  network_topology_link TEXT,
  network_topology_file_content TEXT,
  network_topology_file_name   TEXT,
  backup_file_content   TEXT,
  backup_file_name      TEXT,
  backup_file_size      BIGINT,
  link_type             TEXT,
  id_circuito           TEXT,
  velocidade_contratada TEXT,
  enlace_ipv4           TEXT,
  id_vlan_ipv4          TEXT,
  enlace_ipv6           TEXT,
  id_vlan_ipv6          TEXT,
  multihop              TEXT,
  multihop_ipv6         TEXT,
  community_blackhole   TEXT,
  endereco_abordagem    TEXT,
  contato_noc           TEXT,
  email_noc             TEXT,
  endereco_cliente      TEXT,
  ipv4_publico          TEXT,
  ipv6_publico          TEXT,
  pppoe_user            TEXT,
  pppoe_password        TEXT,
  last_mile             TEXT,
  contato_last_mile     TEXT,
  uid                   TEXT NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ativos_cliente ON ativos(cliente_id);
CREATE INDEX idx_ativos_categoria ON ativos(categoria_acesso);
```

### 2.6 Tabela: `backups`
Equivalente à coleção Firestore `backups/`.

```sql
CREATE TABLE backups (
  id          TEXT PRIMARY KEY, -- date string 'YYYY-MM-DD'
  date        TIMESTAMPTZ DEFAULT now(),
  data        TEXT NOT NULL,    -- JSON.stringify
  created_by  TEXT NOT NULL DEFAULT 'system'
);

CREATE INDEX idx_backups_date ON backups(date DESC);
```

---

## 3. Real-time — Supabase Realtime

### Listeners Mapeados

| Firebase (onSnapshot) | Supabase Equivalente | Tabela |
|-----------------------|---------------------|--------|
| `collection('commands')` ordenado por createdAt desc | `supabase.channel('commands').on('postgres_changes', { event: '*', schema: 'public', table: 'commands' }, callback).subscribe()` + query inicial | `commands` |
| `collection('clientes')` ordenado por nomeFantasia asc | `supabase.channel('clientes').on('postgres_changes', { ... table: 'clientes' }, callback)` | `clientes` |
| `doc('clientes', id)` — cliente individual | `supabase.channel('cliente-single').on('postgres_changes', { event: '*', schema: 'public', table: 'clientes', filter: `id=eq.${id}` }, callback)` | `clientes` (filtrado) |
| `collection('clientes', id, 'ativos')` | `supabase.channel('ativos').on('postgres_changes', { ... table: 'ativos', filter: `cliente_id=eq.${id}` }, callback)` | `ativos` |
| `collection('users')` | `supabase.channel('user_profiles').on('postgres_changes', { ... table: 'user_profiles' }, callback)` | `user_profiles` |
| `collection('backups')` | `supabase.channel('backups').on('postgres_changes', { ... table: 'backups' }, callback)` | `backups` |

### Estratégia de Implementação
```typescript
// Hook customizado exemplo
function useRealtimeSubscription<T>(
  table: string,
  filter?: string,
  initialQuery: () => Promise<{ data: T[] }>
) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    // 1. Fetch initial data
    initialQuery().then(({ data }) => setData(data ?? []));

    // 2. Subscribe to changes
    const channel = supabase
      .channel(table)
      .on('postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          // Handle INSERT, UPDATE, DELETE
          setData(prev => {
            if (payload.eventType === 'INSERT') return [...prev, payload.new as T];
            if (payload.eventType === 'UPDATE') return prev.map(x => x.id === payload.new.id ? payload.new : x);
            if (payload.eventType === 'DELETE') return prev.filter(x => x.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, filter]);

  return data;
}
```

---

## 4. RLS — Row Level Security

### Equivalência das Regras Firestore

| Firestore Rule | RLS Policy |
|----------------|------------|
| `isAuthenticated()` | `auth.role() = 'authenticated'` |
| `isAdmin()` | `EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')` |
| `isCliente(clienteId)` | `auth.uid() IN (SELECT id FROM user_profiles WHERE role = 'cliente' AND cliente_id = clienteId)` |

### Policies por Tabela

#### `commands`
```sql
-- SELECT: público (true)
CREATE POLICY "commands_select_public" ON commands
  FOR SELECT USING (true);

-- INSERT: admin only
CREATE POLICY "commands_insert_admin" ON commands
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- UPDATE: admin only
CREATE POLICY "commands_update_admin" ON commands
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: admin only
CREATE POLICY "commands_delete_admin" ON commands
  FOR DELETE USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### `clientes`
```sql
-- SELECT: admin OR cliente (only own)
CREATE POLICY "clientes_select" ON clientes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR (
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'cliente' AND cliente_id = id)
    )
  );

-- INSERT: admin only
CREATE POLICY "clientes_insert_admin" ON clientes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- UPDATE: admin OR cliente (own)
CREATE POLICY "clientes_update" ON clientes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR (
      EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'cliente' AND cliente_id = id)
    )
  );

-- DELETE: admin only
CREATE POLICY "clientes_delete_admin" ON clientes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### `ativos`
```sql
-- SELECT: admin OR cliente (own client's assets)
CREATE POLICY "ativos_select" ON ativos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'cliente' AND cliente_id = ativos.cliente_id
    )
  );

-- INSERT: admin OR cliente (own client)
CREATE POLICY "ativos_insert" ON ativos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'cliente' AND cliente_id = cliente_id
    )
  );

-- UPDATE: admin OR cliente (own client)
CREATE POLICY "ativos_update" ON ativos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'cliente' AND cliente_id = cliente_id
    )
  );

-- DELETE: admin OR cliente (own client)
CREATE POLICY "ativos_delete" ON ativos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'cliente' AND cliente_id = cliente_id
    )
  );
```

#### `user_profiles`
```sql
-- SELECT: authenticated users can see their own profile + admins see all
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- INSERT: admin only (trigger handles self-signup)
CREATE POLICY "user_profiles_insert_admin" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- UPDATE: admin OR self (non-role fields only for self)
CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: admin only
CREATE POLICY "user_profiles_delete_admin" ON user_profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### `backups`
```sql
-- SELECT: admin only
CREATE POLICY "backups_select_admin" ON backups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- INSERT: admin only
CREATE POLICY "backups_insert_admin" ON backups
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: admin only
CREATE POLICY "backups_delete_admin" ON backups
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 5. Estratégia de Migração por Feature

### 5.1 Auth
- Substituir `onAuthStateChanged` por `supabase.auth.onAuthStateChange`
- Substituir `signInWithPopup` por `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Substituir `signInWithEmailAndPassword` por `supabase.auth.signInWithPassword`
- Substituir `createUserWithEmailAndPassword` por `supabase.auth.signUp`
- Auto-criação de perfil: trigger SQL `on_auth_user_created`
- Secondary app: remover — usar `supabase.auth.admin.createUser()` via Edge Function

### 5.2 Wiki de Comandos
- CRUD via `supabase.from('commands').insert/update/delete/select`
- Listener real-time via `postgres_changes` na tabela `commands`
- Seed data: adaptar `serverTimestamp()` para `new Date().toISOString()`

### 5.3 Gestão de Clientes
- CRUD via `supabase.from('clientes')`
- Documentos Base64 continuam como JSONB na coluna `documentos`
- Listener real-time via `postgres_changes` com filter `cliente_id=eq.{id}`

### 5.4 Gestão de Ativos
- CRUD via `supabase.from('ativos')` — não mais subcoleção aninhada
- Referência FK `cliente_id`
- Listener real-time com filter por `cliente_id`
- Backups de ativos (Base64) continuam como coluna TEXT

### 5.5 Backup e Restore
- `generateBackupData`: SELECT em todas as tabelas via `supabase.from('...').select('*')`
- `performAutoBackup`: INSERT em `backups` com data serializada
- `restoreFromBackup`: DELETE + INSERT em lote (usar Edge Function para atomicidade)
- Pruning: `supabase.from('backups').delete().lte('date', 7_days_ago)`

### 5.6 Admin: Gerenciar Usuários
- Criar usuário: Edge Function que chama `supabase.auth.admin.createUser()`
- Editar role: `supabase.from('user_profiles').update({ role }).eq('id', uid)`
- Listar: `supabase.from('user_profiles').select('*')`

---

## 6. Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 7. Cronograma de Migração Sugerido

| Fase | Atividade | Tabelas/Features |
|------|-----------|------------------|
| 1 | Discovery ✅ | Este documento |
| 2 | Provisioning | Criar projeto Supabase, configurar Auth, buckets |
| 3 | Schema + RLS | Migrations SQL para todas as tabelas + policies |
| 4 | Camada Repository | Abstração `UserRepository`, `CommandRepository`, etc. |
| 5 | Auth Migration | Substituir Firebase Auth por Supabase Auth |
| 6 | Commands Wiki | Migrar CRUD + listener de commands |
| 7 | Clientes + Ativos | Migrar tabelas relacionais com FK |
| 8 | Backups | Migrar lógica de backup/restore |
| 9 | Homologação | Testar todas as features no clone |
| 10 | Cutover | Redirecionar produção |

---

## 8. Riscos e Observações

1. **Base64 inline** — Documentos e backups de ativos armazenados como Base64 no Firestore continuarão como JSONB/TEXT. Idealmente migrar para Supabase Storage em fase posterior.
2. **Sem paginação** — O Firebase atual busca dados completos. No Supabase, considerar `.range()` para otimização futura.
3. **`where` não usado hoje** — O código atual importa `where` mas nunca o utiliza. No Supabase, filtragem será via `.eq()`, `.in()`, etc.
4. **Offline-first** — Firebase SDK tem cache offline embutido. Supabase JS client não tem cache offline nativo. Avaliar `@tanstack/query` + local storage ou PWA com Service Worker.
5. **Secondary app removal** — A criação de usuários por admin (Firebase secondary app) deve ser substituída por uma **Edge Function** com `service_role` key para chamar `supabase.auth.admin.createUser()`.
6. **Batch writes** — `writeBatch` do Firebase equivale a múltiplas queries no Supabase. Para atomicidade, usar Edge Function com transação SQL.
7. **Tipo `any` nos timestamps** — Os tipos TypeScript usam `any` para `createdAt`. No Supabase, timestamps serão `string` (ISO 8601).

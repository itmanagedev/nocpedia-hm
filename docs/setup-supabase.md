# Setup do Projeto Supabase — Homologação (NOCPedia)

> Documento de provisionamento do ambiente de homologação.
> Baseado na arquitetura definida em `docs/supabase-architecture.md`.

---

## 1. Criar o Projeto Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Clique em **New project**
3. Preencha:
   - **Name:** `nocpedia-homolog`
   - **Database Password:** gere uma senha forte e salve (use um gerenciador de senhas)
   - **Region:** escolha a mais próxima dos seus usuários (ex: `South America (São Paulo)` — `sa-east-1` se disponível, ou `us-east-1`)
   - **Pricing Plan:** **Free** (para homologação é suficiente)
4. Clique em **Create new project** (a criação leva ~2 minutos)

> ⚠️ Anote o **Database Password** — ele será necessário para acesso direto ao PostgreSQL.
>
> **Projeto ativo:** `https://qcfoaqstnujhjwqdbrty.supabase.co`
> **Repositório:** `https://github.com/marcusnog/nocpedia-hm.git`

---

## 2. Obter URL e Chaves da API

Após o projeto ser criado:

1. No dashboard do projeto, vá em **Project Settings** (ícone de engrenagem) → **API**
2. Na seção **Project URL**, copie:
   - **URL:** `https://<project-id>.supabase.co`
3. Na seção **Project API keys**, copie:
   - **`anon` public** → `VITE_SUPABASE_ANON_KEY`
   - **`service_role`** → `SUPABASE_SERVICE_ROLE_KEY`

### Preencher `.env.homolog`

Edite o arquivo `.env.homolog` na raiz do projeto:

```env
VITE_SUPABASE_URL="https://<project-id>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon-public-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

Após preencher, **renomeie o arquivo para `.env`** (ou crie uma cópia chamada `.env`).

> ⚠️ A `service_role` key é secreta e **NUNCA** deve ser exposta no front-end. Ela é necessária apenas para Edge Functions e scripts administrativos.

---

## 3. Configurar Provedores de Autenticação

No Supabase Dashboard, vá em **Authentication** → **Providers**:

### 3.1 Google OAuth (obrigatório)

1. Em **Providers**, clique em **Google**
2. Ative **Google** habilitando o toggle
3. Configure:
   - **Client ID** e **Client Secret** — obtidos do [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. No Google Cloud Console, configure os **URIs de redirecionamento**:
   ```
   https://<project-id>.supabase.co/auth/v1/callback
   ```
5. Salve as configurações

### 3.2 Email/Password (obrigatório)

1. Em **Providers**, clique em **Email**
2. Confirme que está **habilitado**
3. Configure:
   - **Confirm email:** desabilite (recomendado para homologação) ou mantenha habilitado se quiser testar o fluxo completo
   - **Secure email change:** habilite
4. Salve

---

## 4. Buckets de Storage

Atualmente o NOCPedia **não utiliza** o Firebase Storage — documentos e backups são armazenados como Base64 inline no banco de dados (`JSONB[]` / `TEXT`).
Porém, para preparar a migração futura, crie os buckets:

1. No Supabase Dashboard, vá em **Storage** → **New bucket**
2. Crie os seguintes buckets:

| Bucket | Público? | Finalidade |
|--------|----------|------------|
| `documentos` | Não | Documentos de clientes (futuro) |
| `backups` | Não | Backups de ativos (futuro) |

3. Para cada bucket, em **Storage** → **Policies**, crie as políticas RLS:

### `documentos`
```sql
-- Usuários autenticados podem ler documentos dos seus clientes
CREATE POLICY "documentos_select" ON storage.objects
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Admins podem fazer upload/delete
CREATE POLICY "documentos_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "documentos_delete_admin" ON storage.objects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### `backups`
```sql
-- Apenas admins acessam backups
CREATE POLICY "backups_select_admin" ON storage.objects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "backups_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "backups_delete_admin" ON storage.objects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

> Nota: Os buckets podem ser criados manualmente via dashboard. As políticas RLS de Storage serão aplicadas na Fase 3 juntamente com as demais migrations.

---

## 5. Configurações de Segurança Iniciais

### 5.1 Desabilitar Signup Público

Para evitar que usuários não autorizados criem contas:

1. Vá em **Authentication** → **Providers** → **Email**
2. Em **Confirm email**, mantenha desabilitado para homologação
3. Em **Settings** → **General**, desabilite **Allow new users to sign up** (até que seja necessário testar o fluxo)

### 5.2 Rate Limiting (opcional)

Em **Authentication** → **Settings** → **Rate limiting**, ajuste os limites conforme necessário:
- **SMTP** — padrão ok
- **Sign-up** — reduzir para 1 request/60s durante testes

### 5.3 SSL Enforcement

Em **Project Settings** → **API** → **SSL Configuration**:
- Verifique que **Enforce SSL** está ativado (padrão)

---

## 6. Verificação Pós-Setup

Após seguir todos os passos acima, verifique:

1. **Dashboard do projeto** — acessível e sem erros
2. **Auth providers** — Google e Email aparecem como ativos em Authentication → Providers
3. **Storage buckets** — `documentos` e `backups` listados em Storage
4. **API keys** — testar com uma requisição curl:
   ```bash
   curl -X GET "$VITE_SUPABASE_URL/rest/v1/" \
     -H "apikey: $VITE_SUPABASE_ANON_KEY"
   ```
   Deve retornar `200 OK` com as collections disponíveis

---

## 7. Links Rápidos

| Recurso | Link |
|---------|------|
| Dashboard Supabase | https://supabase.com/dashboard/projects |
| Auth Providers | https://supabase.com/dashboard/project/_/auth/providers |
| Storage | https://supabase.com/dashboard/project/_/storage/buckets |
| API Settings | https://supabase.com/dashboard/project/_/settings/api |
| Google Cloud Console | https://console.cloud.google.com/apis/credentials |

> Substitua `_` pelo seu `project_id` nos links do dashboard.

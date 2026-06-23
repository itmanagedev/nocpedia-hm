import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { execSync } from "child_process";

dotenv.config();

// =========================
// INIT
// =========================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ID mapping: old Firestore ID -> new UUID
const idMap = { clientes: {}, user_profiles: {}, commands: {}, ativos: {} };

function getOrCreateUUID(map, oldId) {
  if (!oldId) return null;
  if (!map[oldId]) map[oldId] = randomUUID();
  return map[oldId];
}

function cleanBackupTimestamp(ts) {
  if (!ts) return null;
  if (ts.type === "firestore/timestamp/1.0") {
    return new Date(ts.seconds * 1000 + ts.nanoseconds / 1e6).toISOString();
  }
  if (ts instanceof Date) return ts.toISOString();
  return new Date(ts).toISOString();
}

// =========================
// LOAD BACKUP
// =========================
const BACKUP_PATH = "./migrations/backup/backup.json";

function loadBackup() {
  if (!existsSync(BACKUP_PATH)) {
    console.error(`❌ Backup not found at ${BACKUP_PATH}`);
    process.exit(1);
  }
  const raw = readFileSync(BACKUP_PATH, "utf-8");
  return JSON.parse(raw);
}

// =========================
// CHECK / CREATE TABLES
// =========================
const SCHEMA_SQL = readFileSync("./migrations/001_initial_schema.sql", "utf-8");
const RLS_SQL = readFileSync("./migrations/002_rls_policies.sql", "utf-8");

// Modified user_profiles for migration (no auth.users FK, add firebase_uid)
const MIGRATION_SCHEMA = SCHEMA_SQL.replace(
  `CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'cliente')),
  cliente_id  UUID REFERENCES clientes(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);`,
  `CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'cliente')),
  cliente_id  UUID REFERENCES clientes(id) ON DELETE SET NULL,
  firebase_uid TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);`
).replace(/CREATE TABLE /g, "CREATE TABLE IF NOT EXISTS ");

async function ensureTables() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Accept: "application/json" },
  });
  const schema = await res.json();
  const paths = Object.keys(schema.paths || {});
  const found = ["/clientes", "/user_profiles", "/commands", "/ativos", "/backups"]
    .every((p) => paths.includes(p));

  if (found) {
    console.log("✅ All tables exist in Supabase");
    return;
  }

  console.log("📦 Missing tables. Applying schema via supabase CLI...");

  const tmpFile = "./migrations/_run_migration.sql";
  const combinedSQL = RLS_SQL;
  writeFileSync(tmpFile, combinedSQL, "utf-8");

  try {
    execSync(`npx.cmd supabase db query --linked --file "${tmpFile}"`, {
      stdio: "inherit",
      timeout: 60000,
    });
    console.log("✅ Schema applied");
  } catch {
    console.log("\n⚠️  Could not apply RLS automatically.");
  }

  try { execSync(`del "${tmpFile}" 2>nul`); } catch {}
}

// =========================
// MIGRATE CLIENTES (including nested ativos)
// =========================
async function migrateClientes(data) {
  console.log(`\n🏢 Migrating ${data.clientes.length} clientes...`);
  let ok = 0, err = 0;

  for (const c of data.clientes) {
    const newId = getOrCreateUUID(idMap.clientes, c.id);

    const record = {
      id: newId,
      nome_fantasia: c.nomeFantasia || "",
      razao_social: c.razaoSocial || null,
      cnpj: c.cnpj || null,
      website: c.website || null,
      contato_nome: c.contatoNome || null,
      contato_telefone: c.contatoTelefone || null,
      contato_email: c.contatoEmail || null,
      noc_nome: c.nocNome || null,
      noc_telefone: c.nocTelefone || null,
      noc_email: c.nocEmail || null,
      infraestrutura: Array.isArray(c.infraestrutura) && c.infraestrutura.length > 0 ? c.infraestrutura : [],
      cep: c.cep || null,
      pais: c.pais || null,
      estado: c.estado || null,
      cidade: c.cidade || null,
      endereco: c.endereco || null,
      geolocalizacao: c.geolocalizacao || null,
      documentos: Array.isArray(c.documentos) && c.documentos.length > 0 ? c.documentos : [],
      created_at: cleanBackupTimestamp(c.createdAt),
    };

    const { error } = await supabase.from("clientes").insert(record);
    if (error) {
      console.error(`  ❌ Cliente ${c.id}: ${error.message}`);
      err++;
    } else {
      ok++;
    }
  }
  console.log(`  ✅ ${ok} ok, ${err} errors`);
}

// =========================
// MIGRATE USER PROFILES
// =========================
async function migrateUsers(data) {
  console.log(`\n👤 Migrating ${data.users.length} user_profiles...`);
  let ok = 0, err = 0;

  for (const u of data.users) {
    const newId = getOrCreateUUID(idMap.user_profiles, u.uid);

    const clienteUUID = u.clienteId ? idMap.clientes[u.clienteId] || null : null;

    const record = {
      id: newId,
      email: u.email || "",
      role: u.role || "viewer",
      firebase_uid: u.uid || null,
      cliente_id: clienteUUID || null,
    };

    const { error } = await supabase.from("user_profiles").insert(record);
    if (error) {
      console.error(`  ❌ User ${u.id}: ${error.message}`);
      err++;
    } else {
      ok++;
    }
  }
  console.log(`  ✅ ${ok} ok, ${err} errors`);
}

// =========================
// MIGRATE COMMANDS
// =========================
async function migrateCommands(data) {
  console.log(`\n🔥 Migrating ${data.commands.length} commands...`);
  let ok = 0, err = 0;

  for (const c of data.commands) {
    const newId = getOrCreateUUID(idMap.commands, c.id);
    const createdBy = c.uid ? idMap.user_profiles[c.uid] || null : null;

    const record = {
      id: newId,
      titulo: c.titulo || "",
      descricao: c.descricao || null,
      itens: Array.isArray(c.itens) && c.itens.length > 0 ? c.itens : [],
      observacoes: c.observacoes || null,
      fabricante: c.fabricante || "",
      categoria: c.categoria || "",
      subgrupo: c.subgrupo || null,
      is_premium: c.isPremium || c.is_premium || false,
      tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : [],
      link_externo: c.linkExterno || c.link_externo || null,
      created_by: createdBy,
      created_at: cleanBackupTimestamp(c.createdAt),
      updated_at: cleanBackupTimestamp(c.updatedAt),
    };

    const { error } = await supabase.from("commands").insert(record);
    if (error) {
      console.error(`  ❌ Command ${c.id}: ${error.message}`);
      err++;
    } else {
      ok++;
    }
  }
  console.log(`  ✅ ${ok} ok, ${err} errors`);
}

// =========================
// MIGRATE ATIVOS (from nested clientes.ativos)
// =========================
async function migrateAtivos(data) {
  const allAtivos = data.clientes.flatMap(c =>
    (c.ativos || []).map(a => ({ ...a, _clienteFirestoreId: c.id }))
  );
  console.log(`\n⚙️  Migrating ${allAtivos.length} ativos...`);
  let ok = 0, err = 0;

  for (const a of allAtivos) {
    const newId = getOrCreateUUID(idMap.ativos, a.id);
    const clienteUUID = a._clienteFirestoreId ? idMap.clientes[a._clienteFirestoreId] || null : null;
    const createdBy = a.uid ? idMap.user_profiles[a.uid] || null : null;

    const record = {
      id: newId,
      cliente_id: clienteUUID,
      categoria_acesso: a.categoriaAcesso || "",
      nome: a.nome || "",
      tipo: a.tipo || "",
      fabricante: a.fabricante || "",
      modelo: a.modelo || null,
      tags: Array.isArray(a.tags) && a.tags.length > 0 ? a.tags : [],
      ipv4_hostname: a.ipv4Hostname || null,
      ipv6_hostname: a.ipv6Hostname || null,
      url_fqdn_domain: a.urlFqdnDomain || null,
      ssh_user: a.sshUser || null,
      ssh_password: a.sshPassword || null,
      ssh_port: a.sshPort || null,
      other_user: a.otherUser || null,
      other_password: a.otherPassword || null,
      other_port: a.otherPort || null,
      console_password: a.consolePassword || null,
      snmp_community: a.snmpCommunity || null,
      pop_location: a.popLocation || null,
      observacoes: a.observacoes || null,
      backup_file_content: a.backupFileContent || null,
      backup_file_name: a.backupFileName || null,
      network_topology_link: a.networkTopologyLink || null,
      network_topology_file_name: a.networkTopologyFileName || null,
      link_type: a.linkType || null,
      id_circuito: a.idCircuito || null,
      velocidade_contratada: a.velocidadeContratada || null,
      enlace_ipv4: a.enlaceIpv4 || null,
      id_vlan_ipv4: a.idVlanIpv4 || null,
      enlace_ipv6: a.enlaceIpv6 || null,
      id_vlan_ipv6: a.idVlanIpv6 || null,
      multihop: a.multihop || null,
      multihop_ipv6: a.multihopIpv6 || null,
      community_blackhole: a.communityBlackhole || null,
      endereco_abordagem: a.enderecoAbordagem || null,
      contato_noc: a.contatoNoc || null,
      email_noc: a.emailNoc || null,
      endereco_cliente: a.enderecoCliente || null,
      ipv4_publico: a.ipv4Publico || null,
      ipv6_publico: a.ipv6Publico || null,
      pppoe_user: a.pppoeUser || null,
      pppoe_password: a.pppoePassword || null,
      last_mile: a.lastMile || null,
      contato_last_mile: a.contatoLastMile || null,
      created_by: createdBy,
      created_at: cleanBackupTimestamp(a.createdAt),
    };

    const { error } = await supabase.from("ativos").insert(record);
    if (error) {
      console.error(`  ❌ Ativo ${a.id}: ${error.message}`);
      err++;
    } else {
      ok++;
    }
  }
  console.log(`  ✅ ${ok} ok, ${err} errors`);
}

// =========================
// RUN
// =========================
async function run() {
  console.log("🚀 NOCPedia Firestore → Supabase Migration");
  console.log(`   Source: ${BACKUP_PATH}`);
  console.log(`   Target: ${SUPABASE_URL}\n`);

  // Step 0: Ensure tables exist
  await ensureTables();

  // Step 1: Load backup data
  const data = loadBackup();

  // Step 2: Migrate clientes (map IDs)
  await migrateClientes(data);

  // Step 3: Migrate user_profiles (needs clientes UUIDs for cliente_id)
  await migrateUsers(data);

  // Step 4: Migrate commands (needs user_profiles UUIDs for created_by)
  await migrateCommands(data);

  // Step 5: Migrate ativos (needs clientes UUIDs for cliente_id)
  await migrateAtivos(data);

  console.log("\n🎉 MIGRATION COMPLETE!");
  console.log("   Summary:");
  console.log(`     clientes:     ${data.clientes.length}`);
  console.log(`     user_profiles: ${data.users.length}`);
  console.log(`     commands:     ${data.commands.length}`);
  console.log(`     ativos:       ${data.clientes.reduce((s, c) => s + (c.ativos?.length || 0), 0)}`);
}

run().catch((e) => {
  console.error("\n💥 FATAL:", e);
  process.exit(1);
});

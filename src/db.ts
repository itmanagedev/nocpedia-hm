import { supabase } from './supabase';
import type { Command, Cliente, Ativo, Backup, DBUser } from './types';

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapKeys(obj: Record<string, unknown>, fn: (s: string) => string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (key === 'id') { result.id = obj[key]; continue; }
    if (key === 'uid') { result[fn('createdBy')] = obj[key]; continue; }
    result[fn(key)] = obj[key];
  }
  return result;
}

function mapKeysFromRow(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (key === 'id') { result.id = obj[key]; continue; }
    if (key === 'created_by') { result.uid = obj[key]; continue; }
    result[snakeToCamel(key)] = obj[key];
  }
  return result;
}

export type DbResult<T> = { data: T | null; error: string | null };

function handleError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ─── Commands ─────────────────────────────────────────────

const COMMAND_SELECT = 'id,titulo,descricao,itens,observacoes,fabricante,categoria,subgrupo,is_premium,tags,link_externo,created_by,created_at,updated_at';

function rowToCommand(row: Record<string, unknown>): Command {
  const d = mapKeysFromRow(row);
  return {
    ...d,
    isPremium: d.isPremium as boolean | undefined,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  } as unknown as Command;
}

function commandToRow(cmd: Partial<Command>): Record<string, unknown> {
  const { id, uid, ...rest } = cmd;
  const row = mapKeys(rest as Record<string, unknown>, camelToSnake);
  row.created_by = uid;
  if (cmd.createdAt) row.created_at = cmd.createdAt;
  if (cmd.updatedAt) row.updated_at = cmd.updatedAt;
  return row;
}

export async function fetchCommands(): Promise<DbResult<Command[]>> {
  const { data, error } = await supabase
    .from('commands')
    .select(COMMAND_SELECT)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: handleError(error) };
  return { data: (data || []).map(rowToCommand), error: null };
}

export async function addCommand(cmd: Partial<Command>): Promise<DbResult<Command>> {
  const row = { ...commandToRow(cmd), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('commands').insert(row).select(COMMAND_SELECT).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToCommand(data), error: null };
}

export async function updateCommand(id: string, cmd: Partial<Command>): Promise<DbResult<Command>> {
  const row = { ...commandToRow(cmd), updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('commands').update(row).eq('id', id).select(COMMAND_SELECT).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToCommand(data), error: null };
}

export async function deleteCommand(id: string): Promise<DbResult<null>> {
  const { error } = await supabase.from('commands').delete().eq('id', id);
  if (error) return { data: null, error: handleError(error) };
  return { data: null, error: null };
}

export async function seedCommands(commands: Partial<Command>[]): Promise<DbResult<null>> {
  const rows = commands.map(cmd => {
    const row = commandToRow(cmd);
    row.created_at = new Date().toISOString();
    row.updated_at = new Date().toISOString();
    return row;
  });
  const { error } = await supabase.from('commands').insert(rows);
  if (error) return { data: null, error: handleError(error) };
  return { data: null, error: null };
}

// ─── Clientes ─────────────────────────────────────────────

const CLIENTE_SELECT = 'id,nome_fantasia,razao_social,cnpj,website,contato_nome,contato_telefone,contato_email,noc_nome,noc_telefone,noc_email,infraestrutura,cep,pais,estado,cidade,endereco,geolocalizacao,documentos,created_by,created_at';

function rowToCliente(row: Record<string, unknown>): Cliente {
  return mapKeysFromRow(row) as unknown as Cliente;
}

function clienteToRow(c: Partial<Cliente>): Record<string, unknown> {
  const { id, uid, ...rest } = c;
  const row = mapKeys(rest as Record<string, unknown>, camelToSnake);
  row.created_by = uid;
  return row;
}

export async function fetchClientes(): Promise<DbResult<Cliente[]>> {
  const { data, error } = await supabase
    .from('clientes')
    .select(CLIENTE_SELECT)
    .order('nome_fantasia', { ascending: true });
  if (error) return { data: null, error: handleError(error) };
  return { data: (data || []).map(rowToCliente), error: null };
}

export async function getCliente(id: string): Promise<DbResult<Cliente>> {
  const { data, error } = await supabase.from('clientes').select(CLIENTE_SELECT).eq('id', id).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToCliente(data), error: null };
}

export async function addCliente(c: Partial<Cliente>): Promise<DbResult<Cliente>> {
  const row = { ...clienteToRow(c), created_at: new Date().toISOString() };
  const { data, error } = await supabase.from('clientes').insert(row).select(CLIENTE_SELECT).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToCliente(data), error: null };
}

export async function updateCliente(id: string, c: Partial<Cliente>): Promise<DbResult<Cliente>> {
  const row = clienteToRow(c);
  const { data, error } = await supabase.from('clientes').update(row).eq('id', id).select(CLIENTE_SELECT).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToCliente(data), error: null };
}

export async function deleteCliente(id: string): Promise<DbResult<null>> {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) return { data: null, error: handleError(error) };
  return { data: null, error: null };
}

// ─── Ativos ─────────────────────────────────────────────

const ATIVO_SELECT = 'id,cliente_id,categoria_acesso,nome,tipo,fabricante,modelo,tags,ipv4_hostname,ipv6_hostname,url_fqdn_domain,ssh_user,ssh_password,ssh_port,other_user,other_password,other_port,console_password,snmp_community,pop_location,observacoes,backup_file_content,backup_file_name,network_topology_link,network_topology_file_name,link_type,id_circuito,velocidade_contratada,enlace_ipv4,id_vlan_ipv4,enlace_ipv6,id_vlan_ipv6,multihop,multihop_ipv6,community_blackhole,endereco_abordagem,contato_noc,email_noc,endereco_cliente,ipv4_publico,ipv6_publico,pppoe_user,pppoe_password,last_mile,contato_last_mile,created_by,created_at';

function rowToAtivo(row: Record<string, unknown>): Ativo {
  const d = mapKeysFromRow(row);
  return { ...d, clienteId: (row as any).cliente_id } as unknown as Ativo;
}

function ativoToRow(a: Partial<Ativo>): Record<string, unknown> {
  const { id, uid, clienteId, ...rest } = a;
  const row = mapKeys(rest as Record<string, unknown>, camelToSnake);
  row.cliente_id = clienteId;
  row.created_by = uid;
  return row;
}

export async function fetchAtivos(clienteId: string): Promise<DbResult<Ativo[]>> {
  const { data, error } = await supabase
    .from('ativos')
    .select(ATIVO_SELECT)
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: handleError(error) };
  return { data: (data || []).map(rowToAtivo), error: null };
}

export async function addAtivo(a: Partial<Ativo>): Promise<DbResult<Ativo>> {
  const row = { ...ativoToRow(a), created_at: new Date().toISOString() };
  const { data, error } = await supabase.from('ativos').insert(row).select(ATIVO_SELECT).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToAtivo(data), error: null };
}

export async function updateAtivo(id: string, a: Partial<Ativo>): Promise<DbResult<Ativo>> {
  const row = ativoToRow(a);
  const { data, error } = await supabase.from('ativos').update(row).eq('id', id).select(ATIVO_SELECT).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToAtivo(data), error: null };
}

export async function deleteAtivo(id: string): Promise<DbResult<null>> {
  const { error } = await supabase.from('ativos').delete().eq('id', id);
  if (error) return { data: null, error: handleError(error) };
  return { data: null, error: null };
}

// ─── Backups ─────────────────────────────────────────────

const BACKUP_SELECT = 'id,data,created_by,created_at';

function rowToBackup(row: Record<string, unknown>): Backup {
  return {
    id: row.id as string,
    data: row.data as string,
    date: row.created_at,
    createdBy: (row as any).created_by as string,
  };
}

function backupToRow(b: Partial<Backup>): Record<string, unknown> {
  return {
    id: b.id,
    data: b.data,
    created_by: b.createdBy || 'system',
  };
}

export async function fetchBackups(): Promise<DbResult<Backup[]>> {
  const { data, error } = await supabase
    .from('backups')
    .select(BACKUP_SELECT)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: handleError(error) };
  return { data: (data || []).map(rowToBackup), error: null };
}

export async function getBackup(id: string): Promise<DbResult<Backup>> {
  const { data, error } = await supabase.from('backups').select(BACKUP_SELECT).eq('id', id).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToBackup(data), error: null };
}

export async function setBackup(id: string, b: Partial<Backup>): Promise<DbResult<Backup>> {
  const row = { ...backupToRow(b), id, created_at: new Date().toISOString() };
  const { data, error } = await supabase.from('backups').upsert(row).select(BACKUP_SELECT).single();
  if (error) return { data: null, error: handleError(error) };
  return { data: rowToBackup(data), error: null };
}

export async function deleteBackup(id: string): Promise<DbResult<null>> {
  const { error } = await supabase.from('backups').delete().eq('id', id);
  if (error) return { data: null, error: handleError(error) };
  return { data: null, error: null };
}

export async function pruneBackups(keep: number = 7): Promise<DbResult<null>> {
  const { data, error } = await supabase
    .from('backups')
    .select('id')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: handleError(error) };
  const ids = (data || []).slice(keep).map(r => r.id);
  if (ids.length > 0) {
    const { error: delError } = await supabase.from('backups').delete().in('id', ids);
    if (delError) return { data: null, error: handleError(delError) };
  }
  return { data: null, error: null };
}

// ─── Users (Firestore compat layer) ─────────────────────

// The user_profiles table in Supabase is the source of truth.
// These helpers read/write user_profiles for Firestore compat data.

const USER_SELECT = 'id,email,role,cliente_id';

function rowToDBUser(row: Record<string, unknown>): DBUser {
  return {
    id: row.id as string,
    uid: row.id as string,
    email: row.email as string,
    role: row.role as DBUser['role'],
    clienteId: (row as any).cliente_id as string | undefined,
  };
}

export async function fetchUsers(): Promise<DbResult<DBUser[]>> {
  const { data, error } = await supabase.from('user_profiles').select(USER_SELECT);
  if (error) return { data: null, error: handleError(error) };
  return { data: (data || []).map(rowToDBUser), error: null };
}

export async function updateUserRole(uid: string, role: string, clienteId?: string): Promise<DbResult<null>> {
  const update: Record<string, unknown> = { role };
  if (clienteId !== undefined) update.cliente_id = clienteId === '' ? null : clienteId;
  const { error } = await supabase.from('user_profiles').update(update).eq('id', uid);
  if (error) return { data: null, error: handleError(error) };
  return { data: null, error: null };
}

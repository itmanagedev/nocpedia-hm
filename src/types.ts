export interface Ativo {
  id?: string;
  clienteId: string;
  categoriaAcesso: string; // 'Servers', 'Web Applications', 'Network Assets', etc.
  nome: string;
  tipo: string;
  fabricante: string;
  modelo?: string;
  tags: string[];
  urlLogo?: string;
  ipv4Hostname?: string;
  ipv4Loopback?: string;
  ipv6Loopback?: string;
  ipv6Hostname?: string;
  urlFqdnDomain?: string;
  sshPort?: string;
  sshUser?: string;
  sshPassword?: string;
  otherPort?: string;
  otherUser?: string;
  otherPassword?: string;
  portAuxIpAddr?: string;
  popLocation?: string;
  snmpCommunity?: string;
  consolePassword?: string;
  status?: string;
  observacoes?: string;
  uid: string;
  createdAt: any;
}

export interface Cliente {
  id?: string;
  nomeFantasia: string;
  razaoSocial?: string;
  cnpj?: string;
  website?: string;
  contatoNome?: string;
  contatoTelefone?: string;
  contatoEmail?: string;
  nocNome?: string;
  nocTelefone?: string;
  nocEmail?: string;
  asn?: string;
  prefixoIPv4?: string;
  prefixoIPv6?: string;
  cep?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  endereco?: string;
  geolocalizacao?: string;
  uid: string;
  createdAt: any;
}

export interface CommandItem {
  comando: string;
  explicacao: string;
}

export interface Command {
  id?: string;
  titulo: string;
  descricao: string;
  itens: CommandItem[];
  observacoes: string;
  fabricante: string;
  categoria: string;
  subgrupo?: string;
  tags: string[];
  linkExterno?: string;
  uid: string;
  createdAt: any;
  updatedAt: any;
}

export interface DBUser {
  id?: string;
  uid: string;
  email: string;
  role: 'admin' | 'viewer' | 'cliente';
  clienteId?: string;
}

export type Fabricante = 
  "Huawei" | "Cisco" | "Juniper" | "Datacom" | "ZTE" | "Mikrotik" | "Arista" | 
  "Fiberhome" | "Furukawa" | "Hillstone" | "A10" | "DELL" |
  "VMware" | "Proxmox" |
  "Linux" | "Windows Server" | 
  "Docker" | "Kubernetes" | "Desenvolvimento";

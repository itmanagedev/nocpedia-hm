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
  
  // Network Topologia
  networkTopologyLink?: string;
  networkTopologyFileContent?: string;
  networkTopologyFileName?: string;

  // Backup de Ativos
  backupFileContent?: string;
  backupFileName?: string;
  backupFileSize?: number;

  // Upstream e Downstream / Clientes B2B
  linkType?: string; // 'Upstream' | 'Downstream'
  idCircuito?: string;
  velocidadeContratada?: string;
  enlaceIpv4?: string;
  idVlanIpv4?: string;
  enlaceIpv6?: string;
  idVlanIpv6?: string;
  multihop?: string;
  multihopIpv6?: string;
  communityBlackhole?: string;
  enderecoAbordagem?: string;
  contatoNoc?: string;
  emailNoc?: string;
  enderecoCliente?: string;
  ipv4Publico?: string;
  ipv6Publico?: string;
  pppoeUser?: string;
  pppoePassword?: string;
  lastMile?: string;
  contatoLastMile?: string;

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
  infraestrutura: {
    asn: string;
    ipv4: string;
    ipv6: string;
  }[];
  asn?: string | string[];
  prefixoIPv4?: string | string[];
  prefixoIPv6?: string | string[];
  cep?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  endereco?: string;
  geolocalizacao?: string;
  documentos?: {
    nome: string;
    tipo: string;
    content: string; // Base64 content
    size: number;
    createdAt: any;
  }[];
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
  "VMware" | "Proxmox" | "Trello" | "Web" | "Google" | "Microsoft" |
  "Linux" | "Windows Server" | 
  "Docker" | "Kubernetes" | "Desenvolvimento";

export interface Backup {
  id?: string;
  date: any; // Firestore Timestamp
  data: string; // Stringified JSON
  createdBy: string;
}

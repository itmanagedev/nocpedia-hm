import { 
  Network, 
  Server, 
  Terminal, 
  Cpu, 
  Box, 
  Code 
} from 'lucide-react';
import { Fabricante } from '../types';

export const FABRICANTES: Fabricante[] = [
  "Huawei", "Cisco", "Juniper", "Datacom", "ZTE", "Mikrotik", "Arista",
  "Fiberhome", "Furukawa", "Hillstone", "A10", "DELL",
  "VMware", "Proxmox",
  "Linux", "Windows Server", "Docker", "Kubernetes", "Desenvolvimento"
];

export const REDES_FABRICANTES = ["Huawei", "Cisco", "Juniper", "Datacom", "ZTE", "Mikrotik", "Arista", "Fiberhome", "Furukawa", "Hillstone", "A10"];
export const SERVER_FABRICANTES = ["Linux", "Windows Server", "DELL", "VMware", "Proxmox", "Docker"];

export interface FabricanteDetail {
  nome: string;
  fundacao: string;
  tempoMercado: string;
  equipamentos: string[];
  descricao: string;
  logo: string;
}

export const FABRICANTE_DETAILS: Record<string, FabricanteDetail> = {
  "Huawei": {
    nome: "Huawei",
    fundacao: "1987",
    tempoMercado: "37+ anos",
    equipamentos: ["Switches", "Roteadores", "Storage", "5G", "Servidores"],
    descricao: "Líder global em infraestrutura de TIC e dispositivos inteligentes, focada em conectividade e computação.",
    logo: "https://cdn-icons-png.flaticon.com/512/882/882636.png"
  },
  "Cisco": {
    nome: "Cisco Systems",
    fundacao: "1984",
    tempoMercado: "40+ anos",
    equipamentos: ["Switches Catalyst/Nexus", "Roteadores ISR/ASR", "Firewalls ASA/Firepower", "Wireless"],
    descricao: "Pioneira em redes, define padrões de mercado para infraestrutura corporativa e segurança.",
    logo: "https://cdn-icons-png.flaticon.com/512/16183/16183572.png"
  },
  "Juniper": {
    nome: "Juniper Networks",
    fundacao: "1996",
    tempoMercado: "28+ anos",
    equipamentos: ["Roteadores MX/PTX", "Switches EX/QFX", "Firewalls SRX"],
    descricao: "Focada em redes de alto desempenho e automação, conhecida pelo sistema operacional Junos.",
    logo: "https://www.logo.wine/a/logo/Juniper_Networks/Juniper_Networks-Logo.wine.svg"
  },
  "Datacom": {
    nome: "Datacom",
    fundacao: "1998",
    tempoMercado: "26+ anos",
    equipamentos: ["Switches Metro Ethernet", "Roteadores", "GPON", "Servidores"],
    descricao: "Empresa brasileira referência em tecnologia para operadoras e redes corporativas de alta performance.",
    logo: "https://datacom.com.br/uploads/page/e299048e4d3f9a75fece5207e1584f6c.jpg"
  },
  "ZTE": {
    nome: "ZTE Corporation",
    fundacao: "1985",
    tempoMercado: "39+ anos",
    equipamentos: ["Equipamentos Core", "Acesso Fixos/Móveis", "Terminais", "Cloud Computing"],
    descricao: "Gigante das telecomunicações focada em soluções integradas para operadoras globais.",
    logo: "https://cdn-icons-png.flaticon.com/512/882/882716.png"
  },
  "Mikrotik": {
    nome: "MikroTik",
    fundacao: "1996",
    tempoMercado: "28+ anos",
    equipamentos: ["RouterBoard", "Cloud Core Routers", "Switches CRS", "Wireless"],
    descricao: "Empresa letã famosa pelo RouterOS, oferecendo hardware e software versáteis para ISPs.",
    logo: "https://dataunique.com.br/wp-content/uploads/2024/05/512.webp"
  },
  "Arista": {
    nome: "Arista Networks",
    fundacao: "2004",
    tempoMercado: "20+ anos",
    equipamentos: ["Switches Cloud Networking", "Roteadores de Borda", "Cognitive WiFi"],
    descricao: "Especialista em soluções de rede para Data Centers e ambientes de computação em nuvem.",
    logo: "https://companieslogo.com/img/orig/ANET-b0ca505a.png?t=1720244490"
  },
  "Fiberhome": {
    nome: "Fiberhome",
    fundacao: "1999",
    tempoMercado: "25+ anos",
    equipamentos: ["OLTs", "ONUs", "Switches", "Roteadores Core"],
    descricao: "Gigante chinesa de telecomunicações, referência em redes ópticas e soluções GPON/EPON.",
    logo: "https://thalesglobal.me/wp-content/uploads/2022/05/fiberhome.png"
  },
  "Furukawa": {
    nome: "Furukawa Electric",
    fundacao: "1884",
    tempoMercado: "140+ anos",
    equipamentos: ["Cabeamento Estruturado", "Fibras Ópticas", "Equipamentos GPON"],
    descricao: "Líder em infraestrutura de rede e cabeamento, com forte presença no mercado brasileiro de fibra óptica.",
    logo: "https://s3-symbol-logo.tradingview.com/furukawa-electric-co-ltd--600.png"
  },
  "Hillstone": {
    nome: "Hillstone Networks",
    fundacao: "2006",
    tempoMercado: "18+ anos",
    equipamentos: ["Next-Generation Firewalls", "IPS", "Cloud Security"],
    descricao: "Focada em segurança cibernética e proteção de infraestrutura crítica com soluções de firewall avançadas.",
    logo: "https://nordenit.com.br/wp-content/uploads/2025/04/hillstone-networks-logo.png"
  },
  "A10": {
    nome: "A10 Networks",
    fundacao: "2004",
    tempoMercado: "20+ anos",
    equipamentos: ["Application Delivery Controllers", "DDoS Protection", "CGNAT"],
    descricao: "Especialista em segurança de aplicações e balanceamento de carga de alta performance.",
    logo: "https://cdn.cookielaw.org/logos/b54aff14-9d34-4d9f-8514-c71a8f62b8d2/b0ee5e60-7e32-4cc1-bd9e-59f3dfe061ae/aeb9de86-a0e2-4de6-9b33-4de099d6fe02/A10-NewLogos-Blue-NoReg-CMYK.png"
  },
  "DELL": {
    nome: "Dell Technologies",
    fundacao: "1984",
    tempoMercado: "40+ anos",
    equipamentos: ["Servidores PowerEdge", "Storage PowerStore", "Switches Networking"],
    descricao: "Uma das maiores empresas de tecnologia do mundo, líder em servidores e infraestrutura de TI.",
    logo: "https://cdn-icons-png.flaticon.com/512/882/882726.png"
  },
  "VMware": {
    nome: "VMware",
    fundacao: "1998",
    tempoMercado: "26+ anos",
    equipamentos: ["vSphere", "vCenter", "NSX", "vSAN"],
    descricao: "Líder global em virtualização e infraestrutura de nuvem, pioneira na tecnologia x86.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Vmware_workstation_16_icon.svg/1280px-Vmware_workstation_16_icon.svg.png"
  },
  "Proxmox": {
    nome: "Proxmox Server Solutions",
    fundacao: "2005",
    tempoMercado: "19+ anos",
    equipamentos: ["Proxmox VE", "Backup Server", "Mail Gateway"],
    descricao: "Plataforma de virtualização de código aberto baseada em Debian, focada em KVM e LXC.",
    logo: "https://www.blackrack.eu/wp-content/uploads/2025/08/proxmox_Logo.png"
  },
  "Linux": {
    nome: "Linux",
    fundacao: "1991",
    tempoMercado: "33+ anos",
    equipamentos: ["Servidores Web", "Cloud", "Sistemas Embarcados", "Supercomputadores"],
    descricao: "Kernel de código aberto que sustenta a maior parte da infraestrutura de internet e nuvem moderna.",
    logo: "https://cdn-icons-png.flaticon.com/512/2333/2333464.png"
  },
  "Windows Server": {
    nome: "Microsoft Windows Server",
    fundacao: "2003 (Primeira versão)",
    tempoMercado: "21+ anos",
    equipamentos: ["Active Directory", "Hyper-V", "Servidores de Arquivos", "Azure Stack"],
    descricao: "Sistema operacional de servidor da Microsoft, focado em gestão corporativa e serviços de diretório.",
    logo: "https://img.icons8.com/color/1200/windows-10.jpg"
  },
  "Docker": {
    nome: "Docker",
    fundacao: "2013",
    tempoMercado: "11+ anos",
    equipamentos: ["Docker Engine", "Docker Desktop", "Docker Hub", "Docker Swarm"],
    descricao: "Plataforma que revolucionou o desenvolvimento ao permitir o empacotamento de apps em containers.",
    logo: "https://cdn-icons-png.flaticon.com/512/919/919853.png"
  },
  "Kubernetes": {
    nome: "Kubernetes (K8s)",
    fundacao: "2014",
    tempoMercado: "10+ anos",
    equipamentos: ["Cluster Management", "Auto-scaling", "Service Discovery", "Load Balancing"],
    descricao: "Orquestrador de containers de código aberto, originalmente desenvolvido pelo Google.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/3840px-Kubernetes_logo_without_workmark.svg.png"
  }
};

export const CATEGORIAS = [
  "Admin", "Automation", "Backup", "BGP", "Cloud", "Container", "Containers", "Database", "DevOps", "GPON", 
  "Gerência", "Hardware", "Interface", "LINHA C3XX", "LINHA TITAN C6XX", "MPLS", "Monitoring", "OLT", 
  "ROUTER", "Routing", "SWITCH", "Security", "Sistema", "Switching", "Troubleshooting", "VLAN", "Virtualization"
].sort();

export const CATEGORIA_DETAILS: Record<string, string> = {
  "BGP": "Protocolo de Gateway de Borda (Border Gateway Protocol) usado para troca de informações de roteamento entre sistemas autônomos na Internet.",
  "VLAN": "Virtual Local Area Network (VLAN) é uma tecnologia que segmenta redes locais em grupos de trabalho virtuais independentes.",
  "MPLS": "Multiprotocol Label Switching é uma tecnologia de transporte de dados que encaminha pacotes baseando-se em rótulos, aumentando a eficiência e velocidade da rede.",
  "Sistema": "Comandos e configurações relacionados ao sistema operacional e gerenciamento básico do equipamento.",
  "Interface": "Configurações de portas físicas e lógicas, como Ethernet, SFP e agregação de links (LACP).",
  "Routing": "Protocolos e configurações de roteamento estático e dinâmico (OSPF, RIP, IS-IS).",
  "Switching": "Tecnologias de camada 2, incluindo Spanning Tree (STP), empilhamento e controle de broadcast.",
  "Security": "Regras de firewall, listas de controle de acesso (ACLs) e proteção contra ataques de rede.",
  "DevOps": "Práticas e ferramentas que integram desenvolvimento e operações para automação e entrega contínua.",
  "Database": "Comandos para gerenciamento, consulta e manutenção de bancos de dados relacionais e NoSQL.",
  "OLT": "Optical Line Terminal, equipamento central em redes ópticas passivas (PON) que gerencia a comunicação com os clientes.",
  "GPON": "Gigabit Passive Optical Network, tecnologia de fibra óptica ponto-multiponto para entrega de serviços de banda larga.",
  "Monitoring": "Protocolos e ferramentas para monitoramento de performance, disponibilidade e saúde dos ativos (SNMP, Syslog).",
  "Hardware": "Informações sobre componentes físicos, diagnósticos de sensores, fontes e temperatura do chassi.",
  "Virtualization": "Tecnologias de abstração de hardware para execução de múltiplas máquinas virtuais em um único servidor físico.",
  "Container": "Empacotamento de aplicações e suas dependências em unidades isoladas para execução consistente em diferentes ambientes.",
  "Automation": "Uso de scripts e ferramentas (Ansible, Python) para automatizar tarefas repetitivas de configuração e gestão.",
  "Troubleshooting": "Procedimentos e comandos de diagnóstico para identificação e resolução de falhas técnicas.",
  "Backup": "Estratégias e comandos para cópia de segurança de configurações e dados críticos para recuperação de desastres.",
  "Cloud": "Infraestrutura e serviços computacionais entregues sob demanda através da internet ou redes privadas.",
  "Admin": "Tarefas administrativas de alto nível, gestão de usuários e permissões do sistema.",
  "Gerência": "Configurações de protocolos de gerenciamento e acesso remoto (SSH, Telnet, NETCONF).",
  "Containers": "Orquestração e gestão de múltiplos containers em ambientes de produção.",
  "ROUTER": "Configurações específicas para equipamentos de roteamento de borda e core.",
  "SWITCH": "Configurações específicas para switches de acesso, agregação e core.",
  "LINHA C3XX": "Documentação específica para a linha de equipamentos ZTE C300/C320.",
  "LINHA TITAN C6XX": "Documentação específica para a nova geração de equipamentos ZTE Titan C600."
};

export const GROUPS = {
  Redes: {
    icon: Network,
    label: 'Redes',
    description: 'Redes de computadores são o conjunto de tecnologias responsáveis por interligar dispositivos (switches, roteadores, servidores, clientes) para permitir comunicação e troca de dados.',
    fabricantes: REDES_FABRICANTES,
    envolvem: [
      'Endereçamento IP (IPv4/IPv6)',
      'Protocolos (TCP/IP, BGP, OSPF, VLANs)',
      'Equipamentos (switches, roteadores, firewalls)',
      'Controle de tráfego, segurança e disponibilidade'
    ],
    objetivo: 'Garantir que os dados saiam de um ponto e cheguem ao destino com eficiência, segurança e baixa latência.'
  },
  Server: {
    icon: Server,
    label: 'Servidores',
    description: 'Servidores são sistemas (físicos ou virtuais) responsáveis por fornecer serviços, recursos ou aplicações para outros dispositivos na rede.',
    fabricantes: SERVER_FABRICANTES,
    envolvem: [
      'Aplicações (web, APIs, sistemas internos)',
      'Armazenamento (arquivos, backups)',
      'Serviços de rede (DNS, DHCP, autenticação)',
      'Containers e virtualização'
    ],
    objetivo: 'Centralizar processamento e disponibilizar serviços de forma estável, escalável e controlada.'
  }
};

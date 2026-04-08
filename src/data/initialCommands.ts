import { serverTimestamp, FieldValue } from 'firebase/firestore';
import { Command, Fabricante } from '../types';

export interface InitialCommand extends Omit<Command, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export const getInitialCommands = (uid: string): InitialCommand[] => [
  {
    titulo: "Utilitários de Rede (Genérico)",
    descricao: "Comandos básicos de teste de conectividade e diagnóstico.",
    itens: [
      {
        comando: "ping 8.8.8.8",
        explicacao: "Testa a conectividade básica com um host remoto via ICMP."
      },
      {
        comando: "traceroute 8.8.8.8",
        explicacao: "Rastreia o caminho dos pacotes até o destino (Linux/Cisco/Huawei)."
      },
      {
        comando: "telnet 192.168.0.1 80",
        explicacao: "Testa se uma porta específica está aberta em um host remoto."
      }
    ],
    observacoes: "No Windows, use 'tracert' em vez de 'traceroute'.",
    fabricante: "Linux",
    categoria: "Sistema",
    tags: ["network", "ping", "traceroute", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Comandos de Rede Windows",
    descricao: "Comandos essenciais para diagnóstico de rede no Windows CMD/PowerShell.",
    itens: [
      {
        comando: "ipconfig /all",
        explicacao: "Exibe todas as configurações de rede detalhadas de todas as interfaces."
      },
      {
        comando: "nslookup google.com",
        explicacao: "Consulta registros de DNS para um domínio."
      },
      {
        comando: "netstat -ano",
        explicacao: "Exibe todas as conexões ativas e portas em escuta com o PID do processo."
      }
    ],
    observacoes: "Execute o CMD como Administrador para ver detalhes de todos os processos no netstat.",
    fabricante: "Linux",
    categoria: "Sistema",
    tags: ["windows", "network", "ipconfig", "dns"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Comandos Essenciais Docker",
    descricao: "Gerenciamento básico de containers e imagens Docker.",
    itens: [
      {
        comando: "docker ps -a",
        explicacao: "Lista todos os containers (ativos e inativos)."
      },
      {
        comando: "docker images",
        explicacao: "Lista todas as imagens baixadas localmente."
      },
      {
        comando: "docker run -d --name meu-app nginx",
        explicacao: "Cria e inicia um container em background (-d) com o nome 'meu-app' usando a imagem nginx."
      },
      {
        comando: "docker exec -it meu-app bash",
        explicacao: "Acessa o terminal interativo de um container em execução."
      },
      {
        comando: "docker logs -f meu-app",
        explicacao: "Visualiza os logs de um container em tempo real."
      }
    ],
    observacoes: "Containers Docker permitem isolamento de aplicações e facilidade de deploy.",
    fabricante: "Docker",
    categoria: "Containers",
    tags: ["docker", "containers", "devops"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Administração de Sistema Linux",
    descricao: "Comandos essenciais para monitoramento e gestão de servidores Linux.",
    itens: [
      {
        comando: "htop",
        explicacao: "Monitor interativo de processos e recursos do sistema (CPU, RAM)."
      },
      {
        comando: "df -h",
        explicacao: "Exibe o uso de espaço em disco em formato legível (human-readable)."
      },
      {
        comando: "free -h",
        explicacao: "Mostra a quantidade de memória livre e usada no sistema."
      },
      {
        comando: "systemctl status nginx",
        explicacao: "Verifica o status de um serviço (ex: nginx) via systemd."
      },
      {
        comando: "ss -tuln",
        explicacao: "Lista todas as portas TCP/UDP em estado de escuta (listening)."
      }
    ],
    observacoes: "O domínio destes comandos é fundamental para qualquer administrador de sistemas.",
    fabricante: "Linux",
    categoria: "Admin",
    tags: ["linux", "admin", "sysadmin", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Login e Gerência Inicial (DmOS)",
    descricao: "Credenciais padrão e acesso via porta MGMT.",
    itens: [
      {
        comando: "login: admin\npassword: admin",
        explicacao: "Usuário e senha padrão de fábrica para o primeiro acesso."
      },
      {
        comando: "IP MGMT: 192.168.0.25/24",
        explicacao: "Endereço IP padrão da porta de gerência out-of-band."
      }
    ],
    observacoes: "É altamente recomendado alterar a senha padrão no primeiro acesso por razões de segurança.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "login", "management", "mgmt"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Monitoramento de Recursos (DmOS)",
    descricao: "Comandos para verificar o uso de CPU, Memória e Uptime.",
    itens: [
      {
        comando: "show system cpu",
        explicacao: "Exibe a utilização da CPU do equipamento."
      },
      {
        comando: "show system memory",
        explicacao: "Exibe o uso da memória RAM do sistema."
      },
      {
        comando: "show system uptime",
        explicacao: "Apresenta o tempo total que o equipamento está ligado."
      }
    ],
    observacoes: "Útil para monitorar a saúde do hardware em tempo real.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Sistema",
    tags: ["datacom", "cpu", "memory", "uptime"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de SNTP (DmOS)",
    descricao: "Sincronização do relógio do sistema com um servidor externo.",
    itens: [
      {
        comando: "config\nsntp client\nsntp server 172.24.22.201",
        explicacao: "Habilita o cliente SNTP e define o servidor de sincronização."
      }
    ],
    observacoes: "A sincronização de tempo é vital para a precisão dos logs e eventos.",
    fabricante: "Datacom",
    categoria: "Gerência",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "sntp", "time", "sync"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de Syslog Remoto (DmOS)",
    descricao: "Envio de logs de eventos para um servidor externo.",
    itens: [
      {
        comando: "config\nlog syslog 10.1.100.7",
        explicacao: "Configura o endereço do servidor syslog remoto."
      }
    ],
    observacoes: "Permite a centralização de logs para auditoria e troubleshooting.",
    fabricante: "Datacom",
    categoria: "Gerência",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "syslog", "logging", "remote"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Habilitar LLDP (DmOS)",
    descricao: "Protocolo para descoberta de vizinhos diretamente conectados.",
    itens: [
      {
        comando: "lldp\ninterface gigabit-ethernet 1/1/1\nadmin-status tx-and-rx\nnotification",
        explicacao: "Habilita o LLDP na interface especificada para envio e recebimento."
      }
    ],
    observacoes: "Use 'show lldp brief' para visualizar os vizinhos encontrados.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Sistema",
    tags: ["datacom", "lldp", "discovery", "network"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Controle Administrativo de Interface (DmOS)",
    descricao: "Comandos para ativar ou desativar interfaces físicas.",
    itens: [
      {
        comando: "config\ninterface gigabit-ethernet 1/1/1\nshutdown",
        explicacao: "Desativa administrativamente a interface."
      },
      {
        comando: "config\ninterface gigabit-ethernet 1/1/1\nno shutdown",
        explicacao: "Reativa a interface."
      }
    ],
    observacoes: "O status 'Admin Down' indica que a porta foi desativada manualmente.",
    fabricante: "Datacom",
    categoria: "Interface",
    subgrupo: "Interfaces",
    tags: ["datacom", "interface", "shutdown", "admin"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Balanceamento de Carga Dinâmico em LAG (DmOS)",
    descricao: "Configuração de balanceamento dinâmico para agregação de links.",
    itens: [
      {
        comando: "config\nlink-aggregation load-balance dynamic",
        explicacao: "Habilita a distribuição de carga uniforme entre os membros do LAG."
      }
    ],
    observacoes: "O modo dynamic move fluxos de membros sobrecarregados para membros com menor carga.",
    fabricante: "Datacom",
    categoria: "Switching",
    subgrupo: "Switching",
    tags: ["datacom", "lag", "load-balance", "dynamic"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Método de Autenticação de ONU (GPON DmOS)",
    descricao: "Configuração global do método de autenticação para ONUs.",
    itens: [
      {
        comando: "config\ngpon 1/1\nonu-auth-method password",
        explicacao: "Define a autenticação via senha para todas as ONUs da interface GPON."
      }
    ],
    observacoes: "Os métodos disponíveis são serial-number, password-only e serial-number-and-password.",
    fabricante: "Datacom",
    categoria: "GPON",
    subgrupo: "GPON",
    tags: ["datacom", "gpon", "onu", "auth"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Carregar Perfis GPON Padrão (DmOS)",
    descricao: "Comando para popular rapidamente a base de perfis GPON (Bridge/Router).",
    itens: [
      {
        comando: "config\nload default-gpon-profiles",
        explicacao: "Carrega os perfis de banda, linha e mídia padrão do sistema."
      }
    ],
    observacoes: "Agiliza o provisionamento inicial de novos serviços GPON.",
    fabricante: "Datacom",
    categoria: "GPON",
    subgrupo: "GPON",
    tags: ["datacom", "gpon", "profiles", "default"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Roteamento Estático IPv6 (DmOS)",
    descricao: "Configuração de rotas estáticas para o protocolo IPv6.",
    itens: [
      {
        comando: "config\nrouter static\naddress-family ipv6\n::/0 next-hop 2001:db8:2::2",
        explicacao: "Configura uma rota padrão IPv6 apontando para o gateway especificado."
      }
    ],
    observacoes: "Certifique-se de que a interface de saída tenha o IPv6 habilitado.",
    fabricante: "Datacom",
    categoria: "Routing",
    subgrupo: "Roteamento",
    tags: ["datacom", "routing", "ipv6", "static"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "OSPF Ponto-a-Ponto (DmOS)",
    descricao: "Configuração básica de adjacência OSPF em rede ponto-a-ponto.",
    itens: [
      {
        comando: "config\nrouter ospf 1\nrouter-id 10.10.10.10\narea 0\ninterface l3-OSPF\nnetwork-type point-to-point",
        explicacao: "Configura o processo OSPF, define o router-id e a interface na área 0."
      }
    ],
    observacoes: "O modo ponto-a-ponto evita a eleição de DR/BDR, acelerando a convergência.",
    fabricante: "Datacom",
    categoria: "Routing",
    subgrupo: "Roteamento",
    tags: ["datacom", "ospf", "routing", "dynamic"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Sessão eBGP IPv4 (DmOS)",
    descricao: "Configuração de vizinhança BGP externa.",
    itens: [
      {
        comando: "config\nrouter bgp 20000\nrouter-id 10.10.10.10\naddress-family ipv4 unicast\n!\nneighbor 192.168.20.2\nremote-as 40000\naddress-family ipv4 unicast",
        explicacao: "Habilita o BGP, define o AS local e configura o neighbor remoto."
      }
    ],
    observacoes: "Sempre verifique o estado da sessão com 'show ip bgp summary'.",
    fabricante: "Datacom",
    categoria: "Routing",
    subgrupo: "Roteamento",
    tags: ["datacom", "bgp", "routing", "ebgp"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de Interface L3 (DmOS)",
    descricao: "Atribuição de endereço IP em uma interface de camada 3.",
    itens: [
      {
        comando: "config\ninterface l3-VLAN100\nipv4 address 10.100.1.1/24",
        explicacao: "Configura o endereço IPv4 na interface lógica L3 associada à VLAN 100."
      }
    ],
    observacoes: "A interface L3 deve ser criada previamente e associada a uma VLAN ou porta física.",
    fabricante: "Datacom",
    categoria: "Routing",
    subgrupo: "Interfaces",
    tags: ["datacom", "l3", "ip", "interface"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de DHCP Relay (DmOS)",
    descricao: "Encaminhamento de requisições DHCP para um servidor central.",
    itens: [
      {
        comando: "config\ndhcp-relay\nserver 10.0.0.50\ninterface l3-VLAN100\nrelay enable",
        explicacao: "Habilita o relay DHCP na interface L3 e define o servidor de destino."
      }
    ],
    observacoes: "Essencial para redes onde o servidor DHCP não está no mesmo segmento de broadcast.",
    fabricante: "Datacom",
    categoria: "Gerência",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "dhcp", "relay", "management"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Visualizar Tabela ARP (DmOS)",
    descricao: "Exibe o mapeamento entre endereços IP e endereços MAC.",
    itens: [
      {
        comando: "show ip arp",
        explicacao: "Mostra todas as entradas aprendidas na tabela ARP."
      }
    ],
    observacoes: "Útil para verificar a resolução de endereços na camada 2/3.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Sistema",
    tags: ["datacom", "arp", "troubleshooting", "ip"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de Banner MOTD (DmOS)",
    descricao: "Mensagem exibida no momento do login no equipamento.",
    itens: [
      {
        comando: "config\nbanner motd \"Acesso Restrito - Apenas Pessoal Autorizado\"",
        explicacao: "Define a mensagem do dia (Message of the Day)."
      }
    ],
    observacoes: "Importante para conformidade de segurança e avisos legais.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "banner", "motd", "security"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Tempo de Aging da Tabela MAC (DmOS)",
    descricao: "Ajuste do tempo de expiração dos endereços MAC aprendidos.",
    itens: [
      {
        comando: "config\nmac-address-table aging-time 300",
        explicacao: "Altera o tempo de aging para 300 segundos (padrão é 600)."
      }
    ],
    observacoes: "Tempos menores limpam a tabela mais rápido, mas podem aumentar o flooding se o tráfego for intermitente.",
    fabricante: "Datacom",
    categoria: "Switching",
    subgrupo: "Switching",
    tags: ["datacom", "mac", "switching", "aging"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de Backup-Link (DmOS)",
    descricao: "Redundância de interface (Active/Backup) para evitar perda de pacotes.",
    itens: [
      {
        comando: "config\nbackup-link 1\nmain ten-gigabit-ethernet-1/1/1\nbackup ten-gigabit-ethernet-1/1/2",
        explicacao: "Define a interface principal e a de reserva no grupo de backup 1."
      }
    ],
    observacoes: "A interface backup assume o tráfego automaticamente em caso de falha na principal.",
    fabricante: "Datacom",
    categoria: "Switching",
    subgrupo: "Switching",
    tags: ["datacom", "redundancy", "backup-link", "switching"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Informações do Sistema (DmOS)",
    descricao: "Comandos básicos para verificar o status do equipamento Datacom.",
    itens: [
      {
        comando: "show platform",
        explicacao: "Apresenta o modelo do equipamento, módulos e firmware em uso."
      },
      {
        comando: "show inventory",
        explicacao: "Apresenta o inventário do equipamento, módulos e interfaces em uso."
      },
      {
        comando: "show firmware",
        explicacao: "Apresenta a versão de firmware ativa e inativa."
      }
    ],
    observacoes: "O DmOS possui duas posições de memória para firmware (Active/Inactive).",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Sistema",
    tags: ["datacom", "dmos", "system", "inventory"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de VLAN (DmOS)",
    descricao: "Criação e associação de VLANs em interfaces no DmOS.",
    itens: [
      {
        comando: "config\ndot1q vlan 100\ninterface gigabit-ethernet 1/1/1 tagged",
        explicacao: "Cria la VLAN 100 e a associa como tagged na interface 1/1/1."
      },
      {
        comando: "interface gigabit-ethernet 1/1/2 untagged\n!\nswitchport\ninterface gigabit-ethernet 1/1/2\nnative-vlan vlan-id 100",
        explicacao: "Configura a interface 1/1/2 como untagged na VLAN 100."
      }
    ],
    observacoes: "O comando 'commit' é necessário para aplicar as alterações da configuração candidata para a configuração corrente.",
    fabricante: "Datacom",
    categoria: "Switching",
    subgrupo: "Switching",
    tags: ["datacom", "vlan", "switching", "dmos"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Roteamento Estático IPv4 (DmOS)",
    descricao: "Configuração de rotas estáticas no DmOS.",
    itens: [
      {
        comando: "config\nrouter static\naddress-family ipv4\n0.0.0.0/0 next-hop 10.10.0.2",
        explicacao: "Configura uma rota padrão (default route) apontando para o next-hop 10.10.0.2."
      }
    ],
    observacoes: "Sempre verifique a conectividade com o next-hop antes de aplicar a rota.",
    fabricante: "Datacom",
    categoria: "Routing",
    subgrupo: "Roteamento",
    tags: ["datacom", "routing", "static", "ipv4"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Provisionamento de ONU (GPON DmOS)",
    descricao: "Comandos para descobrir e provisionar ONUs em OLTs Datacom.",
    itens: [
      {
        comando: "show interface gpon discovered-onus",
        explicacao: "Lista todas as ONUs conectadas que ainda não foram provisionadas."
      },
      {
        comando: "config\ninterface gpon 1/1/1\nonu 1\nserial-number DACM00001B30\nline-profile PERFIL-CLIENTE",
        explicacao: "Provisiona a ONU no slot/porta 1/1/1 com o ID 1 e o Serial Number especificado."
      }
    ],
    observacoes: "É necessário ter um line-profile configurado previamente.",
    fabricante: "Datacom",
    categoria: "GPON",
    subgrupo: "GPON",
    tags: ["datacom", "gpon", "olt", "onu", "provisioning"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Gerenciamento de Configuração (Commit/Rollback)",
    descricao: "Comandos essenciais para manipulação da configuração no DmOS.",
    itens: [
      {
        comando: "commit",
        explicacao: "Aplica as alterações feitas na configuração candidata."
      },
      {
        comando: "show configuration diff",
        explicacao: "Exibe a diferença entre a configuração candidata e a configuração corrente."
      },
      {
        comando: "rollback configuration",
        explicacao: "Reverte a configuração candidata para o estado da última configuração salva."
      }
    ],
    observacoes: "O DmOS utiliza o protocolo NETCONF para gerenciamento de configuração.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "config", "commit", "rollback"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configurar ACL (Cisco)",
    descricao: "Configuração de Listas de Controle de Acesso (ACL) em roteadores Cisco.",
    itens: [
      {
        comando: "access-list 10 permit 192.168.1.0 0.0.0.255",
        explicacao: "Cria uma ACL padrão (1-99) permitindo o tráfego da rede 192.168.1.0/24."
      },
      {
        comando: "interface GigabitEthernet0/0\nip access-group 10 in",
        explicacao: "Aplica a ACL 10 na interface GigabitEthernet0/0 para tráfego de entrada."
      }
    ],
    observacoes: "ACLs padrão filtram apenas pelo endereço de origem. Para filtros mais complexos (porta, protocolo, destino), utilize ACLs estendidas (100-199). Lembre-se do 'deny any' implícito ao final de cada ACL.",
    fabricante: "Cisco",
    categoria: "Security",
    tags: ["cisco", "acl", "security", "firewall"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de LACP (Link Aggregation)",
    descricao: "Configuração de agregação de links dinâmica usando LACP.",
    itens: [
      {
        comando: "config\nlink-aggregation interface lag 1\nmode active\ninterface gigabit-ethernet 1/1/1\ninterface gigabit-ethernet 1/1/2",
        explicacao: "Cria o LAG 1 em modo ativo e adiciona as interfaces 1/1/1 e 1/1/2."
      }
    ],
    observacoes: "O LACP garante que os links sejam agregados apenas se a configuração for consistente em ambos os lados.",
    fabricante: "Datacom",
    categoria: "Switching",
    subgrupo: "Switching",
    tags: ["datacom", "lacp", "lag", "etherchannel"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Atualização de Software (DmOS)",
    descricao: "Procedimento para baixar e ativar um novo firmware.",
    itens: [
      {
        comando: "request firmware add tftp://192.168.0.1/build.swu",
        explicacao: "Baixa o arquivo de firmware do servidor TFTP especificado."
      },
      {
        comando: "request firmware activate",
        explicacao: "Ativa o firmware que está na posição Inactive. O equipamento irá reinicializar."
      }
    ],
    observacoes: "Use 'show firmware' para verificar o status das imagens antes e depois da ativação.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "firmware", "update", "upgrade"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de SNMPv2 (DmOS)",
    descricao: "Habilitação do agente SNMPv2 para monitoramento.",
    itens: [
      {
        comando: "config\nsnmp agent enabled\nsnmp agent version v2c\nsnmp community datacom sec-name datacom",
        explicacao: "Habilita o SNMPv2 e define a comunidade 'datacom'."
      }
    ],
    observacoes: "Lembre-se de configurar as views e grupos de acesso (VACM) para permitir a leitura dos objetos.",
    fabricante: "Datacom",
    categoria: "Gerência",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "snmp", "management", "monitoring"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Monitoramento de Interfaces (DmOS)",
    descricao: "Comandos para verificar o status e estatísticas das interfaces.",
    itens: [
      {
        comando: "show interface brief",
        explicacao: "Exibe o status (up/down), velocidade e duplex de todas as interfaces."
      },
      {
        comando: "show interface port 1/1/1",
        explicacao: "Mostra detalhes específicos da interface 1/1/1, incluindo contadores de erro."
      },
      {
        comando: "show interface transceiver",
        explicacao: "Exibe informações do módulo SFP/SFP+ (potência óptica, temperatura, etc)."
      }
    ],
    observacoes: "Sempre monitore a potência óptica (RX Power) para evitar problemas de camada física.",
    fabricante: "Datacom",
    categoria: "Interface",
    subgrupo: "Interfaces",
    tags: ["datacom", "interface", "sfp", "monitoring"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Troubleshooting de Rede (DmOS)",
    descricao: "Comandos para diagnóstico de conectividade e vizinhança.",
    itens: [
      {
        comando: "show mac-address-table",
        explicacao: "Lista os endereços MAC aprendidos em cada interface e VLAN."
      },
      {
        comando: "show lldp neighbors",
        explicacao: "Exibe os equipamentos vizinhos conectados via protocolo LLDP."
      },
      {
        comando: "show log",
        explicacao: "Mostra o histórico de eventos e logs do sistema."
      }
    ],
    observacoes: "O LLDP é essencial para mapear a topologia física da rede.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Sistema",
    tags: ["datacom", "troubleshooting", "lldp", "mac", "logs"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Verificar Placas (Huawei OLT)",
    descricao: "Verifica o status das placas na OLT Huawei.",
    itens: [{
      comando: "display board 0",
      explicacao: "Exibe o status de todas as placas instaladas no subrack 0, incluindo o tipo da placa, status operacional e alarmes."
    }],
    observacoes: "O status 'Normal' indica que a placa está operando corretamente. O status 'Failed' ou 'Offline' sugere problemas físicos, de firmware ou falta de alimentação. Utilize `display board 0/x` para detalhes de uma placa específica (onde x é o slot).",
    fabricante: "Huawei",
    categoria: "OLT",
    subgrupo: "Hardware",
    tags: ["huawei", "olt", "board", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Criar VLAN (Huawei)",
    descricao: "Cria uma VLAN no switch Huawei.",
    itens: [{
      comando: "system-view\nvlan 100",
      explicacao: "Entra no modo de configuração e cria la VLAN 100."
    }],
    observacoes: "Necessário aplicar em interfaces posteriormente.",
    fabricante: "Huawei",
    categoria: "SWITCH",
    subgrupo: "VLAN",
    tags: ["vlan", "switching"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Criar VLAN (Cisco)",
    descricao: "Criação de VLAN em switches Cisco.",
    itens: [{
      comando: "conf t\nvlan 100",
      explicacao: "Cria VLAN no banco de VLANs."
    }],
    observacoes: "Pode ser necessário salvar com write memory.",
    fabricante: "Cisco",
    categoria: "VLAN",
    tags: ["vlan", "switching"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Ver tabela de rotas (Linux)",
    descricao: "Exibe rotas no Linux.",
    itens: [{
      comando: "ip route show",
      explicacao: "Lista todas as rotas da tabela."
    }],
    observacoes: "Substitui o comando antigo 'route -n'.",
    fabricante: "Linux",
    categoria: "Routing",
    tags: ["routing", "network"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Visualizar Logs do Sistema (journalctl)",
    descricao: "Consulta e visualização de logs do systemd.",
    itens: [{
      comando: "journalctl",
      explicacao: "O comando journalctl é a ferramenta principal para consultar os logs coletados pelo systemd-journald. Ele permite visualizar logs de boot, serviços específicos e mensagens do kernel de forma centralizada."
    }],
    observacoes: "Monitorar logs é fundamental para o troubleshooting, auditoria de segurança e monitoramento de performance. O parâmetro '-f' permite acompanhar os logs em tempo real (follow).",
    fabricante: "Linux",
    categoria: "Sistema",
    tags: ["linux", "logs", "systemd", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Ver vizinhos BGP (Huawei)",
    descricao: "Ver vizinhos BGP",
    itens: [{
      comando: "display bgp peer",
      explicacao: "Exibe o status dos peers BGP configurados."
    }],
    observacoes: "Verificar se o estado está como 'Established'.",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["bgp", "routing"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Ver interfaces IP (Cisco)",
    descricao: "Exibe um resumo das interfaces IP.",
    itens: [{
      comando: "show ip interface brief",
      explicacao: "Mostra o status (up/down) e o endereço IP de todas as interfaces."
    }],
    observacoes: "Útil para troubleshooting rápido de conectividade física e lógica.\n\n### Comparação com Huawei\nO equivalente no Huawei é o comando `display ip interface description`. \n\n**Principais Diferenças:**\n- **Cisco (`show ip interface brief`):** Foca no endereço IP e status (OK?, Method, Status, Protocol). É ideal para verificar rapidamente se uma interface tem IP e se está 'up/up'.\n- **Huawei (`display ip interface description`):** Além do status físico e do protocolo, exibe a **descrição** da interface, o que é crucial em ambientes com muitas conexões identificadas.\n\n**Casos de Uso:**\n- Use o comando Cisco para validar endereçamento e conectividade básica.\n- Use o comando Huawei quando precisar identificar a função da interface através da descrição configurada.",
    fabricante: "Cisco",
    categoria: "Interface",
    tags: ["cisco", "interface", "ip"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Descrição de Interfaces IP (Huawei)",
    descricao: "Exibe a descrição das interfaces IP.",
    itens: [{
      comando: "display ip interface description",
      explicacao: "Mostra o status e a descrição configurada em cada interface IP."
    }],
    observacoes: "Comando abreviado: dis ip in des",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["huawei", "interface", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração Completa da Porta (Huawei)",
    descricao: "Exibe todas as configurações da interface, incluindo valores default.",
    itens: [{
      comando: "display this include-default",
      explicacao: "Mostra a configuração atual da interface onde o usuário está logado, incluindo parâmetros que não foram alterados manualmente."
    }],
    observacoes: "Útil para verificar timers e parâmetros implícitos.",
    fabricante: "Huawei",
    categoria: "SWITCH",
    tags: ["huawei", "config", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "TROUBLESHOOT OSPF (Huawei)",
    descricao: "Comandos essenciais para troubleshooting de OSPF em equipamentos Huawei.",
    itens: [
      {
        comando: "display ospf peer brief",
        explicacao: "Exibe um resumo das adjacências OSPF formadas no equipamento. Mostra o ID do vizinho, interface e o estado da adjacência (Full, 2-Way, etc)."
      },
      {
        comando: "display ospf peer",
        explicacao: "Exibe informações detalhadas das adjacências OSPF. Mostra timers, DR/BDR, e detalhes da interface do vizinho OSPF."
      },
      {
        comando: "display ip routing-table protocol ospf",
        explicacao: "Exibe a tabela de rotas aprendidas via OSPF. Filtra a tabela de roteamento global para exibir apenas as entradas geradas pelo OSPF."
      }
    ],
    observacoes: "Útil para validar se as redes remotas estão sendo recebidas e se as adjacências estão estáveis.",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["huawei", "ospf", "routing", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Informações de Peer VSI (Huawei)",
    descricao: "Exibe informações de vizinhos VSI (L2VPN).",
    itens: [{
      comando: "display vsi peer-info",
      explicacao: "Mostra o status das sessões VSI para serviços de camada 2 (VPLS)."
    }],
    observacoes: "Comando abreviado: dis vsi peer-info",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["huawei", "mpls", "vsi", "l2vpn", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Sessões MPLS LDP (Huawei)",
    descricao: "Exibe o status das sessões LDP.",
    itens: [{
      comando: "display mpls ldp session",
      explicacao: "Verifica se a sessão LDP com o vizinho está no estado 'Operational'."
    }],
    observacoes: "Comando abreviado: dis mpls ldp session",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["huawei", "mpls", "ldp", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Adjacências MPLS LDP (Huawei)",
    descricao: "Exibe as adjacências LDP (Hello).",
    itens: [{
      comando: "display mpls ldp adjacency",
      explicacao: "Mostra os vizinhos que estão enviando pacotes Hello LDP."
    }],
    observacoes: "Comando abreviado: dis mpls ldp adjacency",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["huawei", "mpls", "ldp", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Resumo de MPLS L2VC (Huawei)",
    descricao: "Exibe um resumo dos circuitos virtuais de camada 2.",
    itens: [{
      comando: "display mpls l2vc brief",
      explicacao: "Mostra o status (UP/DOWN) dos túneis L2VPN (PWE3)."
    }],
    observacoes: "Comando abreviado: dis mpls l2vc brief",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["huawei", "mpls", "l2vc", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Detalhes de MPLS L2VC por ID (Huawei)",
    descricao: "Exibe detalhes de um L2VC específico.",
    itens: [{
      comando: "display mpls l2vc",
      explicacao: "Mostra informações detalhadas de um circuito virtual, incluindo labels e MTU."
    }],
    observacoes: "Substitua pelo ID da VLAN ou VC ID desejado.",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["huawei", "mpls", "l2vc", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Vizinhos LLDP em Interface (Huawei)",
    descricao: "Exibe informações de vizinhos LLDP em uma interface específica.",
    itens: [{
      comando: "display lldp neighbor interface",
      explicacao: "Mostra detalhes do equipamento conectado na ponta oposta do cabo (Hostname, Porta, IP)."
    }],
    observacoes: "Comando abreviado: dis lldp neighbor int ...",
    fabricante: "Huawei",
    categoria: "SWITCH",
    tags: ["huawei", "lldp", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Detalhes BGP Peer (Huawei)",
    descricao: "Exibe informações detalhadas dos vizinhos BGP.",
    itens: [{
      comando: "display bgp peer verbose",
      explicacao: "Mostra timers, capacidades negociadas e estatísticas detalhadas do peer."
    }],
    observacoes: "Essencial para diagnosticar quedas de sessão ou incompatibilidade de capacidades.",
    fabricante: "Huawei",
    categoria: "ROUTER",
    tags: ["bgp", "huawei", "routing"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Informações de ONT (Huawei OLT)",
    descricao: "Exibe informações de uma ONT específica.",
    itens: [{
      comando: "display ont info 0 0 0 0",
      explicacao: "Mostra o SN, status, e detalhes da ONT na porta especificada."
    }],
    observacoes: "Substitua os zeros pelo frame/slot/port/ont-id.",
    fabricante: "Huawei",
    categoria: "OLT",
    tags: ["huawei", "olt", "ont"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Verificar Placas (ZTE C3XX)",
    descricao: "Exibe o status das placas na OLT ZTE C3XX.",
    itens: [{
      comando: "show card",
      explicacao: "Lista todas as placas e seus estados (INSERVICE, OFFLINE, etc)."
    }],
    observacoes: "Comando básico para auditoria de hardware.",
    fabricante: "ZTE",
    categoria: "LINHA C3XX",
    tags: ["zte", "c3xx", "hardware"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Verificar ONT por SN (ZTE C3XX)",
    descricao: "Busca uma ONT pelo Serial Number.",
    itens: [{
      comando: "show gpon ont info by-sn <SERIAL>",
      explicacao: "Localiza la porta e o ID da ONT através do SN."
    }],
    observacoes: "Útil para encontrar ONTs perdidas no provisionamento.",
    fabricante: "ZTE",
    categoria: "LINHA C3XX",
    tags: ["zte", "c3xx", "ont"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Verificar Placas (ZTE TITAN C6XX)",
    descricao: "Exibe o status das placas na OLT ZTE TITAN.",
    itens: [{
      comando: "show board",
      explicacao: "Lista as placas instaladas e seu status operacional."
    }],
    observacoes: "A linha Titan utiliza comandos ligeiramente diferentes da C3XX.",
    fabricante: "ZTE",
    categoria: "LINHA TITAN C6XX",
    tags: ["zte", "titan", "c6xx", "hardware"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Status de ONT (ZTE TITAN C6XX)",
    descricao: "Exibe o estado das ONTs em uma interface.",
    itens: [{
      comando: "show gpon ont state gpon-olt_1/1/1",
      explicacao: "Mostra se as ONTs estão online, offline ou com problemas de sinal."
    }],
    observacoes: "Verifique o sinal óptico se o estado for 'DyingGasp'.",
    fabricante: "ZTE",
    categoria: "LINHA TITAN C6XX",
    tags: ["zte", "titan", "c6xx", "ont"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Resumo de Interfaces (ZTE Switch)",
    descricao: "Exibe o status das interfaces no switch ZTE.",
    itens: [{
      comando: "show interface brief",
      explicacao: "Mostra o status físico e de protocolo das portas."
    }],
    observacoes: "Equivalente ao 'display interface brief' da Huawei.",
    fabricante: "ZTE",
    categoria: "SWITCH",
    tags: ["zte", "switch", "interface"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Tabela de Rotas (ZTE Router)",
    descricao: "Exibe a tabela de roteamento IP.",
    itens: [{
      comando: "show ip route",
      explicacao: "Lista todas as rotas estáticas e dinâmicas aprendidas."
    }],
    observacoes: "Pode filtrar por protocolo: 'show ip route bgp'.",
    fabricante: "ZTE",
    categoria: "ROUTER",
    tags: ["zte", "router", "routing"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Gerenciamento de Usuários (DmOS)",
    descricao: "Criação e alteração de senhas de usuários locais.",
    itens: [
      {
        comando: "config\nuser admin password <NOVA_SENHA>",
        explicacao: "Altera a senha do usuário administrador."
      },
      {
        comando: "config\nuser operador password <SENHA> level 1",
        explicacao: "Cria um novo usuário com nível de privilégio restrito (operador)."
      }
    ],
    observacoes: "Níveis de privilégio variam de 0 (mínimo) a 15 (máximo/admin).",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "user", "password", "security"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Acesso Remoto SSH/Telnet (DmOS)",
    descricao: "Habilitação e configuração de protocolos de acesso remoto.",
    itens: [
      {
        comando: "config\nssh-server enabled\nssh-server port 22",
        explicacao: "Habilita o servidor SSH na porta padrão."
      },
      {
        comando: "config\ntelnet-server enabled",
        explicacao: "Habilita o acesso via Telnet (não recomendado por segurança)."
      }
    ],
    observacoes: "Sempre prefira SSH em vez de Telnet para gerência remota.",
    fabricante: "Datacom",
    categoria: "Gerência",
    subgrupo: "Gerenciamento",
    tags: ["datacom", "ssh", "telnet", "management"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de MTU (DmOS)",
    descricao: "Ajuste do tamanho máximo de quadro nas interfaces.",
    itens: [
      {
        comando: "config\ninterface gigabit-ethernet 1/1/1\nmtu 9000",
        explicacao: "Configura Jumbo Frames (MTU 9000) na interface."
      }
    ],
    observacoes: "Certifique-se de que todos os equipamentos no caminho suportem o mesmo MTU.",
    fabricante: "Datacom",
    categoria: "Interface",
    subgrupo: "Interfaces",
    tags: ["datacom", "mtu", "interface", "jumbo"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Spanning Tree Protocol (DmOS)",
    descricao: "Configuração de prevenção de loops em camada 2.",
    itens: [
      {
        comando: "config\nspanning-tree mode rstp\nspanning-tree priority 4096",
        explicacao: "Habilita o RSTP e define a prioridade para tornar o switch Root Bridge."
      },
      {
        comando: "config\ninterface gigabit-ethernet 1/1/1\nspanning-tree edge-port",
        explicacao: "Configura a porta como Edge Port (Portfast) para conexão rápida de hosts."
      }
    ],
    observacoes: "O RSTP é o padrão recomendado para convergência rápida.",
    fabricante: "Datacom",
    categoria: "Switching",
    subgrupo: "Switching",
    tags: ["datacom", "stp", "rstp", "loop"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Configuração de VRF (DmOS)",
    descricao: "Criação de instâncias de roteamento virtual (VRF).",
    itens: [
      {
        comando: "config\nvrf CLIENTE_A\nrd 65000:1\naddress-family ipv4 unicast\nexport-target 65000:1\nimport-target 65000:1",
        explicacao: "Cria a VRF, define o Route Distinguisher e as Route Targets."
      }
    ],
    observacoes: "VRFs permitem isolar tabelas de roteamento no mesmo hardware.",
    fabricante: "Datacom",
    categoria: "Routing",
    subgrupo: "Roteamento",
    tags: ["datacom", "vrf", "routing", "mpls"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Status Óptico de ONU (DmOS)",
    descricao: "Verificação de sinal (RX/TX) de uma ONU específica.",
    itens: [
      {
        comando: "show interface gpon 1/1/1 onu 1 optical-power",
        explicacao: "Exibe a potência óptica recebida e transmitida pela ONU."
      }
    ],
    observacoes: "Valores ideais de RX na ONU costumam estar entre -8dBm e -25dBm.",
    fabricante: "Datacom",
    categoria: "GPON",
    subgrupo: "GPON",
    tags: ["datacom", "gpon", "optical", "power", "onu"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Salvar e Reiniciar (DmOS)",
    descricao: "Comandos para persistir configurações e reiniciar o sistema.",
    itens: [
      {
        comando: "copy running-config startup-config",
        explicacao: "Salva a configuração atual para que seja carregada no próximo boot."
      },
      {
        comando: "request system reboot",
        explicacao: "Reinicia o equipamento."
      }
    ],
    observacoes: "Sempre salve a configuração antes de reiniciar ou desligar o equipamento.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Sistema",
    tags: ["datacom", "save", "reboot", "config"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "L2 Protocol Tunneling (DmOS)",
    descricao: "Tunelamento de protocolos de camada 2 (STP, CDP, LLDP) através de uma rede Metro Ethernet.",
    itens: [
      {
        comando: "config\ninterface gigabit-ethernet 1/1/1\nl2pt stp\nl2pt cdp\nl2pt lldp",
        explicacao: "Habilita o tunelamento dos protocolos especificados na interface."
      }
    ],
    observacoes: "Essencial para serviços LAN-to-LAN (E-Line/E-LAN) onde o cliente precisa passar seus próprios protocolos de controle.",
    fabricante: "Datacom",
    categoria: "Switching",
    subgrupo: "Switching",
    tags: ["datacom", "l2pt", "tunneling", "metro-ethernet"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Rota Estática com Track (DmOS)",
    descricao: "Configuração de rota estática condicionada ao status de um IP (IP SLA).",
    itens: [
      {
        comando: "config\ntrack 1\nip-sla 1\n!\nip-sla 1\nicmp-echo 8.8.8.8\n!\nrouter static\naddress-family ipv4\n0.0.0.0/0 next-hop 10.0.0.1 track 1",
        explicacao: "Configura um track que monitora o IP 8.8.8.8 via ICMP e associa à rota padrão."
      }
    ],
    observacoes: "Se o ping falhar, a rota é removida da tabela de roteamento, permitindo redundância.",
    fabricante: "Datacom",
    categoria: "Routing",
    subgrupo: "Roteamento",
    tags: ["datacom", "routing", "track", "sla", "redundancy"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Atualização de Firmware de ONU (DmOS)",
    descricao: "Comando para atualizar o software das ONUs via OLT.",
    itens: [
      {
        comando: "request interface gpon 1/1/1 onu 1 firmware-update tftp://10.0.0.1/onu_v2.bin",
        explicacao: "Inicia o processo de download e atualização da ONU especificada."
      }
    ],
    observacoes: "A ONU irá reiniciar após a conclusão do processo.",
    fabricante: "Datacom",
    categoria: "GPON",
    subgrupo: "GPON",
    tags: ["datacom", "gpon", "onu", "update", "firmware"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Informações Detalhadas de Hardware (DmOS)",
    descricao: "Exibe detalhes técnicos de voltagem, temperatura e fans.",
    itens: [
      {
        comando: "show system environment",
        explicacao: "Mostra o status das fontes, ventoinhas e sensores de temperatura."
      }
    ],
    observacoes: "Crucial para diagnosticar problemas físicos e de climatização no rack.",
    fabricante: "Datacom",
    categoria: "Sistema",
    subgrupo: "Sistema",
    tags: ["datacom", "hardware", "environment", "temperature", "fan"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Troubleshooting OSPF Avançado (Cisco)",
    descricao: "Comandos para diagnóstico profundo de adjacências e banco de dados OSPF.",
    itens: [
      {
        comando: "show ip ospf neighbor",
        explicacao: "Verifica o estado das adjacências (deve ser FULL para redes P2P ou Broadcast)."
      },
      {
        comando: "show ip ospf database",
        explicacao: "Exibe o banco de dados de estado de link (LSDB) para verificar LSAs recebidos."
      },
      {
        comando: "show ip ospf interface brief",
        explicacao: "Verifica quais interfaces estão participando do processo OSPF e seus custos."
      }
    ],
    observacoes: "Problemas comuns: MTU mismatch, Area ID incorreta, ou Timers divergentes.",
    fabricante: "Cisco",
    categoria: "Routing",
    tags: ["cisco", "ospf", "routing", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Troubleshooting BGP Avançado (Cisco)",
    descricao: "Comandos para validar sessões e rotas BGP.",
    itens: [
      {
        comando: "show ip bgp summary",
        explicacao: "Exibe o status de todos os vizinhos BGP e a quantidade de prefixos recebidos."
      },
      {
        comando: "show ip bgp neighbors 10.0.0.1 advertised-routes",
        explicacao: "Mostra quais rotas estão sendo enviadas para um vizinho específico."
      },
      {
        comando: "show ip bgp neighbors 10.0.0.1 received-routes",
        explicacao: "Mostra as rotas recebidas de um vizinho (requer soft-reconfiguration inbound)."
      }
    ],
    observacoes: "O estado 'Idle' ou 'Active' geralmente indica falha na conectividade TCP ou erro de configuração.",
    fabricante: "Cisco",
    categoria: "Routing",
    tags: ["cisco", "bgp", "routing", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Comandos Essenciais Junos (Juniper)",
    descricao: "Operações básicas e verificação de status em equipamentos Juniper.",
    itens: [
      {
        comando: "show interfaces terse",
        explicacao: "Exibe um resumo rápido do status de todas as interfaces (Admin/Link/Protocol)."
      },
      {
        comando: "show route",
        explicacao: "Exibe a tabela de roteamento (inet.0 para IPv4)."
      },
      {
        comando: "show chassis hardware",
        explicacao: "Lista todos os componentes físicos, números de série e versões de hardware."
      },
      {
        comando: "commit check",
        explicacao: "Valida a sintaxe da configuração candidata antes de aplicá-la."
      }
    ],
    observacoes: "No Junos, as alterações só entram em vigor após o comando 'commit'.",
    fabricante: "Juniper",
    categoria: "Sistema",
    tags: ["juniper", "junos", "system", "basics"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Troubleshooting OSPF/BGP no Junos (Juniper)",
    descricao: "Verificação de protocolos de roteamento dinâmico em Juniper.",
    itens: [
      {
        comando: "show ospf neighbor",
        explicacao: "Verifica o estado dos vizinhos OSPF."
      },
      {
        comando: "show bgp summary",
        explicacao: "Exibe o status das sessões BGP (Established é o estado desejado)."
      },
      {
        comando: "show bgp neighbor 10.0.0.1",
        explicacao: "Detalhes completos de uma sessão BGP específica."
      }
    ],
    observacoes: "Use 'monitor traffic interface ge-0/0/0' para capturar pacotes de controle em tempo real.",
    fabricante: "Juniper",
    categoria: "Routing",
    tags: ["juniper", "ospf", "bgp", "routing", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Comandos de Operação Arista (EOS)",
    descricao: "Comandos essenciais para switches Arista Networks.",
    itens: [
      {
        comando: "show interfaces status",
        explicacao: "Exibe o status das portas, VLANs, duplex, velocidade e tipo de transceptores."
      },
      {
        comando: "show lldp neighbors",
        explicacao: "Lista vizinhos conectados via LLDP."
      },
      {
        comando: "show mlag",
        explicacao: "Verifica o status do Multi-Chassis Link Aggregation (MLAG)."
      },
      {
        comando: "show version",
        explicacao: "Exibe a versão do EOS, uptime e recursos de hardware."
      }
    ],
    observacoes: "O Arista EOS é baseado em Linux e possui uma CLI muito similar à do Cisco IOS.",
    fabricante: "Arista",
    categoria: "Switching",
    tags: ["arista", "eos", "switching", "mlag"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Troubleshooting de VXLAN (Arista)",
    descricao: "Comandos para diagnóstico de túneis VXLAN e VTEPs.",
    itens: [
      {
        comando: "show vxlan vtep",
        explicacao: "Exibe o status dos túneis VXLAN e endereços IP dos VTEPs remotos."
      },
      {
        comando: "show vxlan address-table",
        explicacao: "Mostra os endereços MAC aprendidos através dos túneis VXLAN."
      }
    ],
    observacoes: "VXLAN é fundamental para redes Data Center modernas (Leaf-Spine).",
    fabricante: "Arista",
    categoria: "Switching",
    tags: ["arista", "vxlan", "datacenter", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Captura de Pacotes Avançada (Cisco)",
    descricao: "Uso do Embedded Packet Capture (EPC) para análise de tráfego no plano de dados.",
    itens: [
      {
        comando: "monitor capture MYCAP interface Gi0/1 both",
        explicacao: "Define o ponto de captura na interface Gi0/1 para tráfego de entrada e saída."
      },
      {
        comando: "monitor capture MYCAP match any\nmonitor capture MYCAP start",
        explicacao: "Inicia a captura de todos os pacotes."
      },
      {
        comando: "show monitor capture MYCAP buffer brief",
        explicacao: "Exibe um resumo dos pacotes capturados no buffer."
      }
    ],
    observacoes: "Lembre-se de parar a captura com 'monitor capture MYCAP stop' para não sobrecarregar a CPU.",
    fabricante: "Cisco",
    categoria: "Sistema",
    tags: ["cisco", "packet-capture", "epc", "troubleshooting"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Análise de Performance e CPU",
    descricao: "Comandos para identificar processos que estão consumindo muitos recursos.",
    itens: [
      {
        comando: "show processes cpu sorted (Cisco)",
        explicacao: "Lista os processos ordenados pelo uso de CPU."
      },
      {
        comando: "show processes top (Arista)",
        explicacao: "Exibe o uso de CPU e memória estilo 'top' do Linux."
      },
      {
        comando: "display cpu-usage (Huawei)",
        explicacao: "Mostra a utilização da CPU no Huawei."
      }
    ],
    observacoes: "Picos de CPU podem ser causados por loops de rede, excesso de tráfego de controle ou bugs de software.",
    fabricante: "Linux",
    categoria: "Sistema",
    tags: ["performance", "cpu", "troubleshooting", "monitoring"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Diagnóstico Completo (Huawei)",
    descricao: "Gera um relatório completo de diagnóstico do sistema.",
    itens: [
      {
        comando: "display diagnostic-information",
        explicacao: "Coleta e exibe todas as informações de configuração, status e estatísticas para suporte técnico."
      }
    ],
    observacoes: "Este comando gera uma saída muito longa. Recomenda-se capturar o log da sessão do terminal.",
    fabricante: "Huawei",
    categoria: "Sistema",
    tags: ["huawei", "diagnostic", "troubleshooting", "support"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Monitoramento de Alarmes (Huawei)",
    descricao: "Comandos para verificar alarmes ativos e histórico de traps.",
    itens: [
      {
        comando: "display alarm active",
        explicacao: "Lista todos os alarmes que estão ativos no momento no equipamento."
      },
      {
        comando: "display trapbuffer",
        explicacao: "Exibe o buffer de traps (mensagens SNMP) enviadas pelo sistema."
      }
    ],
    observacoes: "Verifique a severidade dos alarmes (Critical, Major, Minor) para priorizar a resolução.",
    fabricante: "Huawei",
    categoria: "Sistema",
    tags: ["huawei", "alarm", "trap", "monitoring"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    titulo: "Troubleshooting Avançado (ZTE)",
    descricao: "Comandos para diagnóstico de falhas em equipamentos ZTE.",
    itens: [
      {
        comando: "show alarm active",
        explicacao: "Exibe os alarmes ativos no sistema."
      },
      {
        comando: "show logging",
        explicacao: "Mostra os logs de eventos registrados no equipamento."
      },
      {
        comando: "show running-config",
        explicacao: "Exibe a configuração que está sendo executada no momento."
      }
    ],
    observacoes: "Útil para correlacionar eventos de log com quedas de interfaces ou serviços.",
    fabricante: "ZTE",
    categoria: "Sistema",
    tags: ["zte", "troubleshooting", "alarm", "logs"],
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

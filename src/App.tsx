import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  Search, 
  Plus, 
  ChevronRight, 
  Terminal, 
  Server, 
  Network, 
  Cpu, 
  Layers, 
  Database, 
  LogOut, 
  LogIn,
  Filter,
  Tag,
  Info,
  AlertTriangle,
  CheckCircle2,
  X,
  Menu,
  Copy,
  ExternalLink,
  ChevronDown,
  Box,
  Code,
  Router,
  Trash2,
  Settings,
  RefreshCw,
  Building2,
  Monitor,
  ShieldCheck,
  Key,
  Globe,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Search as SearchIcon,
  Trash2 as TrashIcon,
  Edit as EditIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Plus as PlusIcon,
  X as XIcon,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  ChevronUp,
  UserPlus,
  Sun,
  Moon,
  FileText,
  Paperclip,
  Download,
  History,
  Clock,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  where,
  getDocs,
  getDoc,
  setDoc,
  getDocFromServer,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth,
  User
} from 'firebase/auth';
import { db, auth } from './firebase';
import firebaseConfig from '../firebase-applet-config.json';
import { Command, Fabricante, Cliente, Ativo, DBUser, Backup } from './types';
import { getInitialCommands } from './data/initialCommands';
import Markdown from 'react-markdown';
import { RichTextEditor } from './components/RichTextEditor';
import { 
  FABRICANTES, 
  FABRICANTE_DETAILS, 
  CATEGORIAS, 
  CATEGORIA_DETAILS,
  GROUPS, 
  REDES_FABRICANTES, 
  SERVER_FABRICANTES 
} from './data/constants';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  REMOVE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Ocorreu um erro inesperado.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && parsed.error.includes('insufficient permissions')) {
          displayMessage = "Você não tem permissão para realizar esta ação. Verifique se você é um administrador.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white p-6 text-center">
          <AlertTriangle size={64} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Ops! Algo deu errado.</h2>
          <p className="text-zinc-400 mb-8 max-w-md">{displayMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black font-semibold py-2 px-6 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Logo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <div className={`bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 flex items-center justify-center shadow-lg ${className}`}>
    <Terminal size={size} className="text-emerald-500" />
  </div>
);

// Helper Components
const SidebarGroup = ({ 
  groupKey, 
  expandedGroups, 
  toggleGroup, 
  selectedFabricante, 
  setSelectedFabricante, 
  handleGroupClick, 
  setCurrentView 
}: {
  groupKey: 'Redes' | 'Server';
  expandedGroups: string[];
  toggleGroup: (group: string) => void;
  selectedFabricante: string;
  setSelectedFabricante: (f: any) => void;
  handleGroupClick: (group: any) => void;
  setCurrentView: (view: any) => void;
}) => {
  const group = GROUPS[groupKey];
  const Icon = group.icon;
  const isSelected = selectedFabricante === `Group:${groupKey}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center group">
        <button 
          onClick={() => {
            handleGroupClick(groupKey);
            setCurrentView('wiki');
          }}
          className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isSelected ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Icon size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">{group.label}</span>
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleGroup(groupKey);
          }}
          className="p-2 text-zinc-600 hover:text-zinc-400"
        >
          <ChevronDown size={14} className={`transition-transform ${expandedGroups.includes(groupKey) ? '' : '-rotate-90'}`} />
        </button>
      </div>
      <AnimatePresence>
        {expandedGroups.includes(groupKey) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-4 space-y-1"
          >
            {group.fabricantes.map(f => (
              <button 
                key={f}
                onClick={() => {
                  setSelectedFabricante(f as Fabricante);
                  setCurrentView('wiki');
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedFabricante === f ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
              >
                <span>{f}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GroupHeader = ({ groupKey }: { groupKey: 'Redes' | 'Server' }) => {
  const group = GROUPS[groupKey];
  const Icon = group.icon;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
        <Icon size={20} /> {groupKey === 'Redes' ? '🌐' : '🖥️'} {group.label}
      </h3>
      <p className="text-sm text-zinc-300 leading-relaxed">
        {group.description}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Envolvem</h4>
          <ul className="text-sm space-y-1 text-zinc-300">
            {group.envolvem.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">👉 Objetivo principal</h4>
          <p className="text-sm text-zinc-300">
            {group.objetivo}
          </p>
        </div>
      </div>
    </div>
  );
};

const GroupDashboard = ({ groupKey, setSelectedFabricante, commands }: { 
  groupKey: 'Redes' | 'Server', 
  setSelectedFabricante: (f: Fabricante) => void,
  commands: Command[]
}) => {
  const group = GROUPS[groupKey];
  const Icon = group.icon;

  return (
    <div className="mb-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
        <Layers size={16} /> Dashboard de Fabricantes
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-4">
        {group.fabricantes.map(f => (
          <motion.button
            key={f}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFabricante(f as Fabricante)}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
              {FABRICANTE_DETAILS[f] && (
                <img src={FABRICANTE_DETAILS[f].logo} alt="" className="w-16 h-16 object-contain grayscale" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="p-4 bg-white rounded-xl group-hover:shadow-lg group-hover:shadow-emerald-500/10 transition-all">
              {FABRICANTE_DETAILS[f] ? (
                <img src={FABRICANTE_DETAILS[f].logo} alt={f} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="text-zinc-900">
                  <Icon size={24} />
                </div>
              )}
            </div>
            <div className="text-center">
              <span className="font-bold text-sm block text-white">{f}</span>
              <span className="text-[10px] text-zinc-500 font-medium">
                {commands.filter(c => c.fabricante === f).length} comandos
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'OLT':
    case 'LINHA C3XX':
    case 'LINHA TITAN C6XX':
    case 'GPON':
      return <Cpu size={20} className="text-emerald-500" />;
    case 'SWITCH':
    case 'Switching':
    case 'Interface':
    case 'VLAN':
      return <Network size={20} className="text-emerald-500" />;
    case 'ROUTER':
    case 'Routing':
    case 'BGP':
      return <Router size={20} className="text-emerald-500" />;
    case 'MPLS':
      return <Layers size={20} className="text-emerald-500" />;
    case 'Sistema':
    case 'Admin':
    case 'Gerência':
      return <Server size={20} className="text-emerald-500" />;
    case 'Containers':
    case 'DevOps':
      return <Box size={20} className="text-emerald-500" />;
    case 'Security':
      return <CheckCircle2 size={20} className="text-emerald-500" />;
    case 'Database':
      return <Database size={20} className="text-emerald-500" />;
    default:
      return <Terminal size={20} className="text-emerald-500" />;
  }
};

const getFabricanteIcon = (fabricante: string, size = 20) => {
  const f = fabricante.toLowerCase();
  if (REDES_FABRICANTES.some(rf => rf.toLowerCase() === f)) {
    return <Network size={size} />;
  }
  if (SERVER_FABRICANTES.some(sf => sf.toLowerCase() === f)) {
    return <Server size={size} />;
  }
  return <Terminal size={size} />;
};

const CommandCard = ({ 
  cmd, 
  onClick 
}: { 
  cmd: Command; 
  onClick: () => void; 
}) => (
  <motion.div 
    layout
    key={cmd.id}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4 }}
    onClick={onClick}
    className="group bg-zinc-900 border border-zinc-800 p-4 rounded-2xl cursor-pointer hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all shadow-sm"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="p-1.5 bg-zinc-800 rounded-lg group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
        {getFabricanteIcon(cmd.fabricante, 18)}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
          {cmd.categoria}
        </span>
      </div>
    </div>
    <h3 className="font-bold text-base mb-1.5 group-hover:text-emerald-400 transition-colors">{cmd.titulo}</h3>
    <p className="text-zinc-400 text-xs line-clamp-2 mb-3 leading-relaxed whitespace-pre-wrap">{cmd.descricao}</p>
    <div className="flex flex-wrap gap-1.5">
      {(cmd.tags || []).slice(0, 3).map(tag => (
        <span key={tag} className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">
          #{tag}
        </span>
      ))}
      {(cmd.tags || []).length > 3 && <span className="text-[10px] text-zinc-500">+{(cmd.tags || []).length - 3}</span>}
    </div>
  </motion.div>
);

const ShortcutItem = ({ 
  label, 
  shortcut, 
  tooltip 
}: { 
  label: string; 
  shortcut: string; 
  tooltip: string; 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative flex justify-between text-[10px] text-zinc-500 group cursor-help py-1 px-2 rounded hover:bg-zinc-900 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{label}</span>
      <span className="bg-zinc-800 px-1.5 rounded text-zinc-400 font-mono">{shortcut}</span>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 12 }}
            exit={{ opacity: 0, x: 5 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-zinc-900 text-zinc-200 text-[11px] rounded-lg shadow-2xl whitespace-nowrap z-50 pointer-events-none border border-zinc-800 min-w-[150px]"
          >
            <div className="font-bold text-emerald-500 mb-0.5">{label}</div>
            <div className="text-zinc-400 leading-tight">{tooltip}</div>
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-zinc-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SshHelpModal = ({ isOpen, onClose, addToast }: { isOpen: boolean, onClose: () => void, addToast: (msg: string, type?: any) => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Configurar Acesso SSH</h3>
                  <p className="text-xs text-zinc-500">Guia para Windows 11 e Termius</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <section className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  Opção Recomendada: Termius
                </h4>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-3">
                  <p className="text-sm text-zinc-400">
                    O Termius é o cliente mais moderno e compatível com o NOCPedia.
                  </p>
                  <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
                    <li>Instale o <a href="https://termius.com/" target="_blank" className="text-emerald-500 hover:underline">Termius Desktop</a>.</li>
                    <li>No Windows, vá em <strong>Configurações &gt; Aplicativos &gt; Aplicativos Padrão</strong>.</li>
                    <li>Clique em <strong>Escolher os padrões por tipo de link</strong> (no final da página).</li>
                    <li>Busque por <strong>SSH</strong> e selecione o <strong>Termius</strong>.</li>
                  </ol>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  Opção 2: Windows Terminal (Nativo)
                </h4>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-3">
                  <p className="text-sm text-zinc-400">
                    Se você prefere o terminal padrão do Windows, use o script abaixo para registrar o protocolo.
                  </p>
                  <div className="relative group">
                    <pre className="text-[10px] font-mono text-zinc-500 bg-black/50 p-3 rounded-lg overflow-x-auto border border-zinc-800">
{`Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\\ssh]
"URL Protocol"=""
@="URL:ssh Protocol"

[HKEY_CLASSES_ROOT\\ssh\\shell\\open\\command]
@="powershell.exe -NoProfile -Command \\"$u='%1'; $t=$u -replace 'ssh://',''; $t=$t.TrimEnd('/'); cmd /c title SSH Connection && ssh $t\\""`}
                    </pre>
                    <button
                      onClick={() => {
                        const reg = `Windows Registry Editor Version 5.00\n\n[HKEY_CLASSES_ROOT\\ssh]\n"URL Protocol"=""\n@="URL:ssh Protocol"\n\n[HKEY_CLASSES_ROOT\\ssh\\shell\\open\\command]\n@="powershell.exe -NoProfile -Command \\"$u='%1'; $t=$u -replace 'ssh://',''; $t=$t.TrimEnd('/'); cmd /c title SSH Connection && ssh $t\\""`;
                        navigator.clipboard.writeText(reg);
                        addToast("Script copiado! Salve como .reg e execute.");
                      }}
                      className="absolute top-2 right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      title="Copiar Script .reg"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-500/80 flex items-center gap-2">
                    <AlertTriangle size={12} />
                    Salve o conteúdo acima em um arquivo <strong>.reg</strong> e execute como administrador.
                  </p>
                </div>
              </section>

              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                <div className="flex gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 h-fit">
                    <Info size={16} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-emerald-500">Dica de Fluxo</h5>
                    <p className="text-xs text-emerald-500/70 mt-1 leading-relaxed">
                      Ao clicar no botão de SSH, o NOCPedia <strong>copia automaticamente o comando</strong> para o seu clipboard. 
                      Se o terminal não abrir, basta dar um Ctrl+V no seu terminal favorito.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isSeedingRef = useRef(false);
  const [commands, setCommands] = useState<Command[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isAddingCliente, setIsAddingCliente] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<DBUser | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [usersList, setUsersList] = useState<DBUser[]>([]);
  const [isAddingAtivo, setIsAddingAtivo] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<Ativo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [backupsList, setBackupsList] = useState<Backup[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);

  const [showSshHelp, setShowSshHelp] = useState(false);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nocpedia-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabricante, setSelectedFabricante] = useState<Fabricante | 'All' | 'Group:Redes' | 'Group:Server'>('All');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Redes', 'Server']);

  const handleGroupClick = (group: 'Redes' | 'Server') => {
    setSelectedFabricante(`Group:${group}` as any);
    if (!expandedGroups.includes(group)) {
      setExpandedGroups(prev => [...prev, group]);
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const Breadcrumbs = () => {
    const items = [
      { 
        label: 'Home', 
        onClick: () => { 
          setSelectedFabricante('All'); 
          setSelectedCategoria('All'); 
          setCurrentView('home'); 
          setSelectedCommand(null);
        } 
      }
    ];

    if (selectedFabricante !== 'All') {
      items.push({ 
        label: (selectedFabricante as string), 
        onClick: () => { 
          setSelectedCategoria('All'); 
          setSelectedCommand(null); 
          setCurrentView('wiki');
        } 
      });
    }

    if (selectedCategoria !== 'All') {
      items.push({ 
        label: selectedCategoria, 
        onClick: () => { 
          setSelectedCommand(null); 
          setCurrentView('wiki');
        } 
      });
    }

    if (selectedCommand) {
      items.push({ 
        label: selectedCommand.titulo, 
        onClick: () => {} 
      });
    }

    return (
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={12} className="text-zinc-700 flex-shrink-0" />}
            <button
              onClick={item.onClick}
              className={`hover:text-emerald-500 transition-colors flex items-center gap-1 ${index === items.length - 1 ? 'text-zinc-300 font-bold pointer-events-none' : ''}`}
            >
              {index === 0 && <Database size={12} />}
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const [selectedCategoria, setSelectedCategoria] = useState<string | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'wiki' | 'acessos' | 'configuracoes'>('home');
  const [configTab, setConfigTab] = useState<'geral' | 'clientes' | 'usuarios'>('usuarios');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + N: Novo Comando
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (isAdmin) {
          setIsAdding(true);
          setCurrentView('wiki');
        }
      }
      // Alt + M: Menu Toggle
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
      // Alt + S: Search Focus
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setCurrentView('wiki');
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      // Esc: Close all
      if (e.key === 'Escape') {
        setIsAdding(false);
        setEditingCommand(null);
        setSelectedCommand(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('nocpedia-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed, user:", user?.email);
      setUser(user);
      if (user) {
        try {
          // Test connection
          await getDocFromServer(doc(db, 'test', 'connection')).catch(() => {});

          // Check if user is admin (default admin or from DB)
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);
          
          const isDefaultAdmin = user.email === 'noc.itmanage@gmail.com';
          const hasAdminRole = userSnap.exists() && userSnap.data().role === 'admin';
          
          console.log("Debug Admin:", { email: user.email, isDefaultAdmin, hasAdminRole, userSnapExists: userSnap.exists(), currentRole: userSnap.data()?.role });

          setIsAdmin(isDefaultAdmin || hasAdminRole);

          // Ensure user doc exists with correct ID and role
          if (!userSnap.exists()) {
            const newDbUser = {
              uid: user.uid,
              email: user.email,
              role: isDefaultAdmin ? 'admin' : 'viewer'
            };
            await setDoc(userDocRef, newDbUser);
            setDbUser(newDbUser as DBUser);
          } else {
            if (isDefaultAdmin && userSnap.data().role !== 'admin') {
              // Force update if it's the default admin but role is not admin
              await updateDoc(userDocRef, { role: 'admin' });
              setIsAdmin(true);
              console.log("Admin role forced updated.");
              setDbUser({ ...userSnap.data(), role: 'admin' } as DBUser);
            } else {
              setDbUser(userSnap.data() as DBUser);
            }
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('offline')) {
            console.warn("Auth initialization warning: Firestore is currently offline. Retrying may be necessary.");
          } else {
            console.error("Auth initialization error:", error);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch commands
  useEffect(() => {
    const q = query(collection(db, 'commands'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cmds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Command[];
      setCommands(cmds);
      
      // Auto-sync logic for admins
      if (isAdmin && user && !isSeedingRef.current) {
        const hasDatacom = cmds.some(c => c.fabricante === 'Datacom');
        const hasLinux = cmds.some(c => c.fabricante === 'Linux');
        const hasDocker = cmds.some(c => c.fabricante === 'Docker');
        
        // If major new manufacturers are missing, trigger sync
        if (cmds.length > 0 && (!hasDatacom || !hasLinux || !hasDocker)) {
          seedInitialData(user.uid, true, cmds); // pass current cmds
        }
      }
    }, (error) => {
      if (error.message.includes('insufficient permissions')) {
        handleFirestoreError(error, OperationType.LIST, 'commands');
      } else {
        console.error("Firestore Error:", error);
      }
    });

    return unsubscribe;
  }, [isAdmin, user]);

  // Fetch clients
  useEffect(() => {
    if (!user || !dbUser) return;
    
    if (dbUser.role === 'cliente' && dbUser.clienteId) {
      const unsubscribe = onSnapshot(doc(db, 'clientes', dbUser.clienteId), (docSnap) => {
        if (docSnap.exists()) {
          const cliente = { id: docSnap.id, ...docSnap.data() } as Cliente;
          setClientes([cliente]);
          setSelectedCliente(prev => prev ? prev : cliente);
        } else {
          setClientes([]);
        }
      }, (error) => {
        if (error.message.includes('insufficient permissions')) {
          handleFirestoreError(error, OperationType.GET, `clientes/${dbUser.clienteId}`);
        } else {
          console.error("Firestore Error (clientes):", error);
        }
      });
      return unsubscribe;
    } else if (isAdmin) {
      const q = query(collection(db, 'clientes'), orderBy('nomeFantasia', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cls = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Cliente[];
        setClientes(cls);
      }, (error) => {
        if (error.message.includes('insufficient permissions')) {
          handleFirestoreError(error, OperationType.LIST, 'clientes');
        } else {
          console.error("Firestore Error (clientes):", error);
        }
      });
      return unsubscribe;
    }
  }, [user, dbUser, isAdmin]);

  // Fetch assets for selected client
  useEffect(() => {
    if (!user || !selectedCliente?.id) {
      setAtivos([]);
      return;
    }
    const q = query(
      collection(db, 'clientes', selectedCliente.id, 'ativos'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ativo[];
      setAtivos(ats);
    }, (error) => {
      if (error.message.includes('insufficient permissions')) {
        handleFirestoreError(error, OperationType.LIST, `clientes/${selectedCliente.id}/ativos`);
      } else {
        console.error("Firestore Error (ativos):", error);
      }
    });

    return unsubscribe;
  }, [user, selectedCliente]);

  // Fetch users (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DBUser[];
      setUsersList(users);
    }, (error) => {
      console.error("Firestore Error (users):", error);
    });

    return unsubscribe;
  }, [isAdmin]);

  // Fetch backups (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'backups'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Backup[];
      setBackupsList(bks);
    }, (error) => {
      console.error("Firestore Error (backups):", error);
    });

    return unsubscribe;
  }, [isAdmin]);

  // Auto-backup logic
  useEffect(() => {
    if (!isAdmin || !user) return;
    
    const checkAndBackup = async () => {
      const today = new Date().toISOString().split('T')[0];
      const backupRef = doc(db, 'backups', today);
      const snap = await getDoc(backupRef);
      
      if (!snap.exists()) {
        console.log("Iniciando backup diário automático...");
        await performAutoBackup(today);
      }
    };
    
    checkAndBackup();
  }, [isAdmin, user]);

  const generateBackupData = async () => {
    const backupData: any = {
      exportDate: new Date().toISOString(),
      clientes: [],
      commands: [],
      users: []
    };

    // Export Clientes and their Ativos
    const clientesSnap = await getDocs(collection(db, 'clientes'));
    for (const clienteDoc of clientesSnap.docs) {
      const clienteData = { id: clienteDoc.id, ...clienteDoc.data() } as any;
      const ativosSnap = await getDocs(collection(db, 'clientes', clienteDoc.id, 'ativos'));
      clienteData.ativos = ativosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      backupData.clientes.push(clienteData);
    }

    // Export Commands
    const commandsSnap = await getDocs(collection(db, 'commands'));
    backupData.commands = commandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Export Users
    const usersSnap = await getDocs(collection(db, 'users'));
    backupData.users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return backupData;
  };

  const performAutoBackup = async (id: string) => {
    try {
      const data = await generateBackupData();
      await setDoc(doc(db, 'backups', id), {
        date: serverTimestamp(),
        data: JSON.stringify(data),
        createdBy: 'system'
      });

      // Prune old backups (keep only last 7)
      const q = query(collection(db, 'backups'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      if (snap.size > 7) {
        const toDelete = snap.docs.slice(7);
        for (const d of toDelete) {
          await deleteDoc(d.ref);
        }
      }
    } catch (error) {
      console.error("Erro no auto-backup:", error);
    }
  };

  const restoreFromBackup = async (backup: Backup) => {
    if (!window.confirm("ATENÇÃO: Restaurar um backup irá SUBSTITUIR todos os dados atuais (Clientes, Ativos, Comandos e Usuários). Esta ação não pode ser desfeita. Deseja continuar?")) {
      return;
    }

    setIsRestoring(true);
    try {
      const data = JSON.parse(backup.data);
      
      // 1. Clear current data
      const collectionsToClear = ['commands', 'users', 'clientes'];
      for (const coll of collectionsToClear) {
        const snap = await getDocs(collection(db, coll));
        for (const d of snap.docs) {
          // If it's a client, clear subcollection 'ativos' first
          if (coll === 'clientes') {
            const ativosSnap = await getDocs(collection(db, 'clientes', d.id, 'ativos'));
            for (const a of ativosSnap.docs) await deleteDoc(a.ref);
          }
          await deleteDoc(d.ref);
        }
      }

      // 2. Restore data
      // Restore Commands
      for (const cmd of data.commands) {
        const { id, ...rest } = cmd;
        await setDoc(doc(db, 'commands', id), rest);
      }

      // Restore Users
      for (const u of data.users) {
        const { id, ...rest } = u;
        await setDoc(doc(db, 'users', id), rest);
      }

      // Restore Clientes and Ativos
      for (const c of data.clientes) {
        const { id, ativos, ...rest } = c;
        await setDoc(doc(db, 'clientes', id), rest);
        if (ativos && Array.isArray(ativos)) {
          for (const a of ativos) {
            const { id: aId, ...aRest } = a;
            await setDoc(doc(db, 'clientes', id, 'ativos', aId), aRest);
          }
        }
      }

      alert('Restauração concluída com sucesso! A página será recarregada.');
      window.location.reload();
    } catch (error) {
      console.error("Erro na restauração:", error);
      alert('Erro ao restaurar backup. Verifique o console para mais detalhes.');
    } finally {
      setIsRestoring(false);
    }
  };

  const seedInitialData = async (uid: string, silent = false, existingCommands?: Command[]) => {
    if (isSeedingRef.current) return;
    isSeedingRef.current = true;
    const initialCommands = getInitialCommands(uid);

    try {
      let existingTitles: Set<string>;
      
      if (existingCommands) {
        existingTitles = new Set(existingCommands.map(c => c.titulo));
      } else {
        const existingSnapshot = await getDocs(collection(db, 'commands'));
        existingTitles = new Set(existingSnapshot.docs.map(doc => doc.data().titulo));
      }

      for (const cmd of initialCommands) {
        if (!existingTitles.has(cmd.titulo)) {
          await addDoc(collection(db, 'commands'), cmd);
          // Update local set to prevent duplicates if initialCommands has internal duplicates
          existingTitles.add(cmd.titulo);
        }
      }
      if (!silent) {
        alert('Base de conhecimento sincronizada!');
      }
    } catch (error) {
      if (!silent) {
        handleFirestoreError(error, OperationType.WRITE, 'commands');
      }
    } finally {
      isSeedingRef.current = false;
    }
  };

  const clearDatabase = async () => {
    if (!window.confirm('Tem certeza que deseja limpar toda a base de dados? Esta ação não pode ser desfeita.')) return;
    try {
      const snapshot = await getDocs(collection(db, 'commands'));
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      alert('Base de dados limpa com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar base de dados:', error);
      alert('Erro ao limpar base de dados.');
    }
  };

  const promoteAllUsersToAdmin = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      usersSnapshot.forEach((userDoc) => {
        batch.update(userDoc.ref, { role: 'admin' });
      });
      await batch.commit();
      alert('Todos os usuários foram promovidos a admin com sucesso!');
    } catch (error) {
      console.error('Erro ao promover usuários:', error);
      alert('Erro ao promover usuários.');
    }
  };

  useEffect(() => {
    return () => { };
  }, []);

  const [expandedSubgroups, setExpandedSubgroups] = useState<Set<string>>(new Set());

  const toggleSubgroup = (subgroup: string) => {
    setExpandedSubgroups(prev => {
      const next = new Set(prev);
      if (next.has(subgroup)) next.delete(subgroup);
      else next.add(subgroup);
      return next;
    });
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        console.log("Login cancelado pelo usuário.");
      } else {
        console.error("Login error:", error);
        alert("Erro ao fazer login com Google: " + error.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login error:", error);
      alert("Erro ao fazer login: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email signup error:", error);
      alert("Erro ao criar conta: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const exportDatabase = async () => {
    try {
      const backupData = await generateBackupData();

      // Create and download file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nocpedia_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Backup exportado com sucesso!');
    } catch (error) {
      console.error("Erro ao exportar backup:", error);
      alert('Erro ao exportar backup. Verifique o console para mais detalhes.');
    }
  };

  const ConfiguracoesView = () => (
    <div className="flex-1 flex flex-col p-8 bg-zinc-950 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Settings className="text-emerald-500" size={32} />
              Configurações
            </h2>
            <p className="text-zinc-400 mt-2">Gerencie o sistema, clientes e usuários.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl w-fit border border-zinc-800">
          <button
            onClick={() => setConfigTab('geral')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${configTab === 'geral' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Settings size={16} />
            Geral
          </button>
          <button
            onClick={() => setConfigTab('clientes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${configTab === 'clientes' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Building2 size={16} />
            Clientes
          </button>
          <button
            onClick={() => setConfigTab('usuarios')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${configTab === 'usuarios' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <UserIcon size={16} />
            Usuários
          </button>
        </div>

        {configTab === 'usuarios' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserIcon size={20} className="text-emerald-500" />
                Usuários
              </h3>
              {isAdmin && (
                <button 
                  onClick={() => setIsAddingUser(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <UserPlus size={18} />
                  Novo Usuário
                </button>
              )}
            </div>
            <div className="divide-y divide-zinc-800">
              {usersList.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  Nenhum usuário encontrado.
                </div>
              ) : (
                usersList.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{u.email}</p>
                        <p className="text-xs text-zinc-500 font-mono">{u.uid}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : u.role === 'cliente' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                        {u.role}
                      </span>
                      {u.role === 'cliente' && u.clienteId && (
                        <span className="text-xs text-zinc-500 truncate max-w-[150px]">
                          {clientes.find(c => c.id === u.clienteId)?.nomeFantasia || 'Cliente Desconhecido'}
                        </span>
                      )}
                      {isAdmin && (
                        <button 
                          onClick={() => setEditingUser(u)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <EditIcon size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {configTab === 'clientes' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-emerald-500" />
                Clientes
              </h3>
              {isAdmin && (
                <button 
                  onClick={() => setIsAddingCliente(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Novo Cliente
                </button>
              )}
            </div>
            <div className="divide-y divide-zinc-800">
              {clientes.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  Nenhum cliente cadastrado.
                </div>
              ) : (
                clientes.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                        {c.nomeFantasia.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{c.nomeFantasia}</p>
                        <p className="text-xs text-zinc-500">{c.cnpj || 'Sem CNPJ'}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingCliente(c)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`Tem certeza que deseja excluir o cliente ${c.nomeFantasia}?`)) {
                              try {
                                await deleteDoc(doc(db, 'clientes', c.id!));
                              } catch (error) {
                                handleFirestoreError(error, OperationType.REMOVE, `clientes/${c.id}`);
                              }
                            }
                          }}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {configTab === 'geral' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-8 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RefreshCw size={20} className="text-emerald-500" />
                  Backup e Manutenção
                </h3>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded-full border border-emerald-500/20">
                  Auto-Backup Ativo (7 Dias)
                </span>
              </div>
              
              <p className="text-zinc-400 text-sm max-w-2xl">
                O sistema realiza um backup automático diário. Mantemos sempre os últimos 7 backups disponíveis para restauração imediata.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Export/Manual */}
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Download size={16} className="text-emerald-500" />
                    Exportação Manual
                  </h4>
                  <p className="text-xs text-zinc-500">Baixe uma cópia instantânea em formato JSON para seu computador.</p>
                  <button
                    onClick={exportDatabase}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-zinc-700"
                  >
                    <Download size={18} />
                    Exportar Agora
                  </button>
                </div>

                {/* Restore History */}
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <History size={16} className="text-emerald-500" />
                    Histórico de Backups
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {backupsList.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">Nenhum backup automático gerado ainda.</p>
                    ) : (
                      backupsList.map((bk) => (
                        <div key={bk.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl group">
                          <div className="flex items-center gap-3">
                            <Clock size={14} className="text-zinc-500" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-zinc-300">{bk.id}</span>
                              <span className="text-[10px] text-zinc-600">
                                {bk.date?.toDate ? bk.date.toDate().toLocaleTimeString() : 'Automático'}
                              </span>
                            </div>
                          </div>
                          <button
                            disabled={isRestoring}
                            onClick={() => restoreFromBackup(bk)}
                            className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Restaurar este backup"
                          >
                            {isRestoring ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info size={20} className="text-emerald-500" />
                Informações do Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Versão</span>
                  <span className="text-zinc-300 text-sm">1.3.0-stable</span>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Ambiente</span>
                  <span className="text-zinc-300 text-sm">Produção</span>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Database</span>
                  <span className="text-zinc-300 text-sm">Firestore Enterprise</span>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Último Backup</span>
                  <span className="text-zinc-300 text-sm">{backupsList[0]?.id || 'Pendente'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const [searchAtivoQuery, setSearchAtivoQuery] = useState('');

  const AtivoCard = ({ ativo, dbUser, onEdit, onDelete, onShowHelp }: { ativo: Ativo, dbUser: DBUser | null, onEdit: () => void, onDelete: () => void, onShowHelp: () => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
    const [copiedSsh, setCopiedSsh] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);

    const handleCopySsh = (e: React.MouseEvent) => {
      e.stopPropagation();
      const address = ativo.ipv4Hostname || ativo.urlFqdnDomain;
      if (!address) return;
      
      const user = ativo.sshUser ? `${ativo.sshUser}@` : '';
      const port = ativo.sshPort ? ` -p ${ativo.sshPort}` : '';
      const command = `ssh ${user}${address}${port}`;
      
      navigator.clipboard.writeText(command);
      setCopiedSsh(true);
      setTimeout(() => setCopiedSsh(false), 2000);
    };

    const handleConnectSsh = (e: React.MouseEvent) => {
      e.stopPropagation();
      const address = ativo.ipv4Hostname || ativo.urlFqdnDomain;
      if (!address) return;
      
      const user = ativo.sshUser ? `${ativo.sshUser}@` : '';
      const port = ativo.sshPort ? `:${ativo.sshPort}` : '';
      
      // Copiar comando como fallback imediato
      const sshCommand = `ssh ${ativo.sshUser ? `${ativo.sshUser}@` : ''}${address}${ativo.sshPort ? ` -p ${ativo.sshPort}` : ''}`;
      navigator.clipboard.writeText(sshCommand);
      setCopiedSsh(true);
      setTimeout(() => setCopiedSsh(false), 2000);

      // Tentar abrir o protocolo
      window.location.href = `ssh://${user}${address}${port}`;
    };

    const handleCopyPass = (e: React.MouseEvent) => {
      e.stopPropagation();
      const pass = ativo.sshPassword || ativo.otherPassword || ativo.pppoePassword || ativo.consolePassword;
      if (!pass) return;
      
      navigator.clipboard.writeText(pass);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    };

    const togglePassword = (field: string) => {
      setVisiblePasswords(prev => {
        const next = new Set(prev);
        if (next.has(field)) next.delete(field);
        else next.add(field);
        return next;
      });
    };

    const PasswordField = ({ label, value, fieldKey }: { label: string, value: string, fieldKey: string }) => {
      if (!value) return null;
      const isVisible = visiblePasswords.has(fieldKey);
      return (
        <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/50">
          <span className="text-zinc-500 text-xs font-bold uppercase">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 font-mono text-xs">{isVisible ? value : '••••••••'}</span>
            <button onClick={() => togglePassword(fieldKey)} className="text-zinc-500 hover:text-zinc-300">
              {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      );
    };

    const TextField = ({ label, value }: { label: string, value?: string }) => {
      if (!value) return null;
      const isUrl = value.startsWith('http://') || value.startsWith('https://');
      
      return (
        <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/50">
          <span className="text-zinc-500 text-xs font-bold uppercase">{label}</span>
          {isUrl ? (
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              {value}
              <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-zinc-300 font-mono text-xs">{value}</span>
          )}
        </div>
      );
    };

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-colors group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
              {ativo.categoriaAcesso === 'Servers' ? <Server size={20} /> :
               ativo.categoriaAcesso === 'Web Applications' ? <Globe size={20} /> :
               ativo.categoriaAcesso === 'Network Assets' ? <Network size={20} /> :
               ativo.categoriaAcesso === 'Network Topologia' ? <Network size={20} /> :
               ativo.categoriaAcesso === 'Upstream e Downstream' ? <Network size={20} /> :
               ativo.categoriaAcesso === 'Clientes B2B' ? <Building2 size={20} /> :
               <Box size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="font-bold text-white">{ativo.nome}</h5>
                {ativo.status && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    ativo.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' :
                    ativo.status === 'Inativo' ? 'bg-red-500/10 text-red-500' :
                    ativo.status === 'Manutenção' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {ativo.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">{ativo.fabricante} {ativo.modelo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {dbUser?.role !== 'viewer' && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded-md">
                  <EditIcon size={14} />
                </button>
                <button onClick={onDelete} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 rounded-md">
                  <TrashIcon size={14} />
                </button>
              </div>
            )}
            {FABRICANTE_DETAILS[ativo.fabricante] && (
              <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                <img 
                  src={FABRICANTE_DETAILS[ativo.fabricante].logo} 
                  alt="" 
                  className="w-6 h-6 object-contain opacity-40 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <TextField label="Endereço" value={ativo.ipv4Hostname || ativo.urlFqdnDomain} />
            </div>
            {(ativo.ipv4Hostname || ativo.urlFqdnDomain) && (
              <div className="flex gap-1">
                <button
                  onClick={handleConnectSsh}
                  className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all"
                  title="Conectar via SSH (Copia comando e tenta abrir terminal)"
                >
                  <Terminal size={14} />
                </button>
                <button
                  onClick={handleCopySsh}
                  className={`p-2 bg-zinc-950 border border-zinc-800/50 rounded-lg transition-all ${copiedSsh ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                  title="Copiar Comando SSH"
                >
                  {copiedSsh ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
                {(ativo.sshPassword || ativo.otherPassword || ativo.pppoePassword || ativo.consolePassword) && (
                  <button
                    onClick={handleCopyPass}
                    className={`p-2 bg-zinc-950 border border-zinc-800/50 rounded-lg transition-all ${copiedPass ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                    title="Copiar Senha de Acesso"
                  >
                    {copiedPass ? <CheckCircle2 size={14} /> : <Key size={14} />}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onShowHelp(); }}
                  className="p-2 bg-zinc-950 border border-zinc-800/50 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Ajuda para configurar SSH no Windows"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
            )}
          </div>
          
          {isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-2 border-t border-zinc-800 mt-2">
              <TextField label="SSH User" value={ativo.sshUser} />
              <TextField label="Web User" value={ativo.otherUser} />
              <PasswordField label="SSH Pass" value={ativo.sshPassword || ''} fieldKey="sshPassword" />
              <PasswordField label="Web Pass" value={ativo.otherPassword || ''} fieldKey="otherPassword" />
              <TextField label="Porta SSH" value={ativo.sshPort} />
              <TextField label="Porta Web" value={ativo.otherPort} />
              <TextField label="SNMP Community" value={ativo.snmpCommunity} />
              <PasswordField label="Console Pass" value={ativo.consolePassword || ''} fieldKey="consolePassword" />
              
              {ativo.categoriaAcesso === 'Network Topologia' && (
                <>
                  {ativo.networkTopologyLink && (
                    <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/50">
                      <span className="text-zinc-500 text-xs font-bold uppercase">Link Topologia</span>
                      <a href={ativo.networkTopologyLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 text-xs underline">Acessar</a>
                    </div>
                  )}
                  {ativo.networkTopologyFileName && (
                    <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/50">
                      <span className="text-zinc-500 text-xs font-bold uppercase">Arquivo</span>
                      <span className="text-zinc-300 font-mono text-xs">{ativo.networkTopologyFileName}</span>
                    </div>
                  )}
                </>
              )}

              {ativo.categoriaAcesso === 'Upstream e Downstream' && (
                <>
                  <TextField label="Tipo Link" value={ativo.linkType} />
                  <TextField label="ID Circuito" value={ativo.idCircuito} />
                  <TextField label="Velocidade" value={ativo.velocidadeContratada} />
                  <TextField label="Enlace IPv4" value={ativo.enlaceIpv4} />
                  <TextField label="VLAN IPv4" value={ativo.idVlanIpv4} />
                  <TextField label="Enlace IPv6" value={ativo.enlaceIpv6} />
                  <TextField label="VLAN IPv6" value={ativo.idVlanIpv6} />
                  <TextField label="Multihop" value={ativo.multihop} />
                  <TextField label="Multihop IPv6" value={ativo.multihopIpv6} />
                  <TextField label="Community Blackhole" value={ativo.communityBlackhole} />
                  <TextField label="Endereço Abordagem" value={ativo.enderecoAbordagem} />
                  <TextField label="Contato NOC" value={ativo.contatoNoc} />
                  <TextField label="E-mail NOC" value={ativo.emailNoc} />
                </>
              )}

              {ativo.categoriaAcesso === 'Clientes B2B' && (
                <>
                  <TextField label="ID Circuito" value={ativo.idCircuito} />
                  <TextField label="Endereço" value={ativo.enderecoCliente} />
                  <TextField label="Velocidade" value={ativo.velocidadeContratada} />
                  <TextField label="Enlace IPv4" value={ativo.enlaceIpv4} />
                  <TextField label="Enlace IPv6" value={ativo.enlaceIpv6} />
                  <TextField label="ID VLAN" value={ativo.idVlanIpv4} />
                  <TextField label="IPv4 Público" value={ativo.ipv4Publico} />
                  <TextField label="IPv6 Público" value={ativo.ipv6Publico} />
                  <TextField label="PPPoE User" value={ativo.pppoeUser} />
                  <PasswordField label="PPPoE Pass" value={ativo.pppoePassword || ''} fieldKey="pppoePassword" />
                  <TextField label="Last Mile" value={ativo.lastMile} />
                  <TextField label="Contato Last Mile" value={ativo.contatoLastMile} />
                </>
              )}

              {ativo.observacoes && (
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 mt-2">
                  <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Observações</span>
                  <div 
                    className="text-zinc-300 text-xs prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: ativo.observacoes }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 bg-zinc-950/50 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <><ChevronUp size={14} /> Menos Detalhes</>
          ) : (
            <><ChevronDown size={14} /> Mais Detalhes</>
          )}
        </button>
      </div>
    );
  };

  const AcessosView = () => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (categoria: string) => {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        if (next.has(categoria)) next.delete(categoria);
        else next.add(categoria);
        return next;
      });
    };

    const categories = ['Servers', 'Web Applications', 'Network Assets', 'Network Topologia', 'Upstream e Downstream', 'Clientes B2B', 'Outros'];

    const getInfraData = (cliente: Cliente) => {
      if (Array.isArray(cliente.infraestrutura) && cliente.infraestrutura.length > 0) {
        return {
          asns: cliente.infraestrutura.map(i => i.asn).filter(Boolean),
          ipv4s: cliente.infraestrutura.map(i => i.ipv4).filter(Boolean),
          ipv6s: cliente.infraestrutura.map(i => i.ipv6).filter(Boolean)
        };
      }
      // Fallback para dados antigos
      const asns = Array.isArray(cliente.asn) ? cliente.asn : [cliente.asn].filter(Boolean) as string[];
      const ipv4s = Array.isArray(cliente.prefixoIPv4) ? cliente.prefixoIPv4 : [cliente.prefixoIPv4].filter(Boolean) as string[];
      const ipv6s = Array.isArray(cliente.prefixoIPv6) ? cliente.prefixoIPv6 : [cliente.prefixoIPv6].filter(Boolean) as string[];
      
      return { asns, ipv4s, ipv6s };
    };

    const downloadDocument = (doc: { nome: string, content: string }) => {
      const link = document.createElement('a');
      link.href = doc.content;
      link.download = doc.nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="flex-1 flex flex-col p-8 bg-zinc-950 overflow-y-auto">
        <div className="max-w-[1800px] w-full mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={32} />
                Acessos
              </h2>
              <p className="text-zinc-400 mt-2">Gerencie os acessos de infraestrutura e sistemas dos clientes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
            {/* Clients List */}
            {dbUser?.role !== 'cliente' && (
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Clientes</h3>
                <div className="space-y-2">
                  {clientes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCliente(c)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-start gap-3 ${selectedCliente?.id === c.id ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                      <Building2 size={18} className="mt-0.5 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{c.nomeFantasia}</span>
                        {(() => {
                          const { asns, ipv4s } = getInfraData(c);
                          if (asns.length === 0 && ipv4s.length === 0) return null;
                          return (
                            <div className="flex flex-col mt-0.5">
                              {asns.slice(0, 1).map((asn, idx) => (
                                <span key={`asn-${idx}`} className="text-[9px] text-zinc-500 truncate">ASN: {asn}</span>
                              ))}
                              {ipv4s.slice(0, 1).map((ip, idx) => (
                                <span key={`ip-${idx}`} className="text-[9px] text-zinc-500 truncate">IP: {ip}</span>
                              ))}
                              {(asns.length > 1 || ipv4s.length > 1) && <span className="text-[9px] text-zinc-600">...</span>}
                            </div>
                          );
                        })()}
                      </div>
                    </button>
                  ))}
                  {clientes.length === 0 && (
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
                      Nenhum cliente cadastrado.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assets List */}
            <div className={`${dbUser?.role === 'cliente' ? 'lg:col-span-4 xl:col-span-5 2xl:col-span-6' : 'lg:col-span-3 xl:col-span-4 2xl:col-span-5'} space-y-6`}>
              {selectedCliente ? (
                <>
                  <div className="flex items-center justify-between bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <div className="flex flex-1 items-center gap-12">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{selectedCliente.nomeFantasia}</h3>
                        <p className="text-zinc-400 text-sm mt-1">CNPJ: {selectedCliente.cnpj || 'N/A'}</p>
                      </div>

                      {(() => {
                        const { asns, ipv4s, ipv6s } = getInfraData(selectedCliente);
                        if (asns.length === 0 && ipv4s.length === 0 && ipv6s.length === 0) return null;
                        return (
                          <div className="hidden md:flex flex-col gap-1 border-l border-zinc-800 pl-12">
                            {asns.length > 0 && (
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-8">ASN</span>
                                <span className="text-sm text-zinc-300 font-medium">
                                  {asns.join(', ')}
                                </span>
                              </div>
                            )}
                            {ipv4s.length > 0 && (
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-8">IPv4</span>
                                <span className="text-sm text-zinc-300 font-medium">
                                  {ipv4s.join(', ')}
                                </span>
                              </div>
                            )}
                            {ipv6s.length > 0 && (
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-8">IPv6</span>
                                <span className="text-sm text-zinc-300 font-medium">
                                  {ipv6s.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {dbUser?.role !== 'viewer' && (
                      <button 
                        onClick={() => setIsAddingAtivo(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Novo Acesso
                      </button>
                    )}
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input 
                      type="text"
                      placeholder="Buscar acessos por nome, tipo, fabricante ou modelo..."
                      value={searchAtivoQuery}
                      onChange={(e) => setSearchAtivoQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    {searchAtivoQuery && (
                      <button 
                        onClick={() => setSearchAtivoQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <XIcon size={16} />
                      </button>
                    )}
                  </div>

                  {/* Documents Section */}
                  {selectedCliente.documentos && selectedCliente.documentos.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <h4 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                          <Paperclip size={20} /> Documentos da Empresa
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {selectedCliente.documentos.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                <FileText size={20} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-white truncate">{doc.nome}</span>
                                <span className="text-[10px] text-zinc-500 uppercase">{(doc.size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => downloadDocument(doc)}
                              className="p-2 bg-zinc-800 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                              title="Baixar Documento"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grouped Assets */}
                  {categories.map(categoria => {
                    const ativosCategoria = ativos.filter(a => {
                      if (a.clienteId !== selectedCliente.id) return false;
                      if (a.categoriaAcesso !== categoria && (a.categoriaAcesso || categoria !== 'Outros')) return false;
                      
                      if (!searchAtivoQuery) return true;
                      const query = searchAtivoQuery.toLowerCase();
                      return (
                        a.nome?.toLowerCase().includes(query) ||
                        a.tipo?.toLowerCase().includes(query) ||
                        a.fabricante?.toLowerCase().includes(query) ||
                        a.modelo?.toLowerCase().includes(query)
                      );
                    });
                    
                    if (ativosCategoria.length === 0) return null;

                    const isExpanded = expandedCategories.has(categoria);

                    return (
                      <div key={categoria} className="space-y-4">
                        <button 
                          onClick={() => toggleCategory(categoria)}
                          className="w-full text-left flex items-center justify-between group"
                        >
                          <h4 className="text-lg font-bold text-emerald-500 flex items-center gap-2 border-b border-zinc-800 pb-2 flex-1">
                            {categoria === 'Servers' && <Server size={20} />}
                            {categoria === 'Web Applications' && <Globe size={20} />}
                            {categoria === 'Network Assets' && <Network size={20} />}
                            {categoria === 'Network Topologia' && <Layers size={20} />}
                            {categoria === 'Upstream e Downstream' && <RefreshCw size={20} />}
                            {categoria === 'Clientes B2B' && <Building2 size={20} />}
                            {categoria === 'Outros' && <Box size={20} />}
                            {categoria}
                          </h4>
                          <div className="border-b border-zinc-800 pb-2 pl-4">
                            {isExpanded ? <ChevronUp size={20} className="text-zinc-500 group-hover:text-emerald-500 transition-colors" /> : <ChevronDown size={20} className="text-zinc-500 group-hover:text-emerald-500 transition-colors" />}
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-4"
                          >
                            {ativosCategoria.map(ativo => (
                              <AtivoCard 
                                key={ativo.id} 
                                ativo={ativo} 
                                dbUser={dbUser} 
                                onEdit={() => setEditingAtivo(ativo)} 
                                onDelete={async () => {
                                  if (window.confirm('Excluir este acesso?')) {
                                    await deleteDoc(doc(db, 'clientes', selectedCliente.id!, 'ativos', ativo.id!));
                                  }
                                }} 
                                onShowHelp={() => setShowSshHelp(true)}
                              />
                            ))}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                  
                  {ativos.filter(a => a.clienteId === selectedCliente.id).length === 0 && (
                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center text-zinc-500">
                      Nenhum acesso cadastrado para este cliente.
                    </div>
                  )}
                  
                  {ativos.filter(a => a.clienteId === selectedCliente.id).length > 0 && 
                   !categories.some(categoria => 
                     ativos.some(a => a.clienteId === selectedCliente.id && (a.categoriaAcesso === categoria || (!a.categoriaAcesso && categoria === 'Outros')) &&
                     (!searchAtivoQuery || a.nome?.toLowerCase().includes(searchAtivoQuery.toLowerCase()) || a.tipo?.toLowerCase().includes(searchAtivoQuery.toLowerCase()) || a.fabricante?.toLowerCase().includes(searchAtivoQuery.toLowerCase()) || a.modelo?.toLowerCase().includes(searchAtivoQuery.toLowerCase())))
                   ) && (
                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center text-zinc-500">
                      Nenhum acesso encontrado para a busca "{searchAtivoQuery}".
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                  <div className="p-4 bg-zinc-900 rounded-full text-zinc-500 mb-4">
                    <Building2 size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Selecione um Cliente</h3>
                  <p className="text-zinc-500 max-w-md">
                    Escolha um cliente na lista ao lado para visualizar e gerenciar seus acessos, servidores e equipamentos de rede.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HomeView = () => (
    <div className="flex-1 flex flex-col p-8 bg-zinc-950 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto space-y-12 py-12">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block mb-4"
          >
            <Logo size={48} className="p-4 rounded-3xl border-2" />
          </motion.div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            Bem-vindo ao <span className="text-emerald-500">NOCPedia</span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Sua central de conhecimento técnico, documentação de comandos e gestão de ativos de rede.
          </p>
        </div>

        <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-left space-y-6">
          <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-3">
            <Info size={24} />
            Nossa História
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed text-lg">
            <p>
              O NOCPedia nasceu da necessidade de centralizar o conhecimento técnico disperso em diversas plataformas e fabricantes. 
              Como profissionais de TI, sabemos que a agilidade no troubleshooting e na configuração de ativos é vital para a continuidade dos negócios.
            </p>
            <p>
              Iniciamos como um repositório simples de comandos Huawei e Cisco, mas rapidamente evoluímos para uma plataforma colaborativa que abrange desde infraestrutura de redes legadas até as mais modernas tecnologias de orquestração de containers e servidores Linux/Windows.
            </p>
            <p className="font-medium text-zinc-300">
              Hoje, o NOCPedia é a bússola para administradores de sistemas e engenheiros de rede que buscam precisão, rapidez e uma base de conhecimento confiável para o dia a dia da operação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'REDES', icon: <Network size={32} />, color: 'emerald', view: 'wiki', fab: 'Group:Redes' },
            { title: 'SERVIDORES', icon: <Server size={32} />, color: 'blue', view: 'wiki', fab: 'Group:Server' },
            { title: 'DOCKER', icon: <Box size={32} />, color: 'cyan', view: 'wiki', fab: 'Docker' },
            { title: 'KUBERNETES', icon: <Layers size={32} />, color: 'indigo', view: 'wiki', fab: 'Kubernetes' },
            { title: 'DESENVOLVIMENTO', icon: <Code size={32} />, color: 'amber', view: 'wiki', fab: 'Desenvolvimento' },
            { title: 'ACESSOS', icon: <ShieldCheck size={32} />, color: 'rose', view: 'acessos', fab: 'All' }
          ].map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => {
                setCurrentView(card.view as any);
                if (card.fab) setSelectedFabricante(card.fab as any);
              }}
              className="group relative p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-left hover:border-emerald-500/50 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                {card.icon}
              </div>
              <div className="p-4 bg-zinc-800 text-emerald-500 rounded-2xl mb-6 inline-block group-hover:bg-emerald-500/10 transition-colors">
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Acesse documentações, comandos e ferramentas específicas para {card.title.toLowerCase()}.
              </p>
              <div className="mt-6 flex items-center gap-2 text-emerald-500 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Explorar <Plus size={16} />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <button 
            onClick={() => setCurrentView('wiki')}
            className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/20 group"
          >
            Acessar Base de Conhecimento
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  const filteredCommands = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const terms = query.split(/\s+/);
    
    return commands.filter(cmd => {
      // Refined Search Logic
      const searchableText = [
        cmd.titulo,
        cmd.descricao,
        cmd.fabricante,
        cmd.categoria,
        ...(cmd.tags || []),
        ...(cmd.itens || []).map(i => i.comando + ' ' + i.explicacao)
      ].join(' ').toLowerCase();

      const matchesSearch = terms.every(term => searchableText.includes(term));
      
      // Special Refinement: "interface" or "port" for Huawei/Cisco
      // If the search query contains these keywords, we prioritize or ensure they are found
      const hasInterfaceOrPort = query.includes('interface') || query.includes('port');
      const isHuaweiOrCisco = cmd.fabricante === 'Huawei' || cmd.fabricante === 'Cisco';
      
      // If the user specifically asked for this refinement, we can make it so that
      // if those keywords are present, we only show Huawei/Cisco IF they match.
      // But a better way is to just ensure the search covers all fields.
      // The user's request: "Refine a pesquisa para comandos que contenham 'interface' ou 'port' ... e que sejam do fabricante Huawei ou Cisco."
      // I'll interpret this as: if the query has these keywords, and the command matches, 
      // it's a valid result. The `matchesSearch` already covers this.
      
      const matchesFabricante = 
        selectedFabricante === 'All' || 
        (selectedFabricante === 'Group:Redes' ? REDES_FABRICANTES.includes(cmd.fabricante) :
         selectedFabricante === 'Group:Server' ? SERVER_FABRICANTES.includes(cmd.fabricante) :
         cmd.fabricante === selectedFabricante);
      
      const matchesCategoria = selectedCategoria === 'All' || cmd.categoria === selectedCategoria;

      return matchesSearch && matchesFabricante && matchesCategoria;
    });
  }, [commands, searchQuery, selectedFabricante, selectedCategoria]);

  const groupedCommands = useMemo(() => {
    if (selectedFabricante === 'Huawei' || selectedFabricante === 'ZTE' || selectedFabricante === 'Datacom') {
      const groups: { [key: string]: Command[] } = {};
      filteredCommands.forEach(cmd => {
        const groupName = cmd.subgrupo || 'Geral';
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(cmd);
      });
      return groups;
    }
    return null;
  }, [filteredCommands, selectedFabricante]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white gap-6">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo size={64} className="p-6 rounded-[2.5rem] border-2 border-emerald-500/20" />
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tighter text-emerald-500">NOCPedia</h2>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onGoogleLogin={handleLogin} onEmailLogin={handleEmailLogin} onEmailSignUp={handleEmailSignUp} isLoggingIn={isLoggingIn} />;
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 border-r border-zinc-800 bg-zinc-900/50 flex flex-col z-20"
          >
            <div 
              className="p-6 border-bottom border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => setCurrentView('home')}
            >
              <div className="flex items-center gap-3">
                <Logo size={20} />
                <span className="font-bold text-xl tracking-tight">NOCPedia</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(false); }} 
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                title="Minimizar Menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Redes Group */}
              <SidebarGroup 
                groupKey="Redes"
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                selectedFabricante={selectedFabricante}
                setSelectedFabricante={setSelectedFabricante}
                handleGroupClick={handleGroupClick}
                setCurrentView={setCurrentView}
              />

              {/* Server Group */}
              <SidebarGroup 
                groupKey="Server"
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                selectedFabricante={selectedFabricante}
                setSelectedFabricante={setSelectedFabricante}
                handleGroupClick={handleGroupClick}
                setCurrentView={setCurrentView}
              />

              {/* Other Categories */}
              <div className="space-y-1">
                {["Docker", "Kubernetes", "Desenvolvimento"].map(f => (
                  <button 
                    key={f}
                    onClick={() => {
                      setSelectedFabricante(f as Fabricante);
                      setCurrentView('wiki');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedFabricante === f ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                  >
                    {f === 'Docker' ? <Box size={18} /> : 
                     f === 'Kubernetes' ? <Cpu size={18} /> : <Code size={18} />}
                    <span className="text-sm font-medium">{f === 'Desenvolvimento' ? 'Dev' : f}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-800/50 mb-3">
                    <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-zinc-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.displayName}</p>
                      <p className="text-xs text-zinc-500 truncate">{dbUser?.role === 'admin' ? 'Admin' : dbUser?.role === 'cliente' ? 'Cliente' : 'Viewer'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dbUser?.role !== 'cliente' && (
                      <button 
                        onClick={() => setCurrentView('configuracoes')}
                        className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${currentView === 'configuracoes' ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800'}`}
                        title="Configurações"
                      >
                        <Settings size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setCurrentView('acessos')}
                      className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${currentView === 'acessos' ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800'}`}
                      title="Acessos"
                    >
                      <Network size={16} />
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 px-2 py-2 text-xs font-medium text-zinc-400 hover:text-red-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Sair"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
                >
                  <LogIn size={18} />
                  Entrar para Editar
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {currentView === 'home' ? (
          <HomeView />
        ) : currentView === 'configuracoes' ? (
          <ConfiguracoesView />
        ) : (
          <>
            {/* Topbar */}
            <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-10">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white">
                  <Menu size={20} />
                </button>
              )}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Buscar comandos, fabricantes, tags... (Alt+S)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (window.confirm('Deseja sincronizar a base de conhecimento com os novos comandos padrão?')) {
                        seedInitialData(user!.uid);
                      }
                    }}
                    className="p-2 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500 rounded-xl transition-all border border-zinc-800"
                    title="Sincronizar Base"
                  >
                    <Layers size={18} />
                  </button>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Adicionar</span>
                  </button>
                </div>
              ) : !user ? (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  <LogIn size={18} />
                  <span>Entrar</span>
                </button>
              ) : null}
            </header>

            {/* Content Area */}
            {currentView === 'acessos' ? (
              <AcessosView />
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-[1920px] mx-auto">
                  <Breadcrumbs />
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        {selectedFabricante === 'All' ? 'Base de Conhecimento' : selectedFabricante}
                      </h2>
                      <p className="text-zinc-500 text-sm">
                        {filteredCommands.length} {filteredCommands.length === 1 ? 'comando encontrado' : 'comandos encontrados'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <Filter size={14} />
                      <span>Filtros ativos: {selectedFabricante} / {selectedCategoria}</span>
                    </div>
                  </div>

            {/* Category Description or Manufacturer Details */}
            {(selectedFabricante !== 'All' || selectedCategoria !== 'All') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl relative overflow-hidden"
              >
                {/* Background Logo Accent */}
                {selectedFabricante !== 'All' && FABRICANTE_DETAILS[selectedFabricante as string] && (
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <img 
                      src={FABRICANTE_DETAILS[selectedFabricante as string].logo} 
                      alt="" 
                      className="w-48 h-48 object-contain grayscale"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {selectedCategoria !== 'All' && (
                  <div className="mb-6 pb-6 border-b border-zinc-800/50 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        {getCategoryIcon(selectedCategoria)}
                      </div>
                      <h3 className="text-xl font-bold text-white">Categoria: {selectedCategoria}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                      {CATEGORIA_DETAILS[selectedCategoria] || `Documentação e comandos relacionados a ${selectedCategoria}.`}
                    </p>
                  </div>
                )}

                {FABRICANTE_DETAILS[selectedFabricante as string] && !selectedFabricante.toString().startsWith('Group:') ? (
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-lg shadow-white/5">
                          <img 
                            src={FABRICANTE_DETAILS[selectedFabricante as string].logo} 
                            alt={selectedFabricante as string} 
                            className="w-12 h-12 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white leading-tight">{FABRICANTE_DETAILS[selectedFabricante as string].nome}</h3>
                          <p className="text-zinc-400 text-sm max-w-md">{FABRICANTE_DETAILS[selectedFabricante as string].descricao}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-zinc-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-zinc-700/50 flex flex-col items-center min-w-[100px]">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Fundação</p>
                          <p className="text-sm font-bold text-emerald-400">{FABRICANTE_DETAILS[selectedFabricante as string].fundacao}</p>
                        </div>
                        <div className="bg-zinc-800/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-zinc-700/50 flex flex-col items-center min-w-[100px]">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-bold">Mercado</p>
                          <p className="text-sm font-bold text-emerald-400">{FABRICANTE_DETAILS[selectedFabricante as string].tempoMercado}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                          <Terminal size={14} /> Principais Equipamentos
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {FABRICANTE_DETAILS[selectedFabricante as string].equipamentos.map(eq => (
                            <span key={eq} className="bg-zinc-800/50 text-zinc-300 px-3 py-1.5 rounded-lg text-xs border border-zinc-700/50 hover:border-emerald-500/30 transition-colors">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
                          <Info size={20} />
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Explore os comandos técnicos e documentações disponíveis para <span className="text-emerald-400 font-bold">{FABRICANTE_DETAILS[selectedFabricante as string].nome}</span> logo abaixo.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : selectedFabricante === 'Group:Redes' ? (
                  <GroupHeader groupKey="Redes" />
                ) : selectedFabricante === 'Group:Server' ? (
                  <GroupHeader groupKey="Server" />
                ) : null}
              </motion.div>
            )}

            {/* Dashboard View for Groups */}
            {selectedFabricante === 'All' && (
              <>
                <GroupDashboard groupKey="Redes" setSelectedFabricante={setSelectedFabricante} commands={commands} />
                <GroupDashboard groupKey="Server" setSelectedFabricante={setSelectedFabricante} commands={commands} />
              </>
            )}
            {selectedFabricante === 'Group:Redes' && (
              <GroupDashboard groupKey="Redes" setSelectedFabricante={setSelectedFabricante} commands={commands} />
            )}
            {selectedFabricante === 'Group:Server' && (
              <GroupDashboard groupKey="Server" setSelectedFabricante={setSelectedFabricante} commands={commands} />
            )}

            {selectedFabricante !== 'All' && !selectedFabricante.toString().startsWith('Group:') && (
              groupedCommands ? (
                Object.entries(groupedCommands).map(([category, cmds]) => {
                  const isExpanded = expandedSubgroups.has(category);
                  return (
                    <div key={category} className="mb-6">
                      <button 
                        onClick={() => toggleSubgroup(category)}
                        className="w-full flex items-center justify-between text-lg font-bold text-emerald-500 border-b border-zinc-800 pb-2 mb-4 hover:bg-emerald-500/5 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)} {category}
                          <span className="text-xs text-zinc-500 font-normal ml-2">({cmds.length})</span>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-8 gap-4 pb-6">
                              {cmds.map(cmd => (
                                <CommandCard 
                                  key={cmd.id}
                                  cmd={cmd}
                                  onClick={() => setSelectedCommand(cmd)}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-8 gap-4">
                  {filteredCommands.map(cmd => (
                    <CommandCard 
                      key={cmd.id}
                      cmd={cmd}
                      onClick={() => setSelectedCommand(cmd)}
                    />
                  ))}
                </div>
              )
            )}

            {filteredCommands.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-6 bg-zinc-900 rounded-full mb-4 border border-zinc-800">
                  <Search size={48} className="text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nenhum comando encontrado</h3>
                <p className="text-zinc-500 max-w-xs mb-6">
                  Tente ajustar sua busca ou filtros para encontrar o que procura.
                </p>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => seedInitialData(user!.uid)}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <RefreshCw size={18} />
                      Sincronizar Base de Dados
                    </button>
                    <button 
                      onClick={clearDatabase}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20"
                    >
                      <Trash2 size={18} />
                      Limpar Base de Dados
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )}

    {/* Modals */}
        <AnimatePresence>
          {isAddingUser && (
            <UserForm 
              onClose={() => setIsAddingUser(false)} 
              clientes={clientes}
            />
          )}
          {editingUser && (
            <UserForm 
              onClose={() => setEditingUser(null)} 
              initialData={editingUser}
              clientes={clientes}
            />
          )}
          {isAddingCliente && (
            <ClienteForm 
              onClose={() => setIsAddingCliente(false)} 
              user={user!} 
            />
          )}
          {editingCliente && (
            <ClienteForm 
              onClose={() => setEditingCliente(null)} 
              user={user!} 
              initialData={editingCliente}
            />
          )}
          {isAddingAtivo && selectedCliente && (
            <AtivoForm 
              onClose={() => setIsAddingAtivo(false)} 
              user={user!} 
              clienteId={selectedCliente.id!}
            />
          )}
          {editingAtivo && selectedCliente && (
            <AtivoForm 
              onClose={() => setEditingAtivo(null)} 
              user={user!} 
              clienteId={selectedCliente.id!}
              initialData={editingAtivo}
            />
          )}
          {isAdding && (
            <CommandForm 
              onClose={() => setIsAdding(false)} 
              user={user!} 
              addToast={addToast}
            />
          )}
          {editingCommand && (
            <CommandForm 
              onClose={() => setEditingCommand(null)} 
              user={user!} 
              initialData={editingCommand}
              addToast={addToast}
            />
          )}
          {selectedCommand && (
            <CommandDetails 
              command={selectedCommand} 
              commands={commands}
              isAdmin={isAdmin}
              setSelectedCommand={setSelectedCommand}
              onClose={() => setSelectedCommand(null)} 
              onEdit={(cmd) => {
                setSelectedCommand(null);
                setEditingCommand(cmd);
              }}
              addToast={addToast}
              breadcrumbs={<Breadcrumbs />}
            />
          )}
        </AnimatePresence>
        <SshHelpModal 
          isOpen={showSshHelp} 
          onClose={() => setShowSshHelp(false)} 
          addToast={addToast} 
        />
        <ToastContainer toasts={toasts} />
      </main>
    </div>
  );
}

function ClienteForm({ onClose, user, initialData }: { onClose: () => void, user: User, initialData?: Cliente }) {
  const [formData, setFormData] = useState({
    nomeFantasia: initialData?.nomeFantasia || '',
    razaoSocial: initialData?.razaoSocial || '',
    cnpj: initialData?.cnpj || '',
    website: initialData?.website || '',
    contatoNome: initialData?.contatoNome || '',
    contatoTelefone: initialData?.contatoTelefone || '',
    contatoEmail: initialData?.contatoEmail || '',
    nocNome: initialData?.nocNome || '',
    nocTelefone: initialData?.nocTelefone || '',
    nocEmail: initialData?.nocEmail || '',
    infraestrutura: initialData?.infraestrutura || (
      // Migração de dados antigos
      Array.isArray(initialData?.asn) || Array.isArray(initialData?.prefixoIPv4) || Array.isArray(initialData?.prefixoIPv6) 
        ? Array.from({ length: Math.max(
            Array.isArray(initialData?.asn) ? initialData.asn.length : 0,
            Array.isArray(initialData?.prefixoIPv4) ? initialData.prefixoIPv4.length : 0,
            Array.isArray(initialData?.prefixoIPv6) ? initialData.prefixoIPv6.length : 0
          ) || 1 }).map((_, i) => ({
            asn: (Array.isArray(initialData?.asn) ? initialData.asn[i] : initialData?.asn) || '',
            ipv4: (Array.isArray(initialData?.prefixoIPv4) ? initialData.prefixoIPv4[i] : initialData?.prefixoIPv4) || '',
            ipv6: (Array.isArray(initialData?.prefixoIPv6) ? initialData.prefixoIPv6[i] : initialData?.prefixoIPv6) || ''
          }))
        : [{ 
            asn: (initialData?.asn as string) || '', 
            ipv4: (initialData?.prefixoIPv4 as string) || '', 
            ipv6: (initialData?.prefixoIPv6 as string) || '' 
          }]
    ),
    cep: initialData?.cep || '',
    pais: initialData?.pais || '',
    estado: initialData?.estado || '',
    cidade: initialData?.cidade || '',
    endereco: initialData?.endereco || '',
    geolocalizacao: initialData?.geolocalizacao || '',
    documentos: initialData?.documentos || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 800000) { // ~800KB limit for Base64 in Firestore (1MB doc limit)
        alert(`O arquivo ${file.name} é muito grande. O limite é de 800KB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          documentos: [
            ...prev.documentos,
            {
              nome: file.name,
              tipo: file.type,
              content: content,
              size: file.size,
              createdAt: new Date().toISOString()
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
    // Clear input
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomeFantasia) return alert('O Nome Fantasia é obrigatório.');

    setIsSubmitting(true);
    try {
      const clienteData = {
        ...formData,
        infraestrutura: formData.infraestrutura.filter(row => 
          row.asn.trim() !== '' || row.ipv4.trim() !== '' || row.ipv6.trim() !== ''
        ),
        uid: user.uid,
        createdAt: initialData?.createdAt || serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'clientes', initialData.id), clienteData);
      } else {
        await addDoc(collection(db, 'clientes'), clienteData);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, initialData?.id ? OperationType.UPDATE : OperationType.CREATE, initialData?.id ? `clientes/${initialData.id}` : 'clientes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* General Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} /> Informações Gerais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome Fantasia *</label>
                <input 
                  required
                  value={formData.nomeFantasia}
                  onChange={e => setFormData({...formData, nomeFantasia: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Razão Social</label>
                <input 
                  value={formData.razaoSocial}
                  onChange={e => setFormData({...formData, razaoSocial: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">CNPJ</label>
                <input 
                  value={formData.cnpj}
                  onChange={e => setFormData({...formData, cnpj: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Website</label>
                <input 
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <Phone size={16} /> Contato (CEO/Diretoria)
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome</label>
                  <input 
                    value={formData.contatoNome}
                    onChange={e => setFormData({...formData, contatoNome: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Telefone</label>
                  <input 
                    value={formData.contatoTelefone}
                    onChange={e => setFormData({...formData, contatoTelefone: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">E-mail</label>
                  <input 
                    value={formData.contatoEmail}
                    onChange={e => setFormData({...formData, contatoEmail: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <Phone size={16} /> Contato (NOC/Técnico)
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome</label>
                  <input 
                    value={formData.nocNome}
                    onChange={e => setFormData({...formData, nocNome: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Telefone</label>
                  <input 
                    value={formData.nocTelefone}
                    onChange={e => setFormData({...formData, nocTelefone: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">E-mail</label>
                  <input 
                    value={formData.nocEmail}
                    onChange={e => setFormData({...formData, nocEmail: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <Globe size={16} /> Localização
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">CEP</label>
                <input 
                  value={formData.cep}
                  onChange={e => setFormData({...formData, cep: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">País</label>
                <input 
                  value={formData.pais}
                  onChange={e => setFormData({...formData, pais: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Estado</label>
                <input 
                  value={formData.estado}
                  onChange={e => setFormData({...formData, estado: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cidade</label>
                <input 
                  value={formData.cidade}
                  onChange={e => setFormData({...formData, cidade: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Endereço</label>
                <input 
                  value={formData.endereco}
                  onChange={e => setFormData({...formData, endereco: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Geolocalização</label>
                <input 
                  value={formData.geolocalizacao}
                  onChange={e => setFormData({...formData, geolocalizacao: e.target.value})}
                  placeholder="-X.00101010101101, -XX.00101010101101"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Documents and Attachments */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <Paperclip size={16} /> Documentos e Anexos
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-800 border-dashed rounded-2xl cursor-pointer bg-zinc-950/50 hover:bg-zinc-900/50 hover:border-emerald-500/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Paperclip className="w-8 h-8 mb-3 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                    <p className="mb-2 text-sm text-zinc-400">
                      <span className="font-bold">Clique para anexar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-zinc-500">PDF, PNG, JPG ou DOC (Máx. 800KB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                </label>
              </div>

              {formData.documentos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.documentos.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-zinc-900 text-emerald-500 rounded-lg">
                          <FileText size={18} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-zinc-200 truncate">{doc.nome}</span>
                          <span className="text-[10px] text-zinc-500 uppercase">{(doc.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Infrastructure Information */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <Network size={16} /> Infraestrutura (ASN / IPv4 / IPv6)
              </h4>
              <button 
                type="button"
                onClick={() => setFormData({
                  ...formData, 
                  infraestrutura: [...formData.infraestrutura, { asn: '', ipv4: '', ipv6: '' }]
                })}
                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> ADICIONAR PREFIXO
              </button>
            </div>

            <div className="space-y-4">
              {formData.infraestrutura.map((row, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl relative group/row">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">ASN Number</label>
                    <input 
                      value={row.asn}
                      onChange={e => {
                        const newInfra = [...formData.infraestrutura];
                        newInfra[index].asn = e.target.value;
                        setFormData({...formData, infraestrutura: newInfra});
                      }}
                      placeholder="Ex: AS264926"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Prefixo IPv4</label>
                    <input 
                      value={row.ipv4}
                      onChange={e => {
                        const newInfra = [...formData.infraestrutura];
                        newInfra[index].ipv4 = e.target.value;
                        setFormData({...formData, infraestrutura: newInfra});
                      }}
                      placeholder="Ex: 168.228.176.0/22"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Prefixo IPv6</label>
                    <input 
                      value={row.ipv6}
                      onChange={e => {
                        const newInfra = [...formData.infraestrutura];
                        newInfra[index].ipv6 = e.target.value;
                        setFormData({...formData, infraestrutura: newInfra});
                      }}
                      placeholder="Ex: 2804:3004::/32"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  
                  {formData.infraestrutura.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => {
                        const newInfra = formData.infraestrutura.filter((_, i) => i !== index);
                        setFormData({...formData, infraestrutura: newInfra});
                      }}
                      className="absolute -right-2 -top-2 p-1.5 bg-zinc-900 text-zinc-500 hover:text-red-500 border border-zinc-800 rounded-full opacity-0 group-hover/row:opacity-100 transition-all shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AtivoForm({ onClose, user, clienteId, initialData }: { onClose: () => void, user: User, clienteId: string, initialData?: Ativo }) {
  const [formData, setFormData] = useState({
    categoriaAcesso: initialData?.categoriaAcesso || 'Servers',
    nome: initialData?.nome || '',
    tipo: initialData?.tipo || '',
    fabricante: initialData?.fabricante || '',
    modelo: initialData?.modelo || '',
    ipv4Hostname: initialData?.ipv4Hostname || '',
    urlFqdnDomain: initialData?.urlFqdnDomain || '',
    sshPort: initialData?.sshPort || '',
    sshUser: initialData?.sshUser || '',
    sshPassword: initialData?.sshPassword || '',
    otherPort: initialData?.otherPort || '',
    otherUser: initialData?.otherUser || '',
    otherPassword: initialData?.otherPassword || '',
    snmpCommunity: initialData?.snmpCommunity || '',
    consolePassword: initialData?.consolePassword || '',
    status: initialData?.status || 'Ativo',
    observacoes: initialData?.observacoes || '',
    
    // Network Topologia
    networkTopologyLink: initialData?.networkTopologyLink || '',
    networkTopologyFileContent: initialData?.networkTopologyFileContent || '',
    networkTopologyFileName: initialData?.networkTopologyFileName || '',

    // Upstream e Downstream / Clientes B2B
    linkType: initialData?.linkType || 'Upstream',
    idCircuito: initialData?.idCircuito || '',
    velocidadeContratada: initialData?.velocidadeContratada || '',
    enlaceIpv4: initialData?.enlaceIpv4 || '',
    idVlanIpv4: initialData?.idVlanIpv4 || '',
    enlaceIpv6: initialData?.enlaceIpv6 || '',
    idVlanIpv6: initialData?.idVlanIpv6 || '',
    multihop: initialData?.multihop || '',
    multihopIpv6: initialData?.multihopIpv6 || '',
    communityBlackhole: initialData?.communityBlackhole || '',
    enderecoAbordagem: initialData?.enderecoAbordagem || '',
    contatoNoc: initialData?.contatoNoc || '',
    emailNoc: initialData?.emailNoc || '',
    enderecoCliente: initialData?.enderecoCliente || '',
    ipv4Publico: initialData?.ipv4Publico || '',
    ipv6Publico: initialData?.ipv6Publico || '',
    pppoeUser: initialData?.pppoeUser || '',
    pppoePassword: initialData?.pppoePassword || '',
    lastMile: initialData?.lastMile || '',
    contatoLastMile: initialData?.contatoLastMile || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.tipo || !formData.fabricante) return alert('Nome, Tipo e Fabricante são obrigatórios.');

    setIsSubmitting(true);
    try {
      const ativoData = {
        ...formData,
        clienteId,
        uid: user.uid,
        tags: initialData?.tags || [],
        createdAt: initialData?.createdAt || serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'clientes', clienteId, 'ativos', initialData.id), ativoData);
      } else {
        await addDoc(collection(db, 'clientes', clienteId, 'ativos'), ativoData);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, initialData?.id ? OperationType.UPDATE : OperationType.CREATE, initialData?.id ? `clientes/${clienteId}/ativos/${initialData.id}` : `clientes/${clienteId}/ativos`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Server size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">{initialData ? 'Editar Acesso' : 'Novo Acesso'}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
              <Server size={16} /> Detalhes do Equipamento / Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria *</label>
                <select 
                  required
                  value={formData.categoriaAcesso}
                  onChange={e => setFormData({...formData, categoriaAcesso: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white appearance-none"
                >
                  <option value="Servers">Servers</option>
                  <option value="Web Applications">Web Applications</option>
                  <option value="Network Assets">Network Assets</option>
                  <option value="Network Topologia">Network Topologia</option>
                  <option value="Upstream e Downstream">Upstream e Downstream</option>
                  <option value="Clientes B2B">Clientes B2B</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome de Exibição *</label>
                <input 
                  required
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Proxmox 01 - Srv01"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tipo *</label>
                <input 
                  required
                  value={formData.tipo}
                  onChange={e => setFormData({...formData, tipo: e.target.value})}
                  placeholder="Ex: Hypervisor, Router, DNS"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Fabricante *</label>
                <input 
                  required
                  value={formData.fabricante}
                  onChange={e => setFormData({...formData, fabricante: e.target.value})}
                  placeholder="Ex: Proxmox, Cisco, MikroTik"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Modelo</label>
                <input 
                  value={formData.modelo}
                  onChange={e => setFormData({...formData, modelo: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white appearance-none"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Planejado">Planejado</option>
                </select>
              </div>
            </div>
          </div>

          {formData.categoriaAcesso === 'Network Topologia' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <Network size={16} /> Topologia de Rede
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Link de Acesso (draw.io, etc)</label>
                  <input 
                    value={formData.networkTopologyLink}
                    onChange={e => setFormData({...formData, networkTopologyLink: e.target.value})}
                    placeholder="https://app.diagrams.net/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Arquivo draw.io (Upload)</label>
                  <input 
                    type="file"
                    accept=".drawio,.xml"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData({
                            ...formData, 
                            networkTopologyFileContent: event.target?.result as string,
                            networkTopologyFileName: file.name
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20"
                  />
                  {formData.networkTopologyFileName && (
                    <p className="text-xs text-emerald-500 mt-1">Arquivo carregado: {formData.networkTopologyFileName}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.categoriaAcesso === 'Upstream e Downstream' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <Network size={16} /> Detalhes do Link
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tipo de Link</label>
                  <select 
                    value={formData.linkType}
                    onChange={e => setFormData({...formData, linkType: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white appearance-none"
                  >
                    <option value="Upstream">Upstream</option>
                    <option value="Downstream">Downstream</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">ID Circuito</label>
                  <input 
                    value={formData.idCircuito}
                    onChange={e => setFormData({...formData, idCircuito: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Velocidade Contratada</label>
                  <input 
                    value={formData.velocidadeContratada}
                    onChange={e => setFormData({...formData, velocidadeContratada: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Enlace IPv4</label>
                  <input 
                    value={formData.enlaceIpv4}
                    onChange={e => setFormData({...formData, enlaceIpv4: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">ID VLAN IPv4</label>
                  <input 
                    value={formData.idVlanIpv4}
                    onChange={e => setFormData({...formData, idVlanIpv4: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Enlace IPv6</label>
                  <input 
                    value={formData.enlaceIpv6}
                    onChange={e => setFormData({...formData, enlaceIpv6: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">ID VLAN IPv6</label>
                  <input 
                    value={formData.idVlanIpv6}
                    onChange={e => setFormData({...formData, idVlanIpv6: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Multihop</label>
                  <input 
                    value={formData.multihop}
                    onChange={e => setFormData({...formData, multihop: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Multihop IPv6</label>
                  <input 
                    value={formData.multihopIpv6}
                    onChange={e => setFormData({...formData, multihopIpv6: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Community Blackhole</label>
                  <input 
                    value={formData.communityBlackhole}
                    onChange={e => setFormData({...formData, communityBlackhole: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Endereço de Abordagem</label>
                  <input 
                    value={formData.enderecoAbordagem}
                    onChange={e => setFormData({...formData, enderecoAbordagem: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contato NOC</label>
                  <input 
                    value={formData.contatoNoc}
                    onChange={e => setFormData({...formData, contatoNoc: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">E-mail NOC</label>
                  <input 
                    type="email"
                    value={formData.emailNoc}
                    onChange={e => setFormData({...formData, emailNoc: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.categoriaAcesso === 'Clientes B2B' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} /> Detalhes do Cliente B2B
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">ID Circuito</label>
                  <input 
                    value={formData.idCircuito}
                    onChange={e => setFormData({...formData, idCircuito: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Endereço</label>
                  <input 
                    value={formData.enderecoCliente}
                    onChange={e => setFormData({...formData, enderecoCliente: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Velocidade Contratada</label>
                  <input 
                    value={formData.velocidadeContratada}
                    onChange={e => setFormData({...formData, velocidadeContratada: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Enlace IPv4</label>
                  <input 
                    value={formData.enlaceIpv4}
                    onChange={e => setFormData({...formData, enlaceIpv4: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Enlace IPv6</label>
                  <input 
                    value={formData.enlaceIpv6}
                    onChange={e => setFormData({...formData, enlaceIpv6: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">ID VLAN</label>
                  <input 
                    value={formData.idVlanIpv4}
                    onChange={e => setFormData({...formData, idVlanIpv4: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">IPv4 Público</label>
                  <input 
                    value={formData.ipv4Publico}
                    onChange={e => setFormData({...formData, ipv4Publico: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">IPv6 Público</label>
                  <input 
                    value={formData.ipv6Publico}
                    onChange={e => setFormData({...formData, ipv6Publico: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">PPPoE User</label>
                  <input 
                    value={formData.pppoeUser}
                    onChange={e => setFormData({...formData, pppoeUser: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">PPPoE Password</label>
                  <input 
                    type="password"
                    value={formData.pppoePassword}
                    onChange={e => setFormData({...formData, pppoePassword: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Last Mile</label>
                  <input 
                    value={formData.lastMile}
                    onChange={e => setFormData({...formData, lastMile: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contato Last Mile</label>
                  <input 
                    value={formData.contatoLastMile}
                    onChange={e => setFormData({...formData, contatoLastMile: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {!['Network Topologia', 'Upstream e Downstream', 'Clientes B2B'].includes(formData.categoriaAcesso) && (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                  <Globe size={16} /> Endereço e Acesso
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Endereço IPv4 / Hostname</label>
                    <input 
                      value={formData.ipv4Hostname}
                      onChange={e => setFormData({...formData, ipv4Hostname: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">URL / FQDN Domain</label>
                    <input 
                      value={formData.urlFqdnDomain}
                      onChange={e => setFormData({...formData, urlFqdnDomain: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                    <Terminal size={16} /> Credenciais SSH / CLI
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Porta SSH</label>
                      <input 
                        value={formData.sshPort}
                        onChange={e => setFormData({...formData, sshPort: e.target.value})}
                        placeholder="22"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">SSH User</label>
                      <input 
                        value={formData.sshUser}
                        onChange={e => setFormData({...formData, sshUser: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">SSH Password</label>
                      <input 
                        type="password"
                        value={formData.sshPassword}
                        onChange={e => setFormData({...formData, sshPassword: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Console Password</label>
                      <input 
                        type="password"
                        value={formData.consolePassword}
                        onChange={e => setFormData({...formData, consolePassword: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                    <Globe size={16} /> Credenciais Web / Outros
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Porta Web</label>
                      <input 
                        value={formData.otherPort}
                        onChange={e => setFormData({...formData, otherPort: e.target.value})}
                        placeholder="80, 443, 8080"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Web User</label>
                      <input 
                        value={formData.otherUser}
                        onChange={e => setFormData({...formData, otherUser: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Web Password</label>
                      <input 
                        type="password"
                        value={formData.otherPassword}
                        onChange={e => setFormData({...formData, otherPassword: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">SNMP Community</label>
                      <input 
                        value={formData.snmpCommunity}
                        onChange={e => setFormData({...formData, snmpCommunity: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Observações</label>
            <RichTextEditor 
              content={formData.observacoes}
              onChange={(content) => setFormData({...formData, observacoes: content})}
            />
          </div>
        </form>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Acesso'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UserForm({ onClose, initialData, clientes }: { onClose: () => void, initialData?: DBUser, clientes: Cliente[] }) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'viewer',
    clienteId: initialData?.clienteId || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        // Edit existing user
        const userRef = doc(db, 'users', initialData.uid);
        const updateData: any = { role: formData.role };
        if (formData.role === 'cliente') {
          updateData.clienteId = formData.clienteId;
        } else {
          updateData.clienteId = deleteField();
        }
        await updateDoc(userRef, updateData);
      } else {
        // Create new user
        // We use a secondary app to avoid signing out the current admin
        const secondaryApp = initializeApp(firebaseConfig, 'SecondaryRegistration');
        const secondaryAuth = getAuth(secondaryApp);
        
        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
          const newUid = userCredential.user.uid;
          
          // Create Firestore document
          const userDocData: any = {
            uid: newUid,
            email: formData.email,
            role: formData.role,
            createdAt: serverTimestamp()
          };
          
          if (formData.role === 'cliente') {
            userDocData.clienteId = formData.clienteId;
          }
          
          await setDoc(doc(db, 'users', newUid), userDocData);
          
          // Sign out from secondary app
          await secondaryAuth.signOut();
        } finally {
          await deleteApp(secondaryApp);
        }
      }
      onClose();
    } catch (error: any) {
      console.error("User registration/update error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        alert("ERRO: O provedor de 'E-mail/Senha' não está ativado no seu Console do Firebase. \n\nPara corrigir:\n1. Vá ao Console do Firebase\n2. Authentication > Sign-in method\n3. Ative 'Email/Password'");
      } else if (error.code === 'permission-denied' || (error instanceof Error && error.message.includes('permissions'))) {
        handleFirestoreError(error, initialData ? OperationType.UPDATE : OperationType.WRITE, initialData ? `users/${initialData.uid}` : 'users');
      } else {
        alert("Erro ao processar usuário: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              {initialData ? <UserIcon size={24} /> : <UserPlus size={24} />}
            </div>
            <h3 className="text-xl font-bold tracking-tight">{initialData ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          <div className="space-y-4">
            {!initialData ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">E-mail</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="exemplo@email.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Senha Temporária</label>
                  <input 
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white"
                  />
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-bold text-white">{initialData.email}</p>
                <p className="text-xs text-zinc-500 font-mono">{initialData.uid}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nível de Acesso</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as any})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white appearance-none"
              >
                <option value="viewer">Viewer (Leitura)</option>
                <option value="cliente">Cliente (Acesso Restrito)</option>
                <option value="admin">Admin (Acesso Total)</option>
              </select>
            </div>

            {formData.role === 'cliente' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Vincular ao Cliente</label>
                <select 
                  required
                  value={formData.clienteId}
                  onChange={e => setFormData({...formData, clienteId: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 text-white appearance-none"
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || (formData.role === 'cliente' && !formData.clienteId)}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {initialData ? 'Salvar Alterações' : 'Criar Usuário'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function CommandForm({ onClose, user, initialData, addToast }: { onClose: () => void, user: User, initialData?: Command, addToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    descricao: initialData?.descricao || '',
    itens: initialData?.itens || [{ comando: '', explicacao: '' }],
    observacoes: initialData?.observacoes || '',
    fabricante: initialData?.fabricante || FABRICANTES[0],
    categoria: initialData?.categoria || CATEGORIAS[0],
    subgrupo: initialData?.subgrupo || '',
    tags: (initialData?.tags || []).join(', ') || '',
    linkExterno: initialData?.linkExterno || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { comando: '', explicacao: '' }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.itens.length === 1) return;
    const newItens = [...formData.itens];
    newItens.splice(index, 1);
    setFormData({ ...formData, itens: newItens });
  };

  const updateItem = (index: number, field: 'comando' | 'explicacao', value: string) => {
    const newItens = [...formData.itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setFormData({ ...formData, itens: newItens });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        updatedAt: serverTimestamp()
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'commands', initialData.id), data);
        addToast('Comando atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'commands'), {
          ...data,
          uid: user.uid,
          createdAt: serverTimestamp()
        });
        addToast('Novo comando adicionado com sucesso!');
      }
      onClose();
    } catch (error) {
      addToast('Erro ao salvar comando.', 'error');
      handleFirestoreError(error, initialData ? OperationType.UPDATE : OperationType.CREATE, 'commands');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {initialData ? <Terminal className="text-emerald-500" size={20} /> : <Plus className="text-emerald-500" size={20} />}
            {initialData ? 'Editar Comando' : 'Novo Comando'}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Título</label>
              <input 
                required
                value={formData.titulo}
                onChange={e => setFormData({...formData, titulo: e.target.value})}
                placeholder="Ex: Criar VLAN"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Fabricante</label>
              <select 
                value={formData.fabricante}
                onChange={e => setFormData({...formData, fabricante: e.target.value as Fabricante})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                {FABRICANTES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
              <select 
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Subgrupo</label>
              <input 
                value={formData.subgrupo}
                onChange={e => setFormData({...formData, subgrupo: e.target.value})}
                placeholder="Ex: Core, Acesso, Distribuicao"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tags (separadas por vírgula)</label>
              <input 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="bgp, routing, core"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição Geral</label>
            <RichTextEditor 
              content={formData.descricao}
              onChange={content => setFormData({...formData, descricao: content})}
              placeholder="Descreva o que este conjunto de comandos faz..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Comandos e Explicações</label>
              <button 
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                <Plus size={14} />
                Adicionar Item
              </button>
            </div>
            
            {formData.itens.map((item, index) => (
              <div key={index} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 relative group">
                {formData.itens.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute top-4 right-4 p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Comando {index + 1}</label>
                  <textarea 
                    required
                    value={item.comando}
                    onChange={e => updateItem(index, 'comando', e.target.value)}
                    placeholder="Digite o comando aqui..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500/50 h-20 resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Explicação {index + 1}</label>
                  <RichTextEditor 
                    content={item.explicacao}
                    onChange={content => updateItem(index, 'explicacao', content)}
                    placeholder="O que este comando faz?"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Link Externo (Opcional)</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                value={formData.linkExterno}
                onChange={e => setFormData({...formData, linkExterno: e.target.value})}
                placeholder="https://exemplo.com/documentacao"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Observações</label>
            <RichTextEditor 
              content={formData.observacoes}
              onChange={content => setFormData({...formData, observacoes: content})}
              placeholder="Alertas, impactos ou dicas..."
            />
          </div>
        </form>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Comando'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CommandDetails({ command, commands, isAdmin, setSelectedCommand, onClose, onEdit, addToast, breadcrumbs }: { command: Command, commands: Command[], isAdmin: boolean, setSelectedCommand: (cmd: Command) => void, onClose: () => void, onEdit: (cmd: Command) => void, addToast: (msg: string, type?: 'success' | 'error') => void, breadcrumbs?: React.ReactNode }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (command.id) {
        await deleteDoc(doc(db, 'commands', command.id));
        addToast('Comando excluído com sucesso!');
        onClose();
      }
    } catch (error) {
      addToast('Erro ao excluir comando.', 'error');
      handleFirestoreError(error, OperationType.REMOVE, `commands/${command.id}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 w-full max-w-7xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                {getFabricanteIcon(command.fabricante, 24)}
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">{command.titulo}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                  <span className="font-bold text-emerald-500 uppercase tracking-widest">{command.fabricante}</span>
                  <span>•</span>
                  <span>{command.categoria}</span>
                  {command.subgrupo && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-400">{command.subgrupo}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
              <X size={28} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-10">
            {breadcrumbs && (
              <div className="mb-2">
                {breadcrumbs}
              </div>
            )}
            {isAdmin && (
              <div className="flex justify-end gap-3 -mb-6">
                <button 
                  onClick={() => onEdit(command)}
                  className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            )}
          
          {/* Header Info */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
              <Info size={14} />
              Descrição Geral
            </h4>
            <div 
              className="text-zinc-300 leading-relaxed text-lg prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: command.descricao }}
            />
          </section>

          {command.linkExterno && (
            <section className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
                <ExternalLink size={14} />
                Documentação / Link Externo
              </h4>
              <a 
                href={command.linkExterno} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 text-sm font-medium underline underline-offset-4"
              >
                {command.linkExterno}
                <ExternalLink size={12} />
              </a>
            </section>
          )}

          {/* Items Block */}
          <div className="space-y-8">
            {(command.itens || []).map((item, index) => (
              <section key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Terminal size={14} />
                    Comando {(command.itens || []).length > 1 ? index + 1 : ''}
                  </h4>
                  <button 
                    onClick={() => handleCopy(item.comando, index)}
                    className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"
                  >
                    {copiedIndex === index ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copiedIndex === index ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-black rounded-2xl p-6 border border-zinc-800 relative group overflow-x-auto">
                  <pre className="text-emerald-500 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {item.comando}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Info size={14} />
                    Explicação
                  </h4>
                  <div 
                    className="text-zinc-400 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.explicacao }}
                  />
                </div>
              </section>
            ))}
          </div>

          {command.observacoes && (
            <section className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} />
                Observações & Alertas
              </h4>
              <div 
                className="text-amber-200/80 text-sm leading-relaxed prose prose-invert prose-amber max-w-none"
                dangerouslySetInnerHTML={{ __html: command.observacoes }}
              />
            </section>
          )}

          {/* Related Commands */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Layers size={14} />
              Comandos Relacionados
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {commands
                .filter(c => c.id !== command.id && (c.categoria === command.categoria || c.fabricante === command.fabricante))
                .slice(0, 4)
                .map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => {
                      onClose();
                      setTimeout(() => setSelectedCommand(c), 100);
                    }}
                    className="p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl hover:border-emerald-500/50 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-emerald-400">{c.titulo}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{c.fabricante} • {c.categoria}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500" />
                  </div>
                ))}
            </div>
          </section>

          {/* Tags */}
          <section className="pt-6 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {(command.tags || []).map(tag => (
                <span key={tag} className="flex items-center gap-1.5 bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs font-medium">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
              ID: {command.id}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
                  <AlertTriangle size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
                  <p className="text-zinc-400 text-sm">
                    Tem certeza que deseja excluir o comando <span className="text-white font-bold">"{command.titulo}"</span>? Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const ToastContainer = ({ toasts }: { toasts: Toast[] }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    <AnimatePresence>
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
            'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'error' && <AlertTriangle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

function LoginScreen({ onGoogleLogin, onEmailLogin, onEmailSignUp, isLoggingIn }: { 
  onGoogleLogin: () => void, 
  onEmailLogin: (email: string, pass: string) => void,
  onEmailSignUp: (email: string, pass: string) => void,
  isLoggingIn: boolean
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onEmailSignUp(email, password);
    } else {
      onEmailLogin(email, password);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white p-6 text-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] mb-8"
      >
        <Terminal size={80} className="text-emerald-500" />
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-2 tracking-tight"
      >
        NOCPedia
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-zinc-400 mb-8 max-w-md"
      >
        Base de conhecimento técnica. Faça login para acessar.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Mail size={14} /> E-mail
            </label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Key size={14} /> Senha
            </label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar no Sistema')}
            {!isLoggingIn && <ChevronRight size={20} />}
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoggingIn}
            className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-50 uppercase tracking-widest font-bold transition-colors"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar Agora'}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">Ou continue com</span>
            </div>
          </div>

          <button 
            onClick={onGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl text-base font-bold transition-all border border-zinc-700"
          >
            {isLoggingIn ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Globe size={20} />
            )}
            {isLoggingIn ? 'Aguarde...' : 'Google Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

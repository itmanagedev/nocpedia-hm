# Firebase Dependencies Inventory — NOCPedia

## 1. Packages Utilizados

| Package | Versão | Uso |
|---------|--------|-----|
| `firebase/app` | (bundled) | Inicialização do Firebase + secondary app para criação de usuários |
| `firebase/auth` | (bundled) | Autenticação (Google + Email/Senha) |
| `firebase/firestore` | (bundled) | Banco de dados (CRUD + listeners real-time) |

**Não utilizado:** `firebase/storage`, `firebase/functions`, `firebase/analytics`, `firebase/messaging`.

---

## 2. Arquivos que Importam Firebase

| Arquivo | O que importa |
|---------|---------------|
| `src/firebase.ts` | `initializeApp`, `getAuth`, `getFirestore` |
| `src/App.tsx` | `initializeApp`, `deleteApp`, `signInWithPopup`, `GoogleAuthProvider`, `onAuthStateChanged`, `signOut`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `getAuth`, `collection`, `query`, `onSnapshot`, `addDoc`, `updateDoc`, `deleteDoc`, `doc`, `serverTimestamp`, `orderBy`, `where`, `getDocs`, `getDoc`, `setDoc`, `getDocFromServer`, `writeBatch`, `deleteField` |
| `src/data/initialCommands.ts` | `serverTimestamp`, `FieldValue` |

---

## 3. Firebase Auth

### 3.1 Provedores
- **Google** (`signInWithPopup` + `GoogleAuthProvider`)
- **Email/Senha** (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`)

### 3.2 Listeners
| Local | Arquivo:Linha | Descrição |
|-------|---------------|-----------|
| `onAuthStateChanged(auth, ...)` | `App.tsx:1158` | Listener global de estado de autenticação |

### 3.3 Operações
| Operação | Arquivo:Linha | Detalhes |
|----------|---------------|----------|
| `signInWithPopup(auth, provider)` | `App.tsx:1557` | Login Google (popup) |
| `signInWithEmailAndPassword(auth, email, pass)` | `App.tsx:1574` | Login Email/Senha |
| `createUserWithEmailAndPassword(auth, email, pass)` | `App.tsx:1587` | Cadastro Email/Senha (self-service) |
| `signOut(auth)` | `App.tsx:1596` | Logout |
| `getAuth()` para secondary app | `App.tsx:4173` | Auth independente para criar usuários admin sem perder sessão |
| `secondaryAuth.signOut()` | `App.tsx:4194` | Logout do secondary app |
| `deleteApp(secondaryApp)` | `App.tsx:4196` | Limpeza do secondary app |

### 3.4 Fluxo de Auth
1. `onAuthStateChanged` detecta login/logout (`App.tsx:1158`)
2. Ao logar, testa conexão via `getDocFromServer(doc(db, 'test', 'connection'))`
3. Busca documento `users/{uid}` no Firestore
4. Se não existe, **cria** com `setDoc` — role `admin` se email = `noc.itmanage@gmail.com`, senão `viewer`
5. Se o admin padrão tem role diferente, força `updateDoc` para `'admin'`
6. Define estado global `isAdmin` baseado em role='admin' no doc OU email ser o default admin

### 3.5 Admin Hardcoded
- Email: `noc.itmanage@gmail.com` — sempre tratado como admin, independente do doc no Firestore

---

## 4. Firestore — Coleções e Operações

### 4.1 Coleção `commands/`

**Real-time listener:**
```typescript
// App.tsx:1214-1215
const q = query(collection(db, 'commands'), orderBy('createdAt', 'desc'));
const unsubscribe = onSnapshot(q, ...);
```
Escuta TODOS os documentos, ordenados por `createdAt` descendente. Atualiza estado `commands`.

**Operações CRUD:**
| Operação | Arquivo:Linha | Detalhes |
|----------|---------------|----------|
| `addDoc(collection(db, 'commands'), cmd)` | `App.tsx:1489` | Seed de comandos iniciais |
| `addDoc(collection(db, 'commands'), data)` | `App.tsx:4398` | Criar novo comando |
| `updateDoc(doc(db, 'commands', id), data)` | `App.tsx:4395` | Editar comando |
| `deleteDoc(doc(db, 'commands', id))` | `App.tsx:4621` | Excluir comando |
| `getDocs(collection(db, 'commands'))` | `App.tsx:1381` | Export backup |
| `getDocs(collection(db, 'commands'))` | `App.tsx:1483` | Verificar existentes antes do seed |
| `getDocs(collection(db, 'commands'))` | `App.tsx:1509` | Clear database (batch delete) |
| `writeBatch(db)` + `batch.delete` + `commit` | `App.tsx:1510-1514` | Limpar todos os comandos |

### 4.2 Coleção `clientes/`

**Real-time listeners (2 variantes):**
```typescript
// Cliente role: escuta APENAS seu documento
// App.tsx:1249
unsubscribe = onSnapshot(doc(db, 'clientes', dbUser.clienteId), ...);

// Admin role: escuta TODOS os documentos
// App.tsx:1266-1267
const q = query(collection(db, 'clientes'), orderBy('nomeFantasia', 'asc'));
unsubscribe = onSnapshot(q, ...);
```

**Operações CRUD:**
| Operação | Arquivo:Linha | Detalhes |
|----------|---------------|----------|
| `addDoc(collection(db, 'clientes'), data)` | `App.tsx:3123` | Criar cliente |
| `updateDoc(doc(db, 'clientes', id), data)` | `App.tsx:3121` | Editar cliente |
| `deleteDoc(doc(db, 'clientes', id))` | `App.tsx:1774` | Excluir cliente |
| `getDocs(collection(db, 'clientes'))` | `App.tsx:1372` | Export backup |
| `setDoc(doc(db, 'clientes', id), rest)` | `App.tsx:1453` | Restore backup |

### 4.3 Subcoleção `clientes/{clienteId}/ativos/`

**Real-time listener:**
```typescript
// App.tsx:1290-1294
const q = query(
  collection(db, 'clientes', selectedCliente.id, 'ativos'),
  orderBy('createdAt', 'desc')
);
const unsubscribe = onSnapshot(q, ...);
```

**Operações CRUD:**
| Operação | Arquivo:Linha | Detalhes |
|----------|---------------|----------|
| `addDoc(collection(db, 'clientes', clienteId, 'ativos'), data)` | `App.tsx:3550` | Criar ativo |
| `updateDoc(doc(db, 'clientes', clienteId, 'ativos', id), data)` | `App.tsx:3548` | Editar ativo |
| `deleteDoc(doc(db, 'clientes', clienteId, 'ativos', id))` | `App.tsx:2249` | Excluir ativo |
| `getDocs(collection(db, 'clientes', id, 'ativos'))` | `App.tsx:1375` | Export backup |
| `getDocs(collection(db, 'clientes', id, 'ativos'))` | `App.tsx:1430` | Limpar antes de restore |
| `deleteDoc(a.ref)` (loop) | `App.tsx:1431` | Limpar ativos antes de restore |
| `setDoc(doc(db, 'clientes', id, 'ativos', aId), aRest)` | `App.tsx:1457` | Restore backup |

### 4.4 Coleção `users/`

**Real-time listener:**
```typescript
// App.tsx:1314-1315 (admin apenas)
const q = query(collection(db, 'users'));
const unsubscribe = onSnapshot(q, ...);
```

**Operações CRUD:**
| Operação | Arquivo:Linha | Detalhes |
|----------|---------------|----------|
| `getDoc(doc(db, 'users', uid))` | `App.tsx:1168` | Ler próprio perfil ao logar |
| `setDoc(doc(db, 'users', uid), data)` | `App.tsx:1184` | Criar perfil no primeiro login |
| `updateDoc(doc(db, 'users', uid), { role: 'admin' })` | `App.tsx:1189` | Forçar role admin no admin default |
| `updateDoc(doc(db, 'users', uid), updateData)` | `App.tsx:4168` | Editar role/clienteId de usuário |
| `setDoc(doc(db, 'users', newUid), userDocData)` | `App.tsx:4191` | Criar novo usuário (admin) |
| `deleteField()` | `App.tsx:4166` | Remover campo `clienteId` |
| `getDocs(collection(db, 'users'))` | `App.tsx:1385` | Export backup |
| `getDocs(collection(db, 'users'))` | `App.tsx:1524` | Promover todos a admin (batch) |
| `writeBatch(db)` + `batch.update(..., { role: 'admin' })` | `App.tsx:1525-1529` | Batch promote |

### 4.5 Coleção `backups/`

**Real-time listener:**
```typescript
// App.tsx:1331-1332 (admin apenas)
const q = query(collection(db, 'backups'), orderBy('date', 'desc'));
const unsubscribe = onSnapshot(q, ...);
```

**Operações:**
| Operação | Arquivo:Linha | Detalhes |
|----------|---------------|----------|
| `doc(db, 'backups', today)` | `App.tsx:1351` | Referência |
| `getDoc(backupRef)` | `App.tsx:1352` | Verificar se backup do dia existe |
| `setDoc(doc(db, 'backups', id), { date: serverTimestamp(), data, createdBy })` | `App.tsx:1394` | Criar backup |
| `getDocs(query(collection(db, 'backups'), orderBy('date', 'desc')))` | `App.tsx:1401-1402` | Listar (para pruning) |
| `deleteDoc(d.ref)` | `App.tsx:1406` | Remover backups antigos (>7) |

### 4.6 Coleção `test/` (uso mínimo)
- `doc(db, 'test', 'connection')` + `getDocFromServer` — `App.tsx:1164` — teste de conectividade

---

## 5. Storage

**Não utilizado.** Documentos e backups de ativos são armazenados como Base64 inline nos próprios documentos Firestore (`documentos[].content` em clientes, `backupFileContent` em ativos).

---

## 6. Cloud Functions

**Não utilizado.** Todo o processamento é client-side.

---

## 7. Analytics / Performance / Remote Config

**Não utilizado.**

---

## 8. Resumo de Firebase API Calls

| API | Total de chamadas | Onde |
|-----|------------------|------|
| `onAuthStateChanged` | 1 | Listener global |
| `signInWithPopup` | 1 | Login Google |
| `signInWithEmailAndPassword` | 2 | Login + secondary app |
| `createUserWithEmailAndPassword` | 2 | Cadastro + secondary app |
| `signOut` | 1 | Logout |
| `getAuth` | 1 | Secondary app |
| `initializeApp` | 1 (+1 secondary) | Inicialização |
| `deleteApp` | 1 | Limpeza secondary app |
| `onSnapshot` | 5 | commands, clientes (2x), ativos, users, backups |
| `getDoc` | 2 | users/{uid}, backups/{today} |
| `getDocFromServer` | 1 | test/connection |
| `getDocs` | 8 | Commands (3x), clientes, ativos, users (2x), backups |
| `addDoc` | 3 | Command (seed), command (create), cliente (create), ativo (create) |
| `updateDoc` | 5 | User (force admin), User (edit), Command (edit), Cliente, Ativo |
| `setDoc` | 5 | User (create), User (admin create), Backup, Command (restore), User (restore), Cliente (restore), Ativo (restore) |
| `deleteDoc` | 4 | Command, Cliente, Ativo, Backup (pruning) |
| `writeBatch` | 2 | Clear commands, promote all users |
| `serverTimestamp` | 4+ | Initial commands, clientes, ativos, backups, commands |
| `deleteField` | 1 | Remover clienteId de user |
| `doc` | 15+ | References para todas operações |
| `collection` | 12+ | Referências para todas coleções |
| `query` | 5 | commands, clientes, ativos, users, backups |
| `orderBy` | 4 | commands, clientes, ativos, backups |

---

## 9. Dependências do Firebase (package.json)

Necessário verificar `package.json` para versões exatas. As importações usam o SDK modular v9+ (firebase v9+ tree-shakeable).

---

## 10. Observações Importantes

1. **`where` é importado mas NUNCA usado** — todas as queries buscam coleções completas sem filtros adicionais
2. **Base64 no Firestore** — documentos de anexos e backups de ativos são armazenados inline como strings Base64 (limite de ~1MB por documento)
3. **Sem paginação** — todas as queries buscam dados completos sem `limit` ou `startAfter`
4. **Offline-first** — o Firestore SDK mantém cache local automaticamente; não há lógica customizada de offline
5. **Sem transações** — usa `writeBatch` para operações atômicas, mas não `runTransaction`
6. **Secondary app** — único caso de múltiplas instâncias (para criar usuários sem perder sessão admin)

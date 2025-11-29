# 📋 Padrões de Codificação

## Convenções de Nomenclatura

### Variáveis e Funções
- **camelCase** para variáveis e funções: `getUserData()`, `isAuthenticated`
- **PascalCase** para classes e componentes: `UserService`, `LoginButton`
- **UPPER_SNAKE_CASE** para constantes: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

### Arquivos e Diretórios
- **kebab-case** para arquivos: `user-service.ts`, `auth-helper.ts`
- **PascalCase** para componentes React/Vue: `UserProfile.tsx`, `NavBar.vue`
- Nomes descritivos e significativos

## Estrutura de Código

### Organização de Imports
```typescript
// 1. Bibliotecas externas
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Aliases internos
import { UserService } from '@/services/user-service';
import { Button } from '@/components/ui/button';

// 3. Imports relativos
import { UserType } from './types';
import { validateUser } from './utils';
```

### Ordem dos Elementos em Classes/Arquivos
1. Tipos e Interfaces
2. Constantes
3. Propriedades
4. Constructor (se aplicável)
5. Métodos públicos
6. Métodos privados
7. Funções auxiliares

## Boas Práticas Gerais

### 1. DRY (Don't Repeat Yourself)
- Evite duplicação de código
- Extraia lógica repetida em funções reutilizáveis
- Use composição ao invés de herança quando possível

### 2. SOLID Principles
- **S**ingle Responsibility: Cada classe/função deve ter uma única responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Subclasses devem ser substituíveis por suas classes base
- **I**nterface Segregation: Interfaces específicas são melhores que interfaces genéricas
- **D**ependency Inversion: Dependa de abstrações, não de implementações concretas

### 3. Clean Code
- Funções pequenas e focadas (máximo 20-30 linhas)
- Nomes autoexplicativos (evite comentários óbvios)
- Evite números mágicos (use constantes nomeadas)
- Trate erros apropriadamente (não ignore exceções)

### 4. Type Safety (TypeScript)
```typescript
// ✅ BOM: Tipos explícitos e precisos
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

function getUser(id: string): Promise<User> {
  // implementação
}

// ❌ EVITAR: Tipos genéricos demais
function getUser(id: any): any {
  // implementação
}
```

### 5. Async/Await sobre Promises Encadeadas
```typescript
// ✅ BOM: Mais legível
async function fetchUserData(userId: string) {
  try {
    const user = await userService.getUser(userId);
    const posts = await postService.getUserPosts(user.id);
    return { user, posts };
  } catch (error) {
    handleError(error);
  }
}

// ❌ EVITAR: Promise hell
function fetchUserData(userId: string) {
  return userService.getUser(userId)
    .then(user => postService.getUserPosts(user.id)
      .then(posts => ({ user, posts })))
    .catch(handleError);
}
```

## Comentários e Documentação

### Quando Comentar
- **SIM**: Explique o "porquê", não o "como"
- **SIM**: Documente APIs públicas e interfaces
- **SIM**: Avisos sobre comportamentos não óbvios ou edge cases
- **NÃO**: Comente código óbvio
- **NÃO**: Mantenha código comentado (use git)

### JSDoc/TSDoc
```typescript
/**
 * Busca informações do usuário pelo ID
 * 
 * @param userId - ID único do usuário
 * @returns Promise com dados do usuário
 * @throws {UserNotFoundError} Quando usuário não existe
 * @throws {NetworkError} Quando há falha na conexão
 * 
 * @example
 * ```ts
 * const user = await getUserById('123');
 * console.log(user.name);
 * ```
 */
async function getUserById(userId: string): Promise<User> {
  // implementação
}
```

## Tratamento de Erros

### Use Custom Errors
```typescript
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}
```

### Hierarquia de Try-Catch
```typescript
async function processUser(userId: string) {
  try {
    const user = await getUserById(userId);
    
    try {
      await validateUser(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('Validation failed', { userId, error });
        throw error;
      }
      throw error;
    }
    
    return await saveUser(user);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      logger.error('User not found', { userId });
      throw new NotFoundError();
    }
    
    logger.error('Unexpected error', { error });
    throw error;
  }
}
```

## Performance e Otimização

### 1. Memoização
```typescript
// React
const MemoizedComponent = React.memo(ExpensiveComponent);

// Funções
const memoizedResult = useMemo(() => 
  expensiveCalculation(data), 
  [data]
);
```

### 2. Lazy Loading
```typescript
// Componentes
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Dados
const data = await import('./large-dataset.json');
```

### 3. Debounce e Throttle
```typescript
// Para inputs de busca
const debouncedSearch = debounce((query) => {
  searchAPI(query);
}, 300);

// Para scroll events
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

## Segurança

### 1. Validação de Input
```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

### 2. Nunca Expor Segredos
```typescript
// ❌ NUNCA FAÇA ISSO
const API_KEY = 'sk-123456789abcdef';

// ✅ BOM: Use variáveis de ambiente
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY não configurada');
}
```

### 3. Sanitize Data
```typescript
// Ao renderizar HTML
import DOMPurify from 'dompurify';

function renderUserContent(html: string) {
  return DOMPurify.sanitize(html);
}
```

---

**Nota**: Estes padrões devem ser adaptados ao contexto do seu projeto. Use `.ai/custom/` para adicionar ou sobrescrever regras específicas.


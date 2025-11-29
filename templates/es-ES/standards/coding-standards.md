# 📋 Estándares de Codificación

## Convenciones de Nomenclatura

### Variables y Funciones
- **camelCase** para variables y funciones: `getUserData()`, `isAuthenticated`
- **PascalCase** para clases y componentes: `UserService`, `LoginButton`
- **UPPER_SNAKE_CASE** para constantes: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

### Archivos y Directorios
- **kebab-case** para archivos: `user-service.ts`, `auth-helper.ts`
- **PascalCase** para componentes React/Vue: `UserProfile.tsx`, `NavBar.vue`

## Estructura del Código

### Organización de Imports
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

## Mejores Prácticas Generales

### 1. DRY (Don't Repeat Yourself)
- Evitar duplicación de código
- Extraer lógica repetida en funciones reutilizables

### 2. Principios SOLID
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 3. Código Limpio
- Funciones pequeñas y enfocadas (máximo 20-30 líneas)
- Nombres autoexplicativos
- Evitar números mágicos
- Manejar errores apropiadamente

### 4. Type Safety (TypeScript)
```typescript
// ✅ BUENO: Tipos explícitos y precisos
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// ❌ EVITAR: Tipos genéricos
function getUser(id: any): any {
  // implementación
}
```

## Manejo de Errores

### Usar Errores Personalizados
```typescript
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`Usuario con ID ${userId} no encontrado`);
    this.name = 'UserNotFoundError';
  }
}
```

## Seguridad

### 1. Validación de Entrada
```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 2. Nunca Exponer Secretos
```typescript
// ❌ NUNCA HACER ESTO
const API_KEY = 'sk-123456789abcdef';

// ✅ BUENO: Usar variables de entorno
const API_KEY = process.env.API_KEY;
```

---

**Nota**: Estos estándares deben adaptarse al contexto de su proyecto. Use `.ai/custom/` para agregar o sobrescribir reglas específicas.


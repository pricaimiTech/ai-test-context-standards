# 📋 Coding Standards

## Naming Conventions

### Variables and Functions
- **camelCase** for variables and functions: `getUserData()`, `isAuthenticated`
- **PascalCase** for classes and components: `UserService`, `LoginButton`
- **UPPER_SNAKE_CASE** for constants: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

### Files and Directories
- **kebab-case** for files: `user-service.ts`, `auth-helper.ts`
- **PascalCase** for React/Vue components: `UserProfile.tsx`, `NavBar.vue`

## Code Structure

### Import Organization
```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal aliases
import { UserService } from '@/services/user-service';
import { Button } from '@/components/ui/button';

// 3. Relative imports
import { UserType } from './types';
import { validateUser } from './utils';
```

## General Best Practices

### 1. DRY (Don't Repeat Yourself)
- Avoid code duplication
- Extract repeated logic into reusable functions

### 2. SOLID Principles
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 3. Clean Code
- Small, focused functions (max 20-30 lines)
- Self-explanatory names
- Avoid magic numbers (use named constants)
- Handle errors appropriately

### 4. Type Safety (TypeScript)
```typescript
// ✅ GOOD: Explicit and precise types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// ❌ AVOID: Generic types
function getUser(id: any): any {
  // implementation
}
```

### 5. Async/Await over Promise Chaining
```typescript
// ✅ GOOD: More readable
async function fetchUserData(userId: string) {
  try {
    const user = await userService.getUser(userId);
    const posts = await postService.getUserPosts(user.id);
    return { user, posts };
  } catch (error) {
    handleError(error);
  }
}
```

## Error Handling

### Use Custom Errors
```typescript
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}
```

## Security

### 1. Input Validation
```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 2. Never Expose Secrets
```typescript
// ❌ NEVER DO THIS
const API_KEY = 'sk-123456789abcdef';

// ✅ GOOD: Use environment variables
const API_KEY = process.env.API_KEY;
```

---

**Note**: These standards should be adapted to your project's context. Use `.ai/custom/` to add or override specific rules.


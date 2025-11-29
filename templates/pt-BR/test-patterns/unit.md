# 🧪 Padrões de Testes Unitários

## O que são Testes Unitários?

Testes unitários validam a menor unidade testável de código (função, método, classe) de forma isolada, sem dependências externas.

## Estrutura de Teste (AAA Pattern)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange (Preparar)
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
      };
      const mockRepository = createMockUserRepository();
      const service = new UserService(mockRepository);

      // Act (Agir)
      const user = await service.createUser(userData);

      // Assert (Afirmar)
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // deve estar hasheado
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Convenções de Nomenclatura

### Describe Blocks
```typescript
describe('ClassName/FunctionName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // teste
    });
  });
});
```

### Exemplos de Bons Nomes
```typescript
✅ it('should return user when valid ID is provided')
✅ it('should throw UserNotFoundError when user does not exist')
✅ it('should hash password before saving to database')
✅ it('should validate email format before creating user')

❌ it('test user creation')
❌ it('should work')
❌ it('test 1')
```

## Mocking e Stubs

### Mockando Dependências
```typescript
// Jest
import { jest } from '@jest/globals';

// Mock de repositório
const mockUserRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
};

// Mock de service externo
jest.mock('./email-service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  })),
}));

// Teste
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };
    service = new UserService(mockRepository);
  });

  it('should call repository with correct data', async () => {
    const userData = { name: 'John', email: 'john@test.com' };
    mockRepository.create.mockResolvedValue({ id: '1', ...userData });

    await service.createUser(userData);

    expect(mockRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

### Spy vs Mock vs Stub
```typescript
// SPY: Observa chamadas sem alterar comportamento
const spy = jest.spyOn(console, 'log');
someFunction();
expect(spy).toHaveBeenCalledWith('expected message');

// MOCK: Substitui implementação completamente
const mock = jest.fn().mockReturnValue('mocked value');

// STUB: Retorna dados predefinidos
const stub = jest.fn().mockResolvedValue({ id: '1', name: 'Test' });
```

## Testes Parametrizados

```typescript
describe('validateEmail', () => {
  it.each([
    ['valid@example.com', true],
    ['user.name@example.co.uk', true],
    ['invalid', false],
    ['@example.com', false],
    ['user@', false],
    ['', false],
  ])('should return %s when email is %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});

describe('calculateDiscount', () => {
  it.each`
    price    | percentage | expected
    ${100}   | ${10}      | ${90}
    ${50}    | ${20}      | ${40}
    ${200}   | ${50}      | ${100}
  `('should calculate $expected when price is $price and discount is $percentage%', 
    ({ price, percentage, expected }) => {
      expect(calculateDiscount(price, percentage)).toBe(expected);
    }
  );
});
```

## Casos de Teste Essenciais

### Happy Path (Caminho Feliz)
```typescript
it('should successfully process payment with valid data', async () => {
  const payment = { amount: 100, currency: 'USD', method: 'credit_card' };
  const result = await paymentService.process(payment);
  
  expect(result.success).toBe(true);
  expect(result.transactionId).toBeDefined();
});
```

### Edge Cases (Casos Extremos)
```typescript
it('should handle zero amount', async () => {
  const payment = { amount: 0, currency: 'USD', method: 'credit_card' };
  
  await expect(paymentService.process(payment))
    .rejects
    .toThrow('Amount must be greater than zero');
});

it('should handle very large numbers', () => {
  const result = calculateTotal(Number.MAX_SAFE_INTEGER, 1);
  expect(result).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
});

it('should handle empty array', () => {
  const result = calculateAverage([]);
  expect(result).toBe(0);
});
```

### Error Cases (Casos de Erro)
```typescript
it('should throw ValidationError when email is invalid', async () => {
  const userData = { name: 'John', email: 'invalid-email' };
  
  await expect(userService.createUser(userData))
    .rejects
    .toThrow(ValidationError);
});

it('should throw ConflictError when email already exists', async () => {
  mockRepository.findByEmail.mockResolvedValue({ id: '1', email: 'john@test.com' });
  
  await expect(userService.createUser({ email: 'john@test.com' }))
    .rejects
    .toThrow(ConflictError);
});
```

### Boundary Testing (Teste de Limites)
```typescript
describe('validatePassword', () => {
  it('should reject password with 7 characters (below minimum)', () => {
    expect(validatePassword('Pass12!')).toBe(false);
  });

  it('should accept password with 8 characters (minimum)', () => {
    expect(validatePassword('Pass123!')).toBe(true);
  });

  it('should accept password with 100 characters (maximum)', () => {
    const longPassword = 'P'.repeat(99) + '1!';
    expect(validatePassword(longPassword)).toBe(true);
  });

  it('should reject password with 101 characters (above maximum)', () => {
    const tooLongPassword = 'P'.repeat(100) + '1!';
    expect(validatePassword(tooLongPassword)).toBe(false);
  });
});
```

## Setup e Teardown

```typescript
describe('DatabaseService', () => {
  let db: Database;

  // Executa uma vez antes de todos os testes
  beforeAll(async () => {
    db = await createTestDatabase();
  });

  // Executa antes de cada teste
  beforeEach(async () => {
    await db.clear();
  });

  // Executa após cada teste
  afterEach(async () => {
    await db.rollback();
  });

  // Executa uma vez após todos os testes
  afterAll(async () => {
    await db.close();
  });

  it('should save user', async () => {
    const user = await db.users.create({ name: 'John' });
    expect(user.id).toBeDefined();
  });
});
```

## Testando Código Assíncrono

```typescript
// Promises
it('should fetch user data', async () => {
  const user = await userService.getUser('123');
  expect(user.name).toBe('John');
});

// Callbacks
it('should process callback', (done) => {
  processAsync((err, result) => {
    expect(err).toBeNull();
    expect(result).toBe('success');
    done();
  });
});

// Async/Await com erro
it('should handle async errors', async () => {
  await expect(async () => {
    await userService.getUser('invalid-id');
  }).rejects.toThrow('User not found');
});

// Timeout customizado
it('should complete within 5 seconds', async () => {
  await expect(longRunningOperation()).resolves.toBeTruthy();
}, 5000);
```

## Testando Exceções

```typescript
// Função síncrona
it('should throw error when input is invalid', () => {
  expect(() => validateInput('')).toThrow('Input cannot be empty');
  expect(() => validateInput('')).toThrow(ValidationError);
});

// Função assíncrona
it('should reject with error', async () => {
  await expect(userService.delete('admin-id'))
    .rejects
    .toThrow('Cannot delete admin user');
});

// Verificar propriedades do erro
it('should throw error with correct code', async () => {
  try {
    await userService.getUser('invalid');
  } catch (error) {
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.code).toBe('USER_NOT_FOUND');
    expect(error.statusCode).toBe(404);
  }
});
```

## Code Coverage

### Meta de Cobertura
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### O que Cobrir
```typescript
✅ Cobertura Importante:
- Lógica de negócio crítica (100%)
- Funções de validação (100%)
- Tratamento de erros (100%)
- Cálculos e transformações (100%)

⚠️ Cobertura Moderada:
- Utilidades simples (80%+)
- Formatadores (80%+)
- Helpers (80%+)

❌ Não Precisa Cobrir:
- Interfaces e tipos TypeScript
- Arquivos de configuração
- Código gerado automaticamente
```

## Boas Práticas

### ✅ FAZER
```typescript
// Testes independentes
it('should create user', async () => {
  const user = await createTestUser();
  expect(user.id).toBeDefined();
});

// Testes determinísticos
it('should always return same result', () => {
  expect(calculateTotal([1, 2, 3])).toBe(6);
});

// Um conceito por teste
it('should validate email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

it('should reject email without @', () => {
  expect(isValidEmail('invalid')).toBe(false);
});

// Assertions claras
it('should create user with hashed password', async () => {
  const user = await service.createUser({ password: 'plain' });
  expect(user.password).not.toBe('plain');
  expect(user.password).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt format
});
```

### ❌ EVITAR
```typescript
// Testes dependentes
it('should create user', () => {
  globalUser = createUser();
});

it('should update user', () => {
  updateUser(globalUser); // ❌ depende do teste anterior
});

// Testes não determinísticos
it('should generate random ID', () => {
  expect(generateId()).toBe('abc123'); // ❌ pode falhar aleatoriamente
});

// Múltiplos conceitos em um teste
it('should create, update and delete user', () => {
  // ❌ muito coisa em um teste
});

// Assertions genéricas
it('should work', () => {
  expect(result).toBeTruthy(); // ❌ muito vago
});
```

## Ferramentas Comuns

### Jest
```bash
npm test                 # Executar todos os testes
npm test -- --watch      # Watch mode
npm test -- --coverage   # Com cobertura
npm test user.test.ts    # Teste específico
npm test -- --verbose    # Mais detalhes
```

### Vitest
```bash
vitest                   # Watch mode por padrão
vitest run              # Uma única execução
vitest --ui             # Interface visual
vitest --coverage       # Cobertura
```

### Matchers Úteis
```typescript
// Igualdade
expect(value).toBe(expected);              // Igualdade estrita (===)
expect(value).toEqual(expected);           // Igualdade profunda
expect(value).toStrictEqual(expected);     // Igualdade estrita profunda

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Números
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 1); // Float comparison

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays e Objetos
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ key: 'value' });

// Funções
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenLastCalledWith(arg);

// Promises
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## Checklist de Revisão

Antes de fazer commit:
- [ ] Todos os testes passam
- [ ] Cobertura de código adequada (80%+ para lógica crítica)
- [ ] Testes são independentes e não dependem de ordem
- [ ] Nomes descritivos (should X when Y)
- [ ] AAA pattern aplicado
- [ ] Casos de erro cobertos
- [ ] Edge cases testados
- [ ] Sem testes duplicados ou redundantes
- [ ] Mocks e stubs usados apropriadamente
- [ ] Testes rápidos (< 100ms cada se possível)

---

**Lembre-se**: Testes unitários devem ser FIRST:
- **F**ast (Rápidos)
- **I**ndependent (Independentes)
- **R**epeatable (Repetíveis)
- **S**elf-validating (Auto-validantes)
- **T**imely (Escritos no tempo certo)


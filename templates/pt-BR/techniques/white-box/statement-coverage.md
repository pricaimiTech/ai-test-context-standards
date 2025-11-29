# 📝 Técnica: Cobertura de Statements (Statement Coverage)

## Tipo: White Box

## O que é?

Garante que **cada linha de código executável** seja executada pelo menos uma vez. É o nível mais básico de cobertura de código.

## Meta: 100% dos statements executados

## Como Aplicar

### Exemplo 1: Função Simples

```typescript
function calculateDiscount(price: number, isMember: boolean): number {
  let discount = 0;                    // Statement 1
  
  if (isMember) {                      // Statement 2
    discount = price * 0.1;            // Statement 3
  }
  
  return price - discount;             // Statement 4
}
```

**Testes para 100% Statement Coverage:**

```typescript
describe('Statement Coverage', () => {
  it('should execute all statements with member', () => {
    // Executa: 1, 2, 3, 4
    const result = calculateDiscount(100, true);
    expect(result).toBe(90);
  });
  
  // ✅ Este teste sozinho já dá 100% statement coverage
  // Mas não testa o caso de não-membro!
});

// Melhor: Testar ambos os casos
describe('Statement Coverage - Completo', () => {
  it('should give discount to members', () => {
    // Executa: 1, 2, 3, 4
    expect(calculateDiscount(100, true)).toBe(90);
  });

  it('should not give discount to non-members', () => {
    // Executa: 1, 2, 4 (pula statement 3)
    expect(calculateDiscount(100, false)).toBe(100);
  });
});
```

### Exemplo 2: Múltiplos Paths

```typescript
function getShippingCost(weight: number, distance: number): number {
  let cost = 10;                       // Statement 1
  
  if (weight > 5) {                    // Statement 2
    cost += 5;                         // Statement 3
  }
  
  if (distance > 100) {                // Statement 4
    cost += 10;                        // Statement 5
  }
  
  return cost;                         // Statement 6
}
```

**Para 100% Statement Coverage:**

```typescript
describe('Shipping Cost - Statement Coverage', () => {
  it('should execute all statements', () => {
    // weight > 5 AND distance > 100
    // Executa: 1, 2, 3, 4, 5, 6
    const result = getShippingCost(10, 150);
    expect(result).toBe(25); // 10 + 5 + 10
  });
  
  // ✅ 100% statement coverage com apenas 1 teste!
  // Mas faltam outros cenários importantes...
});
```

### Exemplo 3: Try-Catch

```typescript
function parseJSON(text: string): object {
  let result;                          // Statement 1
  
  try {
    result = JSON.parse(text);         // Statement 2
  } catch (error) {
    result = { error: 'Invalid JSON' }; // Statement 3
  }
  
  return result;                       // Statement 4
}
```

**Para 100% Statement Coverage:**

```typescript
describe('Parse JSON - Statement Coverage', () => {
  it('should parse valid JSON', () => {
    // Executa: 1, 2, 4 (pula catch)
    const result = parseJSON('{"name":"John"}');
    expect(result).toEqual({ name: 'John' });
  });

  it('should handle invalid JSON', () => {
    // Executa: 1, 2 (throws), 3, 4
    const result = parseJSON('invalid');
    expect(result).toEqual({ error: 'Invalid JSON' });
  });
  
  // ✅ 100% statement coverage
});
```

### Exemplo 4: Early Return

```typescript
function validateUser(user: User): boolean {
  if (!user) {                         // Statement 1
    return false;                      // Statement 2
  }
  
  if (!user.email) {                   // Statement 3
    return false;                      // Statement 4
  }
  
  if (user.age < 18) {                 // Statement 5
    return false;                      // Statement 6
  }
  
  return true;                         // Statement 7
}
```

**Para 100% Statement Coverage:**

```typescript
describe('User Validation - Statement Coverage', () => {
  it('should return false for null user', () => {
    // Executa: 1, 2
    expect(validateUser(null)).toBe(false);
  });

  it('should return false for missing email', () => {
    // Executa: 1, 3, 4
    expect(validateUser({ age: 20 })).toBe(false);
  });

  it('should return false for underage', () => {
    // Executa: 1, 3, 5, 6
    expect(validateUser({ email: 'test@example.com', age: 15 })).toBe(false);
  });

  it('should return true for valid user', () => {
    // Executa: 1, 3, 5, 7
    expect(validateUser({ email: 'test@example.com', age: 20 })).toBe(true);
  });
  
  // ✅ 100% statement coverage
});
```

### Exemplo 5: Switch/Case

```typescript
function getDay(dayNumber: number): string {
  switch (dayNumber) {                 // Statement 1
    case 1:
      return 'Monday';                 // Statement 2
    case 2:
      return 'Tuesday';                // Statement 3
    case 3:
      return 'Wednesday';              // Statement 4
    default:
      return 'Invalid';                // Statement 5
  }
}
```

**Para 100% Statement Coverage:**

```typescript
describe('Get Day - Statement Coverage', () => {
  it('should return Monday for 1', () => {
    // Executa: 1, 2
    expect(getDay(1)).toBe('Monday');
  });

  it('should return Tuesday for 2', () => {
    // Executa: 1, 3
    expect(getDay(2)).toBe('Tuesday');
  });

  it('should return Wednesday for 3', () => {
    // Executa: 1, 4
    expect(getDay(3)).toBe('Wednesday');
  });

  it('should return Invalid for other numbers', () => {
    // Executa: 1, 5
    expect(getDay(99)).toBe('Invalid');
  });
  
  // ✅ 100% statement coverage
});
```

## Verificando Cobertura

### Jest

```bash
npm test -- --coverage
```

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
discount.ts |   100   |   100    |   100   |   100
```

### Istanbul/NYC

```bash
nyc npm test
```

### Visualização

```bash
npm test -- --coverage --coverageReporters=html
# Abre coverage/index.html no navegador
```

## Limitações do Statement Coverage

### ⚠️ Problema: 100% Statement ≠ 100% Testado

```typescript
function divide(a: number, b: number): number {
  return a / b;                        // Statement 1
}

// ❌ 100% statement coverage, mas falta testar divisão por zero!
it('should divide numbers', () => {
  expect(divide(10, 2)).toBe(5);
  // Cobre o único statement, mas não testa b = 0
});
```

### ⚠️ Problema: Não Testa Todas as Condições

```typescript
function canVote(age: number, isCitizen: boolean): boolean {
  if (age >= 18 && isCitizen) {        // Statement 1
    return true;                       // Statement 2
  }
  return false;                        // Statement 3
}

// ✅ 100% statement coverage com apenas 1 teste
it('should allow voting', () => {
  expect(canVote(20, true)).toBe(true);
  // Executa todos os 3 statements
});

// ❌ MAS não testou:
// - age < 18
// - isCitizen = false
// - age >= 18 && isCitizen = false
```

**Solução:** Use também Branch Coverage!

## Boas Práticas

### ✅ DO

```typescript
// Teste cada statement ao menos uma vez
it('covers all statements', () => {
  // Garantir que todo código é executado
});

// Use coverage reports para encontrar gaps
it('finds untested code', () => {
  // Olhar relatório de cobertura e testar linhas não cobertas
});
```

### ❌ DON'T

```typescript
// Não pare em 100% statement coverage
// ❌ Isso NÃO garante que todos os casos estão testados

// Não ignore branches/condições
if (condition1 && condition2) {
  // ❌ Statement coverage não garante teste de todas combinações
}
```

## Ferramentas

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 80,  // Mínimo 80% de statements cobertos
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

### Ignorar Código

```typescript
/* istanbul ignore next */
function debugOnly() {
  // Não incluir na cobertura
}

// ou

if (process.env.NODE_ENV === 'development') {
  /* istanbul ignore next */
  console.log('Debug info');
}
```

## Checklist

- [ ] Identifico quais statements não estão cobertos
- [ ] Crio testes para cobrir todos os statements
- [ ] Verifico relatório de cobertura
- [ ] Atinjo pelo menos 80% de statement coverage
- [ ] Não paro em statement coverage (também uso branch/path)

## Comparação com Outras Coberturas

| Tipo | O que Mede | Exemplo |
|------|------------|---------|
| **Statement** | Cada linha executada | `x = 10;` executado |
| **Branch** | Cada branch (if/else) | `if (x) {}` ambos true/false |
| **Path** | Cada caminho possível | Todas combinações de ifs |

---

**Comando:** `/tecnica statement-coverage [arquivo/função]`

**Exemplo:** `/tecnica statement-coverage UserService.ts precisa garantir que todas as linhas sejam executadas`


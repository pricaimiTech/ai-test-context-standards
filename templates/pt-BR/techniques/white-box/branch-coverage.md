# 🔀 Técnica: Cobertura de Branches (Branch Coverage)

## Tipo: White Box

## O que é?

Garante que **cada branch** (true/false) de cada decisão seja executado pelo menos uma vez. Mais rigoroso que Statement Coverage.

## Meta: 100% dos branches testados

## Branch vs Statement

```typescript
function example(x: number): string {
  if (x > 0) {              // Decision point
    return 'positive';      // Branch TRUE
  }
  return 'non-positive';    // Branch FALSE
}

// Statement Coverage: Precisa executar ambos returns
// Branch Coverage: Precisa testar x > 0 = TRUE E FALSE
```

## Como Aplicar

### Exemplo 1: If Simples

```typescript
function isEligible(age: number): boolean {
  if (age >= 18) {          // Branch 1: TRUE/FALSE
    return true;
  }
  return false;
}
```

**Para 100% Branch Coverage:**

```typescript
describe('Eligibility - Branch Coverage', () => {
  it('should return true when age >= 18 (TRUE branch)', () => {
    expect(isEligible(18)).toBe(true);
    expect(isEligible(25)).toBe(true);
  });

  it('should return false when age < 18 (FALSE branch)', () => {
    expect(isEligible(17)).toBe(false);
    expect(isEligible(10)).toBe(false);
  });
  
  // ✅ 100% branch coverage (ambos TRUE e FALSE testados)
});
```

### Exemplo 2: AND Lógico

```typescript
function canVote(age: number, isCitizen: boolean): boolean {
  if (age >= 18 && isCitizen) {  // 2 condições = 4 branches possíveis
    return true;
  }
  return false;
}
```

**Branches:**
1. `age >= 18` → TRUE
2. `age >= 18` → FALSE
3. `isCitizen` → TRUE
4. `isCitizen` → FALSE

**Para 100% Branch Coverage:**

```typescript
describe('Voting - Branch Coverage', () => {
  // Branch: age >= 18 TRUE && isCitizen TRUE
  it('should allow voting (both TRUE)', () => {
    expect(canVote(20, true)).toBe(true);
  });

  // Branch: age >= 18 FALSE (short-circuit, não avalia isCitizen)
  it('should deny voting when underage (first FALSE)', () => {
    expect(canVote(15, true)).toBe(false);
  });

  // Branch: age >= 18 TRUE && isCitizen FALSE
  it('should deny voting when not citizen (second FALSE)', () => {
    expect(canVote(20, false)).toBe(false);
  });

  // Branch: age >= 18 FALSE && isCitizen FALSE
  it('should deny voting when both false', () => {
    expect(canVote(15, false)).toBe(false);
  });
  
  // ✅ 100% branch coverage
});
```

### Exemplo 3: OR Lógico

```typescript
function isWeekend(day: string): boolean {
  if (day === 'Saturday' || day === 'Sunday') {
    return true;
  }
  return false;
}
```

**Para 100% Branch Coverage:**

```typescript
describe('Weekend - Branch Coverage', () => {
  // Branch: day === 'Saturday' TRUE (short-circuit, não avalia Sunday)
  it('should return true for Saturday', () => {
    expect(isWeekend('Saturday')).toBe(true);
  });

  // Branch: day === 'Saturday' FALSE && day === 'Sunday' TRUE
  it('should return true for Sunday', () => {
    expect(isWeekend('Sunday')).toBe(true);
  });

  // Branch: day === 'Saturday' FALSE && day === 'Sunday' FALSE
  it('should return false for weekday', () => {
    expect(isWeekend('Monday')).toBe(false);
  });
  
  // ✅ 100% branch coverage
});
```

### Exemplo 4: Nested Ifs

```typescript
function getDiscount(price: number, isMember: boolean, isPremium: boolean): number {
  if (isMember) {                    // Branch A: TRUE/FALSE
    if (isPremium) {                 // Branch B: TRUE/FALSE
      return price * 0.20;           // 20% discount
    }
    return price * 0.10;             // 10% discount
  }
  return 0;                          // No discount
}
```

**Para 100% Branch Coverage:**

```typescript
describe('Nested Discount - Branch Coverage', () => {
  // A=TRUE, B=TRUE
  it('should give 20% discount (premium member)', () => {
    expect(getDiscount(100, true, true)).toBe(20);
  });

  // A=TRUE, B=FALSE
  it('should give 10% discount (regular member)', () => {
    expect(getDiscount(100, true, false)).toBe(10);
  });

  // A=FALSE (B não é avaliado)
  it('should give no discount (non-member)', () => {
    expect(getDiscount(100, false, false)).toBe(0);
    // Nota: isPremium pode ser true ou false aqui
  });
  
  // ✅ 100% branch coverage
});
```

### Exemplo 5: Switch/Case

```typescript
function getShippingDays(method: string): number {
  switch (method) {
    case 'express':
      return 1;           // Branch 1
    case 'standard':
      return 5;           // Branch 2
    case 'economy':
      return 10;          // Branch 3
    default:
      return 7;           // Branch 4
  }
}
```

**Para 100% Branch Coverage:**

```typescript
describe('Shipping Days - Branch Coverage', () => {
  it('should return 1 day for express', () => {
    expect(getShippingDays('express')).toBe(1);
  });

  it('should return 5 days for standard', () => {
    expect(getShippingDays('standard')).toBe(5);
  });

  it('should return 10 days for economy', () => {
    expect(getShippingDays('economy')).toBe(10);
  });

  it('should return 7 days for unknown method', () => {
    expect(getShippingDays('unknown')).toBe(7);
  });
  
  // ✅ 100% branch coverage (todos os cases testados)
});
```

### Exemplo 6: Ternário

```typescript
function getStatus(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive';  // 2 branches
}
```

**Para 100% Branch Coverage:**

```typescript
describe('Status - Branch Coverage', () => {
  it('should return Active when true', () => {
    expect(getStatus(true)).toBe('Active');
  });

  it('should return Inactive when false', () => {
    expect(getStatus(false)).toBe('Inactive');
  });
  
  // ✅ 100% branch coverage
});
```

### Exemplo 7: Try-Catch

```typescript
function safelyParse(json: string): object | null {
  try {
    return JSON.parse(json);      // Branch: Success
  } catch (error) {
    return null;                  // Branch: Error
  }
}
```

**Para 100% Branch Coverage:**

```typescript
describe('Safe Parse - Branch Coverage', () => {
  it('should parse valid JSON (success branch)', () => {
    const result = safelyParse('{"name":"John"}');
    expect(result).toEqual({ name: 'John' });
  });

  it('should return null for invalid JSON (error branch)', () => {
    const result = safelyParse('invalid');
    expect(result).toBeNull();
  });
  
  // ✅ 100% branch coverage
});
```

## Tabela de Decisão

Para AND/OR complexos, use tabela de decisão:

```typescript
// if (A && B && C) { ... }

// Tabela de Decisão (2^3 = 8 combinações):
// A | B | C | Result
// --|---|---|-------
// T | T | T | TRUE   ← Teste 1
// T | T | F | FALSE  ← Teste 2
// T | F | T | FALSE  (pode pular por short-circuit)
// T | F | F | FALSE  ← Teste 3
// F | T | T | FALSE  (pode pular por short-circuit)
// F | T | F | FALSE  (pode pular por short-circuit)
// F | F | T | FALSE  (pode pular por short-circuit)
// F | F | F | FALSE  ← Teste 4
```

## Verificando Branch Coverage

### Jest

```bash
npm test -- --coverage
```

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
example.ts|   100   |    75    |   100   |   100
          |         | ⚠️ Branch coverage baixo!
```

### Identificar Branches Não Cobertos

```typescript
// Relatório mostra:
// Line 5: if (x > 0 && y > 0) { 
//         ^^^^^       ^^^^^ 
//         Covered    Not covered
```

## Branch Coverage vs Statement Coverage

### Exemplo Comparativo:

```typescript
function calculate(x: number, y: number): number {
  let result = 0;                    // Statement 1
  
  if (x > 0 && y > 0) {              // Statement 2 (2 branches)
    result = x + y;                  // Statement 3
  }
  
  return result;                     // Statement 4
}

// ❌ 100% Statement Coverage (INSUFICIENTE)
it('covers all statements', () => {
  expect(calculate(5, 10)).toBe(15);
  // Executa: 1, 2, 3, 4
});

// ✅ 100% Branch Coverage (MELHOR)
describe('Branch Coverage', () => {
  it('should add when both positive', () => {
    expect(calculate(5, 10)).toBe(15);  // x>0 TRUE, y>0 TRUE
  });

  it('should return 0 when x negative', () => {
    expect(calculate(-5, 10)).toBe(0);  // x>0 FALSE
  });

  it('should return 0 when y negative', () => {
    expect(calculate(5, -10)).toBe(0);  // x>0 TRUE, y>0 FALSE
  });
});
```

## Ferramentas

### Jest Config

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,     // Exigir 80% de branch coverage
      statements: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

### Ignorar Branches

```typescript
/* istanbul ignore else */
if (condition) {
  // ...
}
// else não será coberto
```

## Limitações

### ⚠️ Branch ≠ Path Coverage

```typescript
function example(a: boolean, b: boolean): string {
  if (a) return 'A';    // 2 branches
  if (b) return 'B';    // 2 branches
  return 'None';
}

// ✅ 100% branch coverage com 3 testes
// ❌ MAS só testou 3 de 4 paths possíveis:
// - a=T, b=? (path 1)
// - a=F, b=T (path 2)  
// - a=F, b=F (path 3)
// Missing: a=F, b=T (path 4)
```

## Checklist

- [ ] Identifico todos os pontos de decisão (if, switch, &&, ||, ?)
- [ ] Testo branch TRUE de cada decisão
- [ ] Testo branch FALSE de cada decisão
- [ ] Verifico relatório de cobertura
- [ ] Atinjo pelo menos 80% de branch coverage
- [ ] Para condições compostas (&&, ||), testo todas as combinações relevantes

---

**Comando:** `/tecnica branch-coverage [arquivo/função]`

**Exemplo:** `/tecnica branch-coverage PaymentService precisa testar todos os branches de todas as condições if/else`


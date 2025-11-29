# 🛤️ Técnica: Cobertura de Caminhos (Path Coverage)

## Tipo: White Box

## O que é?

Testa **todos os caminhos possíveis** através do código. É o nível mais rigoroso e abrangente de cobertura.

## Path > Branch > Statement

```
Statement Coverage:  Cada linha executada
Branch Coverage:     Cada if TRUE e FALSE
Path Coverage:       Todas as combinações de caminhos
```

## Explosão de Caminhos

⚠️ **Atenção:** Número de caminhos cresce exponencialmente!

```typescript
// 2 ifs independentes = 2^2 = 4 paths
if (a) { }
if (b) { }

// 3 ifs independentes = 2^3 = 8 paths
if (a) { }
if (b) { }
if (c) { }

// 10 ifs = 2^10 = 1024 paths! 😱
```

## Como Aplicar

### Exemplo 1: Dois Ifs Independentes

```typescript
function processOrder(hasStock: boolean, hasPayment: boolean): string {
  let message = 'Order pending';     // Path start
  
  if (hasStock) {                    // Decision 1
    message += ', stock available';
  }
  
  if (hasPayment) {                  // Decision 2
    message += ', payment confirmed';
  }
  
  return message;
}
```

**Caminhos Possíveis (2^2 = 4):**

1. hasStock=FALSE, hasPayment=FALSE
2. hasStock=FALSE, hasPayment=TRUE
3. hasStock=TRUE, hasPayment=FALSE
4. hasStock=TRUE, hasPayment=TRUE

**Testes para 100% Path Coverage:**

```typescript
describe('Process Order - Path Coverage', () => {
  it('Path 1: No stock, no payment', () => {
    const result = processOrder(false, false);
    expect(result).toBe('Order pending');
  });

  it('Path 2: No stock, has payment', () => {
    const result = processOrder(false, true);
    expect(result).toBe('Order pending, payment confirmed');
  });

  it('Path 3: Has stock, no payment', () => {
    const result = processOrder(true, false);
    expect(result).toBe('Order pending, stock available');
  });

  it('Path 4: Has stock, has payment', () => {
    const result = processOrder(true, true);
    expect(result).toBe('Order pending, stock available, payment confirmed');
  });
  
  // ✅ 100% path coverage (todos os 4 caminhos testados)
});
```

### Exemplo 2: If-Else Encadeado

```typescript
function categorize(score: number): string {
  if (score >= 90) {              // Path 1
    return 'Excellent';
  } else if (score >= 70) {       // Path 2
    return 'Good';
  } else if (score >= 50) {       // Path 3
    return 'Average';
  } else {                        // Path 4
    return 'Poor';
  }
}
```

**Caminhos: 4 (um por branch)**

```typescript
describe('Categorize - Path Coverage', () => {
  it('Path 1: Excellent (score >= 90)', () => {
    expect(categorize(95)).toBe('Excellent');
  });

  it('Path 2: Good (70 <= score < 90)', () => {
    expect(categorize(75)).toBe('Good');
  });

  it('Path 3: Average (50 <= score < 70)', () => {
    expect(categorize(55)).toBe('Average');
  });

  it('Path 4: Poor (score < 50)', () => {
    expect(categorize(30)).toBe('Poor');
  });
  
  // ✅ 100% path coverage
});
```

### Exemplo 3: Nested Ifs (Caminhos Multiplicam)

```typescript
function checkAccess(isLoggedIn: boolean, isAdmin: boolean, isVerified: boolean): boolean {
  if (isLoggedIn) {               // Level 1
    if (isAdmin) {                // Level 2
      return true;                // Path 1
    } else if (isVerified) {      // Level 2
      return true;                // Path 2
    }
    return false;                 // Path 3
  }
  return false;                   // Path 4
}
```

**Caminhos Possíveis:**

1. isLoggedIn=TRUE → isAdmin=TRUE → return true
2. isLoggedIn=TRUE → isAdmin=FALSE → isVerified=TRUE → return true
3. isLoggedIn=TRUE → isAdmin=FALSE → isVerified=FALSE → return false
4. isLoggedIn=FALSE → return false

```typescript
describe('Access Check - Path Coverage', () => {
  it('Path 1: Logged in as admin', () => {
    expect(checkAccess(true, true, false)).toBe(true);
  });

  it('Path 2: Logged in, not admin, but verified', () => {
    expect(checkAccess(true, false, true)).toBe(true);
  });

  it('Path 3: Logged in, not admin, not verified', () => {
    expect(checkAccess(true, false, false)).toBe(false);
  });

  it('Path 4: Not logged in', () => {
    expect(checkAccess(false, false, false)).toBe(false);
  });
  
  // ✅ 100% path coverage
});
```

### Exemplo 4: Loop (Caminhos Infinitos!)

```typescript
function sumArray(numbers: number[]): number {
  let sum = 0;
  
  for (let i = 0; i < numbers.length; i++) {  // Loop!
    sum += numbers[i];
  }
  
  return sum;
}
```

**Problema:** Tecnicamente infinitos caminhos (array pode ter 0, 1, 2, 3... elementos)

**Solução Prática:** Teste casos representativos

```typescript
describe('Sum Array - Path Coverage (Practical)', () => {
  it('Path 1: Empty array (loop 0 times)', () => {
    expect(sumArray([])).toBe(0);
  });

  it('Path 2: Single element (loop 1 time)', () => {
    expect(sumArray([5])).toBe(5);
  });

  it('Path 3: Multiple elements (loop N times)', () => {
    expect(sumArray([1, 2, 3, 4])).toBe(10);
  });
  
  // ✅ Cobertura prática de caminhos principais
});
```

### Exemplo 5: Early Returns (Múltiplos Exits)

```typescript
function validatePassword(password: string): boolean {
  if (password.length < 8) {      // Path 1: Exit early
    return false;
  }
  
  if (!/[A-Z]/.test(password)) {  // Path 2: Exit early
    return false;
  }
  
  if (!/[0-9]/.test(password)) {  // Path 3: Exit early
    return false;
  }
  
  return true;                    // Path 4: All valid
}
```

**Caminhos:**

1. length < 8 → return false
2. length >= 8 → no uppercase → return false
3. length >= 8 → has uppercase → no digit → return false
4. length >= 8 → has uppercase → has digit → return true

```typescript
describe('Password Validation - Path Coverage', () => {
  it('Path 1: Too short', () => {
    expect(validatePassword('Ab1')).toBe(false);
  });

  it('Path 2: No uppercase', () => {
    expect(validatePassword('password1')).toBe(false);
  });

  it('Path 3: No digit', () => {
    expect(validatePassword('Password')).toBe(false);
  });

  it('Path 4: Valid password', () => {
    expect(validatePassword('Password1')).toBe(true);
  });
  
  // ✅ 100% path coverage
});
```

## Desenhando o Grafo de Fluxo

Ajuda visualizar os caminhos:

```
START
  ↓
[Check A]
  ↓     ↘
 Yes     No
  ↓       ↓
[Do X] [Check B]
  ↓     ↓     ↘
  ↓    Yes     No
  ↓     ↓       ↓
  └→ [END] ← [END]

Caminhos:
1. START → A(Yes) → X → END
2. START → A(No) → B(Yes) → END
3. START → A(No) → B(No) → END
```

## Path Coverage vs Branch Coverage

```typescript
function discount(isMember: boolean, amount: number): number {
  let discount = 0;
  
  if (isMember) {
    discount = 10;
  }
  
  if (amount > 100) {
    discount += 5;
  }
  
  return discount;
}

// Branch Coverage: 4 tests (2 ifs × 2 branches)
// 1. isMember=T
// 2. isMember=F
// 3. amount>100=T
// 4. amount>100=F

// Path Coverage: 4 tests (todas combinações)
// 1. isMember=T, amount>100=T  → discount = 15
// 2. isMember=T, amount>100=F  → discount = 10
// 3. isMember=F, amount>100=T  → discount = 5
// 4. isMember=F, amount>100=F  → discount = 0

describe('Discount - Path Coverage', () => {
  it('Path 1: Member + large amount', () => {
    expect(discount(true, 150)).toBe(15);
  });

  it('Path 2: Member + small amount', () => {
    expect(discount(true, 50)).toBe(10);
  });

  it('Path 3: Non-member + large amount', () => {
    expect(discount(false, 150)).toBe(5);
  });

  it('Path 4: Non-member + small amount', () => {
    expect(discount(false, 50)).toBe(0);
  });
});
```

## Quando Path Coverage é Impraticável

### Explosão Combinatória

```typescript
// 10 validações independentes = 2^10 = 1024 paths!
function validateUser(user: User): boolean {
  if (!user.email) return false;       // 1
  if (!user.name) return false;        // 2
  if (!user.age) return false;         // 3
  if (!user.address) return false;     // 4
  if (!user.phone) return false;       // 5
  if (!user.city) return false;        // 6
  if (!user.state) return false;       // 7
  if (!user.zip) return false;         // 8
  if (!user.country) return false;     // 9
  if (!user.verified) return false;    // 10
  return true;
}

// ❌ Testar 1024 paths é impraticável!
// ✅ Solução: Use heurística 0-1-Many ou Equivalence Partitioning
```

### Loops Infinitos

```typescript
while (condition) {
  // Infinitos caminhos possíveis
}

// ✅ Solução: Teste 0, 1, e N iterações (heurística 0-1-Many)
```

## Estratégias Práticas

### 1. Identificar Caminhos Críticos

Priorize caminhos de:
- ✅ Lógica de negócio importante
- ✅ Manipulação de dinheiro
- ✅ Segurança/autenticação
- ✅ Paths mais prováveis de uso

### 2. Usar Heurísticas

- **0-1-Many** para loops
- **Equivalence Partitioning** para reduzir combinações
- **Boundary Analysis** nos limites

### 3. Ferramentas de Análise

```bash
# Gerar grafo de fluxo de controle
npm install --save-dev complexity-report
```

## Checklist

- [ ] Desenhei o grafo de fluxo de controle
- [ ] Identifiquei todos os caminhos possíveis
- [ ] Priorizei caminhos críticos se houver muitos
- [ ] Testei cada caminho único
- [ ] Considerei loops (0, 1, many iterations)
- [ ] Verifiquei caminhos com early returns

---

**Comando:** `/tecnica path-coverage [função complexa]`

**Exemplo:** `/tecnica path-coverage OrderProcessing.processPayment() tem múltiplos ifs e preciso testar todos os caminhos possíveis`


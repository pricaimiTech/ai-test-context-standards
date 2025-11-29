# 🎰 Abordagem: Property-Based Testing

## O que é?

Em vez de testar com valores específicos, você define **propriedades que devem sempre ser verdadeiras** e a ferramenta gera centenas de inputs aleatórios para testar.

## Example vs Property-Based

```typescript
// ❌ Example-Based (tradicional)
it('should reverse array', () => {
  expect(reverse([1, 2, 3])).toEqual([3, 2, 1]);
  expect(reverse([5])).toEqual([5]);
  expect(reverse([])).toEqual([]);
  // Testou 3 casos específicos
});

// ✅ Property-Based
it('reversing twice returns original', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      expect(reverse(reverse(arr))).toEqual(arr);
    })
  );
  // Testa 100+ casos aleatórios automaticamente!
});
```

## Como Aplicar

### Setup: Fast-Check (JavaScript/TypeScript)

```bash
npm install --save-dev fast-check
```

```typescript
import fc from 'fast-check';
```

### Exemplo 1: Reverse Array

**Propriedade:** Reverter duas vezes retorna o original

```typescript
describe('Array Reverse - Property-Based', () => {
  it('reversing twice should return original array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),  // Gerar array de inteiros aleatórios
        (arr) => {
          const reversed = reverse(arr);
          const doubleReversed = reverse(reversed);
          expect(doubleReversed).toEqual(arr);
        }
      )
    );
  });

  it('reversed array should have same length', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string()),
        (arr) => {
          expect(reverse(arr)).toHaveLength(arr.length);
        }
      )
    );
  });

  it('first element becomes last', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 1 }), // Array não-vazio
        (arr) => {
          const reversed = reverse(arr);
          expect(reversed[reversed.length - 1]).toBe(arr[0]);
        }
      )
    );
  });
});
```

### Exemplo 2: Sort Array

**Propriedades:**

```typescript
describe('Array Sort - Property-Based', () => {
  it('sorted array should have same length', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = sort(arr);
          expect(sorted).toHaveLength(arr.length);
        }
      )
    );
  });

  it('sorted array should be in ascending order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = sort(arr);
          
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i]).toBeLessThanOrEqual(sorted[i + 1]);
          }
        }
      )
    );
  });

  it('sorted array should contain same elements', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = sort(arr);
          
          // Cada elemento do original deve estar no sorted
          arr.forEach(item => {
            expect(sorted).toContain(item);
          });
        }
      )
    );
  });

  it('sorting twice should give same result', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted1 = sort(arr);
          const sorted2 = sort(sorted1);
          expect(sorted2).toEqual(sorted1);
        }
      )
    );
  });
});
```

### Exemplo 3: String Operations

```typescript
describe('String Operations - Property-Based', () => {
  it('toUpperCase should increase or maintain length', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (str) => {
          const upper = str.toUpperCase();
          expect(upper.length).toBeGreaterThanOrEqual(str.length);
        }
      )
    );
  });

  it('trim should reduce or maintain length', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (str) => {
          const trimmed = str.trim();
          expect(trimmed.length).toBeLessThanOrEqual(str.length);
        }
      )
    );
  });

  it('concatenation length equals sum of lengths', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (str1, str2) => {
          const concatenated = str1 + str2;
          expect(concatenated.length).toBe(str1.length + str2.length);
        }
      )
    );
  });
});
```

### Exemplo 4: Math Operations

```typescript
describe('Math - Property-Based', () => {
  it('addition is commutative', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          expect(a + b).toBe(b + a);
        }
      )
    );
  });

  it('multiplication is associative', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        fc.integer(),
        (a, b, c) => {
          expect((a * b) * c).toBe(a * (b * c));
        }
      )
    );
  });

  it('adding zero is identity', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        (n) => {
          expect(n + 0).toBe(n);
          expect(0 + n).toBe(n);
        }
      )
    );
  });
});
```

### Exemplo 5: Encode/Decode

**Propriedade:** Encodar e depois decodar retorna o original

```typescript
describe('Base64 Encode/Decode - Property-Based', () => {
  it('encoding then decoding returns original', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (str) => {
          const encoded = btoa(str);
          const decoded = atob(encoded);
          expect(decoded).toBe(str);
        }
      )
    );
  });

  it('encoded string should be different', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (str) => {
          const encoded = btoa(str);
          expect(encoded).not.toBe(str);
        }
      )
    );
  });
});
```

## Generators (Arbitrary)

### Tipos Básicos

```typescript
fc.integer()              // Qualquer inteiro
fc.integer({ min: 0, max: 100 })  // Entre 0 e 100
fc.nat()                  // Natural (>= 0)
fc.float()                // Float
fc.boolean()              // Boolean
fc.string()               // String qualquer
fc.string({ minLength: 3, maxLength: 20 })  // String com tamanho
fc.char()                 // Caractere único
fc.hexaString()           // String hexadecimal
fc.emailAddress()         // Email válido
fc.webUrl()               // URL válida
fc.date()                 // Data
fc.uuid()                 // UUID
```

### Tipos Compostos

```typescript
// Array
fc.array(fc.integer())
fc.array(fc.string(), { minLength: 1, maxLength: 10 })

// Object
fc.record({
  name: fc.string(),
  age: fc.integer({ min: 0, max: 120 }),
  email: fc.emailAddress(),
})

// Tuple
fc.tuple(fc.string(), fc.integer(), fc.boolean())

// One Of
fc.oneof(fc.constant('admin'), fc.constant('user'), fc.constant('guest'))
```

### Custom Generators

```typescript
// Generator de User
const userArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 2, maxLength: 50 }),
  email: fc.emailAddress(),
  age: fc.integer({ min: 18, max: 120 }),
  role: fc.oneof(
    fc.constant('admin'),
    fc.constant('user'),
    fc.constant('guest')
  ),
});

describe('User Validation - Property-Based', () => {
  it('should validate any generated user', () => {
    fc.assert(
      fc.property(userArbitrary, (user) => {
        const result = validateUser(user);
        expect(result.isValid).toBe(true);
      })
    );
  });
});
```

## Shrinking (Redução de Casos)

Quando um teste falha, fast-check **reduz** automaticamente para o caso mínimo:

```typescript
// Test fails with: [5, -2, 9, 0, 3, -1, 7]
// Fast-check shrinks to: [-2]
// Facilitando debug!

it('should handle negative numbers', () => {
  fc.assert(
    fc.property(
      fc.array(fc.integer()),
      (arr) => {
        // Se falhar com array grande,
        // fast-check tentará arrays menores
        const result = process(arr);
        expect(result).toBeGreaterThan(0);
      }
    )
  );
});
```

## Configurações

```typescript
fc.assert(
  fc.property(
    fc.integer(),
    (n) => {
      expect(isEven(n * 2)).toBe(true);
    }
  ),
  {
    numRuns: 1000,        // Executar 1000 vezes (padrão: 100)
    seed: 42,             // Seed para reproduzibilidade
    timeout: 5000,        // Timeout por execução
    verbose: true,        // Mostrar todos os casos testados
  }
);
```

## Exemplos de Propriedades

### Identidade

```typescript
// x + 0 = x
// x * 1 = x
// reverse(reverse(x)) = x
```

### Comutatividade

```typescript
// a + b = b + a
// a * b = b * a
```

### Associatividade

```typescript
// (a + b) + c = a + (b + c)
```

### Idempotência

```typescript
// sort(sort(x)) = sort(x)
// trim(trim(x)) = trim(x)
```

### Invariantes

```typescript
// length(concat(a, b)) = length(a) + length(b)
// sum(filter(arr, f)) <= sum(arr)
```

## Checklist

- [ ] Identifiquei propriedades matemáticas/lógicas
- [ ] Escolhi generators apropriados
- [ ] Configurei número adequado de runs (100-1000)
- [ ] Testei propriedades invariantes
- [ ] Complementei com example-based tests para casos específicos

---

**Comando:** `/abordagem property-based [função e suas propriedades]`

**Exemplo:** `/abordagem property-based função sort deve ter propriedade: sort(sort(x)) = sort(x) e todos elementos do original devem estar no sorted`


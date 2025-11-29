# 📏 Técnica: Análise de Valor Limite (Boundary Value Analysis)

## Tipo: Black Box

## O que é?

Técnica que testa nos **limites** e **adjacências** de valores válidos. Bugs frequentemente ocorrem nas bordas dos intervalos.

## Regra de Ouro

Para cada limite, teste:
- **Valor mínimo - 1** (inválido)
- **Valor mínimo** (válido)
- **Valor mínimo + 1** (válido)
- **Valor máximo - 1** (válido)
- **Valor máximo** (válido)
- **Valor máximo + 1** (inválido)

## Como Aplicar

### Exemplo 1: Idade (18-65 anos)

```typescript
describe('Age Validation - Boundary Analysis', () => {
  // Abaixo do mínimo
  it('should reject 17 (min - 1)', () => {
    expect(validateAge(17)).toBe(false);
  });

  // No mínimo
  it('should accept 18 (min)', () => {
    expect(validateAge(18)).toBe(true);
  });

  // Acima do mínimo
  it('should accept 19 (min + 1)', () => {
    expect(validateAge(19)).toBe(true);
  });

  // Abaixo do máximo
  it('should accept 64 (max - 1)', () => {
    expect(validateAge(64)).toBe(true);
  });

  // No máximo
  it('should accept 65 (max)', () => {
    expect(validateAge(65)).toBe(true);
  });

  // Acima do máximo
  it('should reject 66 (max + 1)', () => {
    expect(validateAge(66)).toBe(false);
  });
});
```

### Exemplo 2: Preço (R$ 0.01 - R$ 9999.99)

```typescript
describe('Price Validation - Boundary Analysis', () => {
  const testCases = [
    { value: 0.00, valid: false, desc: 'below min' },
    { value: 0.01, valid: true, desc: 'min' },
    { value: 0.02, valid: true, desc: 'min + 1' },
    { value: 9999.98, valid: true, desc: 'max - 1' },
    { value: 9999.99, valid: true, desc: 'max' },
    { value: 10000.00, valid: false, desc: 'above max' },
  ];

  testCases.forEach(({ value, valid, desc }) => {
    it(`should ${valid ? 'accept' : 'reject'} ${value} (${desc})`, () => {
      expect(validatePrice(value)).toBe(valid);
    });
  });
});
```

### Exemplo 3: Array Length (1-100 itens)

```typescript
describe('Array Length - Boundary Analysis', () => {
  it('should reject empty array (0 = min - 1)', () => {
    expect(processArray([])).toThrow('Array cannot be empty');
  });

  it('should accept array with 1 item (min)', () => {
    expect(processArray([1])).toBeTruthy();
  });

  it('should accept array with 2 items (min + 1)', () => {
    expect(processArray([1, 2])).toBeTruthy();
  });

  it('should accept array with 99 items (max - 1)', () => {
    const arr = Array(99).fill(1);
    expect(processArray(arr)).toBeTruthy();
  });

  it('should accept array with 100 items (max)', () => {
    const arr = Array(100).fill(1);
    expect(processArray(arr)).toBeTruthy();
  });

  it('should reject array with 101 items (max + 1)', () => {
    const arr = Array(101).fill(1);
    expect(processArray(arr)).toThrow('Array too large');
  });
});
```

### Exemplo 4: String Length (3-20 caracteres)

```typescript
describe('Username Length - Boundary Analysis', () => {
  // Abaixo do mínimo
  test('2 chars (min - 1): INVALID', () => {
    expect(validateUsername('ab')).toBe(false);
  });

  // No mínimo
  test('3 chars (min): VALID', () => {
    expect(validateUsername('abc')).toBe(true);
  });

  // Acima do mínimo
  test('4 chars (min + 1): VALID', () => {
    expect(validateUsername('abcd')).toBe(true);
  });

  // Abaixo do máximo
  test('19 chars (max - 1): VALID', () => {
    expect(validateUsername('a'.repeat(19))).toBe(true);
  });

  // No máximo
  test('20 chars (max): VALID', () => {
    expect(validateUsername('a'.repeat(20))).toBe(true);
  });

  // Acima do máximo
  test('21 chars (max + 1): INVALID', () => {
    expect(validateUsername('a'.repeat(21))).toBe(false);
  });
});
```

### Exemplo 5: Data Range (01/01/2020 - 31/12/2025)

```typescript
describe('Date Range - Boundary Analysis', () => {
  const MIN_DATE = new Date('2020-01-01');
  const MAX_DATE = new Date('2025-12-31');

  it('should reject 2019-12-31 (min - 1 day)', () => {
    const date = new Date('2019-12-31');
    expect(isValidDate(date)).toBe(false);
  });

  it('should accept 2020-01-01 (min)', () => {
    expect(isValidDate(MIN_DATE)).toBe(true);
  });

  it('should accept 2020-01-02 (min + 1 day)', () => {
    const date = new Date('2020-01-02');
    expect(isValidDate(date)).toBe(true);
  });

  it('should accept 2025-12-30 (max - 1 day)', () => {
    const date = new Date('2025-12-30');
    expect(isValidDate(date)).toBe(true);
  });

  it('should accept 2025-12-31 (max)', () => {
    expect(isValidDate(MAX_DATE)).toBe(true);
  });

  it('should reject 2026-01-01 (max + 1 day)', () => {
    const date = new Date('2026-01-01');
    expect(isValidDate(date)).toBe(false);
  });
});
```

## Boundary + Robustness Testing

Teste também valores extremos além dos limites:

```typescript
describe('Age - Robustness Testing', () => {
  // Valores extremamente fora dos limites
  it('should handle negative values', () => {
    expect(validateAge(-100)).toBe(false);
  });

  it('should handle zero', () => {
    expect(validateAge(0)).toBe(false);
  });

  it('should handle very large values', () => {
    expect(validateAge(999)).toBe(false);
  });

  it('should handle infinity', () => {
    expect(validateAge(Infinity)).toBe(false);
  });

  it('should handle NaN', () => {
    expect(validateAge(NaN)).toBe(false);
  });
});
```

## Template Reutilizável

```typescript
describe('[Feature] - Boundary Analysis', () => {
  const boundaries = {
    min: 10,
    max: 100,
  };

  describe('Lower Boundary', () => {
    it(`rejects ${boundaries.min - 1} (below min)`, () => {});
    it(`accepts ${boundaries.min} (min)`, () => {});
    it(`accepts ${boundaries.min + 1} (above min)`, () => {});
  });

  describe('Upper Boundary', () => {
    it(`accepts ${boundaries.max - 1} (below max)`, () => {});
    it(`accepts ${boundaries.max} (max)`, () => {});
    it(`rejects ${boundaries.max + 1} (above max)`, () => {});
  });
});
```

## Múltiplos Limites

Quando há múltiplas variáveis com limites:

```typescript
describe('Rectangle Area - Multiple Boundaries', () => {
  // Width: 1-100, Height: 1-50
  
  it('should calculate area at minimum dimensions', () => {
    expect(calculateArea(1, 1)).toBe(1);
  });

  it('should calculate area at maximum dimensions', () => {
    expect(calculateArea(100, 50)).toBe(5000);
  });

  it('should reject width = 0', () => {
    expect(() => calculateArea(0, 25)).toThrow();
  });

  it('should reject height = 51', () => {
    expect(() => calculateArea(50, 51)).toThrow();
  });

  // Combinações de limites
  it('should accept min width + max height', () => {
    expect(calculateArea(1, 50)).toBe(50);
  });

  it('should accept max width + min height', () => {
    expect(calculateArea(100, 1)).toBe(100);
  });
});
```

## Quando Usar

✅ **Use quando:**
- Há intervalos de valores (min-max)
- Há limites de tamanho (strings, arrays)
- Há ranges de datas
- Há validações numéricas

❌ **Não use quando:**
- Não há limites definidos
- Valores são booleanos simples
- Lógica não depende de ranges

## Checklist

- [ ] Identifiquei todos os limites?
- [ ] Testei min - 1?
- [ ] Testei min?
- [ ] Testei min + 1?
- [ ] Testei max - 1?
- [ ] Testei max?
- [ ] Testei max + 1?
- [ ] Testei valores extremos (negativo, zero, infinito)?

---

**Comando:** `/tecnica boundary [campo/funcionalidade com limites]`

**Exemplo:** `/tecnica boundary campo de quantidade de produto com min 1 e max 999`


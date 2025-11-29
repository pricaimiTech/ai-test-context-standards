# 🐻 Heurística Goldilocks (Teste em 3s)

## O que é?

Inspirada na história da Cachinhos Dourados (Goldilocks), esta heurística testa com 3 valores: **muito pequeno**, **adequado** e **muito grande**.

## Regra de Ouro

Para qualquer campo/valor, teste:
- 🔴 **Muito Pequeno** (too small) - Abaixo do esperado
- 🟢 **Adequado** (just right) - Dentro do esperado  
- 🔴 **Muito Grande** (too large) - Acima do esperado

## Exemplos Práticos

### Campos de Texto

```typescript
describe('Username Validation - Goldilocks', () => {
  // 🔴 Muito Pequeno
  it('should reject username too short', () => {
    expect(validateUsername('')).toBe(false);        // Vazio
    expect(validateUsername('a')).toBe(false);       // 1 char
    expect(validateUsername('ab')).toBe(false);      // 2 chars (min é 3)
  });

  // 🟢 Adequado
  it('should accept username with valid length', () => {
    expect(validateUsername('abc')).toBe(true);      // Mínimo (3)
    expect(validateUsername('john_doe')).toBe(true); // Normal
    expect(validateUsername('a'.repeat(20))).toBe(true); // Máximo (20)
  });

  // 🔴 Muito Grande
  it('should reject username too long', () => {
    expect(validateUsername('a'.repeat(21))).toBe(false);  // 21 chars (max é 20)
    expect(validateUsername('a'.repeat(100))).toBe(false); // Muito longo
    expect(validateUsername('a'.repeat(1000))).toBe(false); // Extremamente longo
  });
});
```

### Números/Valores

```typescript
describe('Age Validation - Goldilocks', () => {
  // 🔴 Muito Pequeno
  it('should reject age too small', () => {
    expect(validateAge(-1)).toBe(false);    // Negativo
    expect(validateAge(0)).toBe(false);     // Zero
    expect(validateAge(17)).toBe(false);    // Abaixo do mínimo (18)
  });

  // 🟢 Adequado
  it('should accept valid age', () => {
    expect(validateAge(18)).toBe(true);     // Mínimo
    expect(validateAge(25)).toBe(true);     // Normal
    expect(validateAge(65)).toBe(true);     // Máximo
  });

  // 🔴 Muito Grande
  it('should reject age too large', () => {
    expect(validateAge(66)).toBe(false);    // Acima do máximo
    expect(validateAge(150)).toBe(false);   // Muito alto
    expect(validateAge(999)).toBe(false);   // Extremamente alto
  });
});
```

### Arquivos/Upload

```typescript
describe('File Upload - Goldilocks', () => {
  // 🔴 Muito Pequeno
  it('should reject empty file', () => {
    const emptyFile = new File([], 'empty.txt');
    expect(validateFile(emptyFile)).toBe(false);
  });

  // 🟢 Adequado
  it('should accept file with valid size', () => {
    const smallFile = new File(['a'.repeat(1024)], 'small.txt');    // 1KB
    const mediumFile = new File(['a'.repeat(1024 * 500)], 'medium.txt'); // 500KB
    const largeFile = new File(['a'.repeat(1024 * 1024 * 5)], 'large.txt'); // 5MB (máximo)
    
    expect(validateFile(smallFile)).toBe(true);
    expect(validateFile(mediumFile)).toBe(true);
    expect(validateFile(largeFile)).toBe(true);
  });

  // 🔴 Muito Grande
  it('should reject file too large', () => {
    const tooLarge = new File(['a'.repeat(1024 * 1024 * 6)], 'toolarge.txt'); // 6MB
    const wayTooLarge = new File(['a'.repeat(1024 * 1024 * 100)], 'huge.txt'); // 100MB
    
    expect(validateFile(tooLarge)).toBe(false);
    expect(validateFile(wayTooLarge)).toBe(false);
  });
});
```

### Arrays/Listas

```typescript
describe('Batch Processing - Goldilocks', () => {
  // 🔴 Muito Pequeno
  it('should handle empty batch', () => {
    const result = processBatch([]);
    expect(result.processed).toBe(0);
  });

  // 🟢 Adequado
  it('should handle normal batch size', () => {
    const smallBatch = Array(10).fill(item);      // 10 itens
    const mediumBatch = Array(100).fill(item);    // 100 itens
    const largeBatch = Array(1000).fill(item);    // 1000 itens (máximo)
    
    expect(processBatch(smallBatch).success).toBe(true);
    expect(processBatch(mediumBatch).success).toBe(true);
    expect(processBatch(largeBatch).success).toBe(true);
  });

  // 🔴 Muito Grande
  it('should reject batch too large', () => {
    const tooLargeBatch = Array(1001).fill(item);    // 1001 itens
    const hugeBatch = Array(10000).fill(item);       // 10000 itens
    
    expect(() => processBatch(tooLargeBatch)).toThrow('Batch too large');
    expect(() => processBatch(hugeBatch)).toThrow('Batch too large');
  });
});
```

### Requisições/Rate Limiting

```typescript
describe('API Rate Limiting - Goldilocks', () => {
  // 🔴 Muito Pequeno (0 requests)
  it('should allow first request', async () => {
    const response = await request(app).get('/api/data');
    expect(response.status).toBe(200);
  });

  // 🟢 Adequado (dentro do limite)
  it('should allow requests within limit', async () => {
    // Fazer 99 requests (limite é 100/minuto)
    for (let i = 0; i < 99; i++) {
      const response = await request(app).get('/api/data');
      expect(response.status).toBe(200);
    }
  });

  // 🔴 Muito Grande (excede limite)
  it('should block requests exceeding limit', async () => {
    // Fazer 100 requests primeiro
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/data');
    }
    
    // 101ª request deve ser bloqueada
    const response = await request(app).get('/api/data');
    expect(response.status).toBe(429); // Too Many Requests
  });
});
```

### Tempo/Timeout

```typescript
describe('Request Timeout - Goldilocks', () => {
  // 🔴 Muito Rápido (resposta instantânea suspeita)
  it('should handle instant response', async () => {
    const start = Date.now();
    await fastEndpoint();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(10); // Muito rápido, verificar cache
  });

  // 🟢 Adequado (tempo normal)
  it('should complete within acceptable time', async () => {
    const start = Date.now();
    await normalEndpoint();
    const duration = Date.now() - start;
    
    expect(duration).toBeGreaterThan(50);
    expect(duration).toBeLessThan(5000); // Entre 50ms e 5s
  });

  // 🔴 Muito Lento (timeout)
  it('should timeout slow requests', async () => {
    await expect(slowEndpoint({ timeout: 5000 }))
      .rejects
      .toThrow('Timeout');
  });
});
```

## Goldilocks + Boundary Analysis

Combine com análise de limite para cobertura completa:

```typescript
describe('Price Validation - Goldilocks + Boundary', () => {
  // 🔴 Muito Pequeno
  describe('Too Small', () => {
    it('should reject negative price', () => {
      expect(validatePrice(-1)).toBe(false);
      expect(validatePrice(-100)).toBe(false);
    });

    it('should reject zero price', () => {
      expect(validatePrice(0)).toBe(false);
    });

    it('should reject below minimum', () => {
      expect(validatePrice(0.99)).toBe(false); // Min é 1.00
    });
  });

  // 🟢 Adequado
  describe('Just Right', () => {
    it('should accept minimum price', () => {
      expect(validatePrice(1.00)).toBe(true);   // Mínimo
    });

    it('should accept normal prices', () => {
      expect(validatePrice(10.00)).toBe(true);
      expect(validatePrice(99.99)).toBe(true);
      expect(validatePrice(500.00)).toBe(true);
    });

    it('should accept maximum price', () => {
      expect(validatePrice(9999.99)).toBe(true); // Máximo
    });
  });

  // 🔴 Muito Grande
  describe('Too Large', () => {
    it('should reject above maximum', () => {
      expect(validatePrice(10000.00)).toBe(false); // Max é 9999.99
    });

    it('should reject extremely large values', () => {
      expect(validatePrice(999999.99)).toBe(false);
      expect(validatePrice(Number.MAX_SAFE_INTEGER)).toBe(false);
    });
  });
});
```

## Template Reutilizável

```typescript
describe('[Feature] - Goldilocks', () => {
  describe('Too Small', () => {
    it('should handle minimum edge case', () => {
      // Teste com valor mínimo/vazio/zero
    });
  });

  describe('Just Right', () => {
    it('should handle normal case', () => {
      // Teste com valores válidos normais
    });
  });

  describe('Too Large', () => {
    it('should handle maximum edge case', () => {
      // Teste com valor máximo/grande demais
    });
  });
});
```

## Checklist

- [ ] Testei com valor muito pequeno/vazio?
- [ ] Testei no limite mínimo?
- [ ] Testei com valores normais/adequados?
- [ ] Testei no limite máximo?
- [ ] Testei com valor muito grande/excessivo?
- [ ] Mensagens de erro são claras para cada caso?

---

**Comando:** `/heuristica goldilocks [campo/funcionalidade]`

**Exemplo:** `/heuristica goldilocks campo de senha com min 8 e max 128 caracteres`


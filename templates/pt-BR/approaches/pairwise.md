# 🎲 Abordagem: Pairwise Testing (All-Pairs)

## O que é?

Técnica combinatória que garante que **cada par de valores** seja testado ao menos uma vez, reduzindo drasticamente o número de testes necessários.

## O Problema: Explosão Combinatória

### Exemplo: Configurações de Sistema

**Parâmetros:**
- Browser: Chrome, Firefox, Safari (3 opções)
- OS: Windows, Mac, Linux (3 opções)
- Language: PT, EN, ES (3 opções)

**Testes possíveis:** 3 × 3 × 3 = **27 combinações**

### Com Pairwise: ~9 testes cobrem todos os pares! 🎉

## Como Aplicar

### Exemplo 1: Sistema Multi-plataforma

**Parâmetros:**
- Browser: Chrome, Firefox, Safari
- OS: Windows, Mac, Linux
- Language: PT, EN, ES

**Sem Pairwise (exhaustivo):** 27 testes

**Com Pairwise:** ~9 testes

```typescript
describe('Cross-Platform - Pairwise', () => {
  const testConfigs = [
    { browser: 'Chrome', os: 'Windows', lang: 'PT' },
    { browser: 'Chrome', os: 'Mac', lang: 'EN' },
    { browser: 'Chrome', os: 'Linux', lang: 'ES' },
    { browser: 'Firefox', os: 'Windows', lang: 'EN' },
    { browser: 'Firefox', os: 'Mac', lang: 'ES' },
    { browser: 'Firefox', os: 'Linux', lang: 'PT' },
    { browser: 'Safari', os: 'Windows', lang: 'ES' },
    { browser: 'Safari', os: 'Mac', lang: 'PT' },
    { browser: 'Safari', os: 'Linux', lang: 'EN' },
  ];

  testConfigs.forEach(({ browser, os, lang }) => {
    it(`should work on ${browser}/${os}/${lang}`, async () => {
      await setConfig({ browser, os, lang });
      const result = await runTest();
      expect(result.success).toBe(true);
    });
  });
  
  // ✅ Todos os pares cobertos com apenas 9 testes
});
```

### Exemplo 2: Formulário com Múltiplos Campos

**Campos:**
- Name: Valid, Empty, TooLong
- Email: Valid, Invalid
- Age: Valid, Invalid
- Terms: Checked, Unchecked

**Sem Pairwise:** 3 × 2 × 2 × 2 = **24 testes**

**Com Pairwise:** ~8 testes

```typescript
describe('Form Validation - Pairwise', () => {
  const pairwiseTests = [
    { name: 'Valid', email: 'Valid', age: 'Valid', terms: 'Checked', expected: true },
    { name: 'Valid', email: 'Invalid', age: 'Invalid', terms: 'Unchecked', expected: false },
    { name: 'Empty', email: 'Valid', age: 'Invalid', terms: 'Checked', expected: false },
    { name: 'Empty', email: 'Invalid', age: 'Valid', terms: 'Unchecked', expected: false },
    { name: 'TooLong', email: 'Valid', age: 'Valid', terms: 'Unchecked', expected: false },
    { name: 'TooLong', email: 'Invalid', age: 'Invalid', terms: 'Checked', expected: false },
    { name: 'Valid', email: 'Valid', age: 'Invalid', terms: 'Unchecked', expected: false },
    { name: 'Empty', email: 'Invalid', age: 'Valid', terms: 'Checked', expected: false },
  ];

  pairwiseTests.forEach((test, index) => {
    it(`Pairwise Test ${index + 1}`, async () => {
      const data = {
        name: getTestValue('name', test.name),
        email: getTestValue('email', test.email),
        age: getTestValue('age', test.age),
        terms: test.terms === 'Checked',
      };

      const result = await validateForm(data);
      expect(result.isValid).toBe(test.expected);
    });
  });
});

function getTestValue(field: string, type: string): any {
  const values = {
    name: {
      Valid: 'John Doe',
      Empty: '',
      TooLong: 'A'.repeat(300),
    },
    email: {
      Valid: 'john@example.com',
      Invalid: 'invalid-email',
    },
    age: {
      Valid: 25,
      Invalid: -5,
    },
  };
  
  return values[field][type];
}
```

### Exemplo 3: Configurações de Produto

**Parâmetros:**
- Size: S, M, L, XL
- Color: Red, Blue, Green
- Material: Cotton, Polyester
- Style: Casual, Formal

**Sem Pairwise:** 4 × 3 × 2 × 2 = **48 testes**

**Com Pairwise:** ~12 testes

```typescript
describe('Product Config - Pairwise', () => {
  // Gerado por ferramenta de pairwise
  const pairwiseConfigs = [
    { size: 'S', color: 'Red', material: 'Cotton', style: 'Casual' },
    { size: 'S', color: 'Blue', material: 'Polyester', style: 'Formal' },
    { size: 'M', color: 'Red', material: 'Polyester', style: 'Formal' },
    { size: 'M', color: 'Green', material: 'Cotton', style: 'Casual' },
    { size: 'L', color: 'Blue', material: 'Cotton', style: 'Formal' },
    { size: 'L', color: 'Green', material: 'Polyester', style: 'Casual' },
    { size: 'XL', color: 'Red', material: 'Cotton', style: 'Formal' },
    { size: 'XL', color: 'Blue', material: 'Polyester', style: 'Casual' },
    { size: 'S', color: 'Green', material: 'Cotton', style: 'Formal' },
    { size: 'M', color: 'Blue', material: 'Cotton', style: 'Casual' },
    { size: 'L', color: 'Red', material: 'Polyester', style: 'Casual' },
    { size: 'XL', color: 'Green', material: 'Polyester', style: 'Formal' },
  ];

  pairwiseConfigs.forEach((config, i) => {
    it(`Config ${i + 1}: ${JSON.stringify(config)}`, () => {
      const product = createProduct(config);
      expect(product).toBeDefined();
      expect(product.price).toBeGreaterThan(0);
    });
  });
});
```

## Gerando Combinações Pairwise

### Ferramenta Online

Use: https://pairwise.teremokgribov.com/

```
# Input:
Browser: Chrome, Firefox, Safari
OS: Windows, Mac, Linux
Language: PT, EN, ES

# Output (exemplo):
Chrome, Windows, PT
Chrome, Mac, EN
Chrome, Linux, ES
Firefox, Windows, EN
Firefox, Mac, ES
Firefox, Linux, PT
Safari, Windows, ES
Safari, Mac, PT
Safari, Linux, EN
```

### Biblioteca JavaScript

```bash
npm install --save-dev pairwise
```

```typescript
import { pairwise } from 'pairwise';

const parameters = {
  browser: ['Chrome', 'Firefox', 'Safari'],
  os: ['Windows', 'Mac', 'Linux'],
  language: ['PT', 'EN', 'ES'],
};

const combinations = pairwise(parameters);

describe('Generated Pairwise Tests', () => {
  combinations.forEach((combo, i) => {
    it(`Combination ${i + 1}`, () => {
      runTest(combo);
    });
  });
});
```

## Quando Usar

✅ **Use quando:**
- Muitos parâmetros com múltiplos valores
- Teste exhaustivo é impraticável (>100 combinações)
- Interações entre pares são mais importantes
- Tempo/recursos limitados

❌ **Não use quando:**
- Poucos parâmetros (< 10 combinações totais)
- Interações de 3+ parâmetros são críticas (use 3-wise)
- Precisa testar TODAS as combinações (safety-critical)

## Exemplo Real: Feature Flags

```typescript
describe('Feature Flags - Pairwise', () => {
  // 5 flags = 2^5 = 32 combinações
  // Pairwise: ~8-10 testes
  
  const pairwiseFlags = [
    { newUI: true, darkMode: true, betaFeatures: false, analytics: true, experimental: false },
    { newUI: true, darkMode: false, betaFeatures: true, analytics: false, experimental: true },
    { newUI: false, darkMode: true, betaFeatures: true, analytics: true, experimental: true },
    { newUI: false, darkMode: false, betaFeatures: false, analytics: false, experimental: false },
    { newUI: true, darkMode: true, betaFeatures: true, analytics: true, experimental: true },
    { newUI: false, darkMode: true, betaFeatures: false, analytics: false, experimental: true },
    { newUI: true, darkMode: false, betaFeatures: false, analytics: true, experimental: false },
    { newUI: false, darkMode: false, betaFeatures: true, analytics: true, experimental: false },
  ];

  pairwiseFlags.forEach((flags, i) => {
    it(`Flag combination ${i + 1}`, async () => {
      await setFeatureFlags(flags);
      await page.goto('/');
      
      // Verificar que página carrega sem erros
      await expect(page.locator('body')).toBeVisible();
      expect(await page.evaluate(() => window.errors)).toBeUndefined();
    });
  });
});
```

## N-wise Testing

### Pairwise (2-wise)
Testa todos os **pares**

### 3-wise
Testa todas as **trios** (mais testes, mais cobertura)

### T-wise
Testa todas as combinações de **T parâmetros**

```typescript
// Pairwise: ~9 testes
// 3-wise: ~20 testes
// Exhaustivo: 27 testes

// Escolha baseado em:
// - Risco (alto = 3-wise ou exhaustivo)
// - Tempo (limitado = pairwise)
// - Criticidade (safety = exhaustivo)
```

## Verificando Cobertura de Pares

### Checklist Manual

```typescript
// Parâmetros: A (1,2), B (X,Y)
// Pares necessários:
// - (1, X) ✓
// - (1, Y) ✓
// - (2, X) ✓
// - (2, Y) ✓

describe('Verify Pairwise Coverage', () => {
  it('covers (1, X)', () => {});
  it('covers (1, Y)', () => {});
  it('covers (2, X)', () => {});
  it('covers (2, Y)', () => {});
  // ✅ Todos os 4 pares cobertos
});
```

## Vantagens

✅ **Redução drástica de testes** (27 → 9)
✅ **Encontra ~70% dos bugs** com muito menos testes
✅ **Eficiente** para configurações/permutações
✅ **Científicamente validado**

## Desvantagens

❌ **Não testa todas combinações** (pode perder bugs raros)
❌ **Interações de 3+ parâmetros** não garantidas
❌ **Precisa ferramenta** para gerar combinações

## Template

```typescript
describe('[Feature] - Pairwise Testing', () => {
  // 1. Definir parâmetros e valores
  const parameters = {
    param1: ['value1', 'value2', 'value3'],
    param2: ['valueA', 'valueB'],
    param3: ['valueX', 'valueY', 'valueZ'],
  };

  // 2. Gerar combinações pairwise (usar ferramenta)
  const pairwiseCombos = generatePairwise(parameters);

  // 3. Testar cada combinação
  pairwiseCombos.forEach((combo, i) => {
    it(`Pairwise test ${i + 1}`, () => {
      const result = testWith(combo);
      expect(result).toBeDefined();
    });
  });
});
```

## Ferramentas

### Online
- https://pairwise.teremokgribov.com/
- https://pairwise.yuuniworks.com/

### CLI
```bash
npm install -g pict
pict config.txt
```

### JavaScript
```bash
npm install --save-dev pairwise
```

## Checklist

- [ ] Identifiquei todos os parâmetros
- [ ] Listei todos os valores de cada parâmetro
- [ ] Gerei combinações pairwise (ferramenta)
- [ ] Criei teste para cada combinação
- [ ] Verifiquei que todos os pares estão cobertos
- [ ] Documentei decisão de usar pairwise (justificar)

---

**Comando:** `/abordagem pairwise [parâmetros e valores]`

**Exemplo:** `/abordagem pairwise sistema tem 4 browsers, 3 SOs, 2 themes, 3 languages - muitas combinações para testar todas`


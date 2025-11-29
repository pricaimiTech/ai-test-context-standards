# 🎯 Técnica: Particionamento de Equivalência (Equivalence Partitioning)

## Tipo: Black Box

## O que é?

Divide inputs em **classes de equivalência** onde todos os valores de uma classe devem se comportar da mesma forma. Teste **um valor de cada classe**.

## Regra de Ouro

1. Identifique as classes de equivalência (válidas e inválidas)
2. Teste **um representante** de cada classe
3. Reduza o número de testes mantendo cobertura

## Como Aplicar

### Exemplo 1: Desconto por Quantidade

**Regra:**
- 1-9 unidades: sem desconto
- 10-49 unidades: 10% desconto
- 50-99 unidades: 20% desconto  
- 100+ unidades: 30% desconto

**Classes de Equivalência:**

```typescript
describe('Discount by Quantity - Equivalence Partitioning', () => {
  // Classe 1: 1-9 (sem desconto)
  it('should apply 0% discount for 5 units', () => {
    expect(calculateDiscount(5, 100)).toBe(0);
  });

  // Classe 2: 10-49 (10% desconto)
  it('should apply 10% discount for 25 units', () => {
    expect(calculateDiscount(25, 100)).toBe(10);
  });

  // Classe 3: 50-99 (20% desconto)
  it('should apply 20% discount for 75 units', () => {
    expect(calculateDiscount(75, 100)).toBe(20);
  });

  // Classe 4: 100+ (30% desconto)
  it('should apply 30% discount for 150 units', () => {
    expect(calculateDiscount(150, 100)).toBe(30);
  });

  // Classes Inválidas
  it('should reject 0 units', () => {
    expect(() => calculateDiscount(0, 100)).toThrow();
  });

  it('should reject negative units', () => {
    expect(() => calculateDiscount(-5, 100)).toThrow();
  });
});
```

### Exemplo 2: Validação de Email

**Classes de Equivalência:**
- ✅ Válidos: formato correto
- ❌ Inválidos: sem @, sem domínio, caracteres especiais, etc.

```typescript
describe('Email Validation - Equivalence Partitioning', () => {
  // Classe Válida
  describe('Valid Emails', () => {
    it('should accept standard email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });
  });

  // Classes Inválidas
  describe('Invalid Emails', () => {
    it('should reject email without @', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('should reject email without user', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe(false);
    });
  });
});
```

### Exemplo 3: Categoria de IMC

**Regras:**
- < 18.5: Abaixo do peso
- 18.5 - 24.9: Peso normal
- 25.0 - 29.9: Sobrepeso
- >= 30.0: Obesidade

```typescript
describe('BMI Category - Equivalence Partitioning', () => {
  // Classe 1: Abaixo do peso (< 18.5)
  it('should categorize 17.0 as underweight', () => {
    expect(getBMICategory(17.0)).toBe('underweight');
  });

  // Classe 2: Normal (18.5 - 24.9)
  it('should categorize 22.0 as normal', () => {
    expect(getBMICategory(22.0)).toBe('normal');
  });

  // Classe 3: Sobrepeso (25.0 - 29.9)
  it('should categorize 27.0 as overweight', () => {
    expect(getBMICategory(27.0)).toBe('overweight');
  });

  // Classe 4: Obesidade (>= 30.0)
  it('should categorize 32.0 as obese', () => {
    expect(getBMICategory(32.0)).toBe('obese');
  });

  // Classes Inválidas
  it('should reject negative BMI', () => {
    expect(() => getBMICategory(-5)).toThrow();
  });

  it('should reject BMI = 0', () => {
    expect(() => getBMICategory(0)).toThrow();
  });
});
```

### Exemplo 4: Status HTTP Response

**Classes:**
- 2xx: Sucesso
- 4xx: Erro do cliente
- 5xx: Erro do servidor

```typescript
describe('HTTP Response Handler - Equivalence Partitioning', () => {
  // Classe: 2xx (sucesso)
  it('should handle 200 (success class)', async () => {
    mockResponse(200, { data: 'ok' });
    const result = await apiCall();
    expect(result.success).toBe(true);
  });

  // Classe: 4xx (erro do cliente)
  it('should handle 404 (client error class)', async () => {
    mockResponse(404, { error: 'Not Found' });
    await expect(apiCall()).rejects.toThrow('Not Found');
  });

  // Classe: 5xx (erro do servidor)
  it('should handle 500 (server error class)', async () => {
    mockResponse(500, { error: 'Server Error' });
    await expect(apiCall()).rejects.toThrow('Server Error');
  });
});
```

### Exemplo 5: Tipo de Arquivo Upload

**Classes:**
- ✅ Válidos: Imagens (jpg, png, gif)
- ❌ Inválidos: Executáveis, scripts, documentos

```typescript
describe('File Upload - Equivalence Partitioning', () => {
  // Classe Válida: Imagens
  describe('Valid Image Files', () => {
    it('should accept JPG file', () => {
      const file = { name: 'photo.jpg', type: 'image/jpeg' };
      expect(validateFile(file)).toBe(true);
    });

    it('should accept PNG file', () => {
      const file = { name: 'photo.png', type: 'image/png' };
      expect(validateFile(file)).toBe(true);
    });
  });

  // Classes Inválidas
  describe('Invalid Files', () => {
    it('should reject executable', () => {
      const file = { name: 'virus.exe', type: 'application/x-msdownload' };
      expect(validateFile(file)).toBe(false);
    });

    it('should reject script', () => {
      const file = { name: 'hack.php', type: 'application/x-php' };
      expect(validateFile(file)).toBe(false);
    });

    it('should reject document', () => {
      const file = { name: 'doc.pdf', type: 'application/pdf' };
      expect(validateFile(file)).toBe(false);
    });
  });
});
```

## Combinando com Boundary Analysis

Use os dois juntos para cobertura completa:

```typescript
describe('Age Category - EP + BVA', () => {
  // Equivalence Partitioning: Classes
  describe('Child (0-12)', () => {
    it('should categorize 6 as child', () => {
      expect(getAgeCategory(6)).toBe('child');
    });
  });

  describe('Teen (13-17)', () => {
    it('should categorize 15 as teen', () => {
      expect(getAgeCategory(15)).toBe('teen');
    });
  });

  describe('Adult (18+)', () => {
    it('should categorize 25 as adult', () => {
      expect(getAgeCategory(25)).toBe('adult');
    });
  });

  // Boundary Value Analysis: Limites entre classes
  describe('Boundaries', () => {
    it('should categorize 12 as child (max child)', () => {
      expect(getAgeCategory(12)).toBe('child');
    });

    it('should categorize 13 as teen (min teen)', () => {
      expect(getAgeCategory(13)).toBe('teen');
    });

    it('should categorize 17 as teen (max teen)', () => {
      expect(getAgeCategory(17)).toBe('teen');
    });

    it('should categorize 18 as adult (min adult)', () => {
      expect(getAgeCategory(18)).toBe('adult');
    });
  });
});
```

## Template Reutilizável

```typescript
describe('[Feature] - Equivalence Partitioning', () => {
  describe('Valid Classes', () => {
    it('should handle class 1 correctly', () => {
      // Teste um valor representativo da classe 1
    });

    it('should handle class 2 correctly', () => {
      // Teste um valor representativo da classe 2
    });
  });

  describe('Invalid Classes', () => {
    it('should reject invalid class 1', () => {
      // Teste um valor representativo de classe inválida
    });

    it('should reject invalid class 2', () => {
      // Teste outro valor representativo de classe inválida
    });
  });
});
```

## Redução de Testes

**Sem EP:** Testar 1, 2, 3, 4, 5, 6, 7, 8, 9, 10... = Muitos testes

**Com EP:** Testar 5 (classe 1-9), 25 (classe 10-49), 75 (classe 50-99), 150 (classe 100+) = 4 testes

```typescript
// ❌ SEM Equivalence Partitioning (redundante)
it('should give no discount for 1', () => {});
it('should give no discount for 2', () => {});
it('should give no discount for 3', () => {});
// ... 9 testes para mesma classe!

// ✅ COM Equivalence Partitioning (eficiente)
it('should give no discount for any value in 1-9 range', () => {
  expect(calculateDiscount(5, 100)).toBe(0); // 5 representa toda a classe
});
```

## Identificando Classes

### Passo a Passo:

1. **Leia a especificação**
2. **Identifique ranges/categorias**
3. **Separe em classes válidas e inválidas**
4. **Escolha um valor representativo de cada classe**
5. **Crie um teste por classe**

### Exemplo Prático:

**Especificação:** "Sistema aceita códigos postais brasileiros (8 dígitos) ou com hífen (formato: 12345-678)"

**Classes:**
- ✅ Válida 1: 8 dígitos sem hífen (ex: "12345678")
- ✅ Válida 2: Com hífen no formato correto (ex: "12345-678")
- ❌ Inválida 1: Menos de 8 dígitos (ex: "1234")
- ❌ Inválida 2: Mais de 9 caracteres (ex: "123456789")
- ❌ Inválida 3: Hífen na posição errada (ex: "123-45678")
- ❌ Inválida 4: Contém letras (ex: "1234A678")

```typescript
describe('CEP Validation', () => {
  it('accepts 8 digits without hyphen', () => {
    expect(validateCEP('12345678')).toBe(true);
  });

  it('accepts correct format with hyphen', () => {
    expect(validateCEP('12345-678')).toBe(true);
  });

  it('rejects less than 8 digits', () => {
    expect(validateCEP('1234')).toBe(false);
  });

  it('rejects more than 9 characters', () => {
    expect(validateCEP('123456789')).toBe(false);
  });

  it('rejects hyphen in wrong position', () => {
    expect(validateCEP('123-45678')).toBe(false);
  });

  it('rejects letters', () => {
    expect(validateCEP('1234A678')).toBe(false);
  });
});
```

## Quando Usar

✅ **Use quando:**
- Há múltiplos ranges de valores
- Há categorias/classificações
- Quer reduzir número de testes
- Valores dentro de um range se comportam igual

❌ **Não use quando:**
- Cada valor tem comportamento único
- Já tem poucos casos para testar
- Limites são mais importantes que classes

## Checklist

- [ ] Identifiquei todas as classes de equivalência?
- [ ] Separei classes válidas e inválidas?
- [ ] Escolhi um representante de cada classe?
- [ ] Combinei com boundary analysis nos limites?
- [ ] Reduzi testes redundantes?

---

**Comando:** `/tecnica equivalence [funcionalidade com categorias/ranges]`

**Exemplo:** `/tecnica equivalence sistema de frete que varia por peso: 0-5kg, 5-10kg, 10-20kg, 20+kg`


# 🔢 Heurística 0-1-Many

## O que é?

Teste com três quantidades essenciais: **zero**, **um** e **muitos** elementos. Essa heurística simples revela muitos bugs relacionados a coleções, loops e condições.

## Regra de Ouro

**Para qualquer coleção, lista, array ou conjunto, sempre teste com:**
- **0** elementos (vazio)
- **1** elemento (singular)
- **Many** elementos (múltiplos, geralmente 3+)

## Por que funciona?

- **0**: Revela problemas com casos vazios, divisão por zero, loops que não executam
- **1**: Testa o caso mais simples, revela problemas com singular/plural
- **Many**: Revela problemas com iteração, performance, ordenação

## Exemplos Práticos

### Shopping Cart

```typescript
describe('ShoppingCart - 0-1-Many', () => {
  describe('with 0 items', () => {
    it('should have total of 0', () => {
      const cart = new ShoppingCart();
      expect(cart.getTotal()).toBe(0);
    });

    it('should display empty cart message', () => {
      const cart = new ShoppingCart();
      expect(cart.isEmpty()).toBe(true);
      expect(cart.getMessage()).toBe('Your cart is empty');
    });

    it('should not allow checkout', () => {
      const cart = new ShoppingCart();
      expect(() => cart.checkout()).toThrow('Cannot checkout empty cart');
    });
  });

  describe('with 1 item', () => {
    it('should calculate correct total', () => {
      const cart = new ShoppingCart();
      cart.addItem({ name: 'Product', price: 10, quantity: 1 });
      
      expect(cart.getTotal()).toBe(10);
      expect(cart.getItemCount()).toBe(1);
    });

    it('should display singular item message', () => {
      const cart = new ShoppingCart();
      cart.addItem(product);
      
      expect(cart.getMessage()).toBe('You have 1 item in your cart');
    });

    it('should allow removing the only item', () => {
      const cart = new ShoppingCart();
      const item = cart.addItem(product);
      
      cart.removeItem(item.id);
      
      expect(cart.isEmpty()).toBe(true);
    });
  });

  describe('with many items', () => {
    it('should calculate correct total for multiple items', () => {
      const cart = new ShoppingCart();
      cart.addItem({ name: 'Product 1', price: 10, quantity: 2 }); // 20
      cart.addItem({ name: 'Product 2', price: 15, quantity: 1 }); // 15
      cart.addItem({ name: 'Product 3', price: 5, quantity: 3 });  // 15
      
      expect(cart.getTotal()).toBe(50);
      expect(cart.getItemCount()).toBe(6); // Total de itens (quantities somadas)
    });

    it('should display plural items message', () => {
      const cart = new ShoppingCart();
      cart.addItem(product1);
      cart.addItem(product2);
      cart.addItem(product3);
      
      expect(cart.getMessage()).toMatch(/You have \d+ items in your cart/);
    });

    it('should handle removing item from middle', () => {
      const cart = new ShoppingCart();
      const item1 = cart.addItem(product1);
      const item2 = cart.addItem(product2);
      const item3 = cart.addItem(product3);
      
      cart.removeItem(item2.id);
      
      expect(cart.getItems()).toEqual([item1, item3]);
      expect(cart.getItemCount()).toBe(2);
    });

    it('should apply bulk discount', () => {
      const cart = new ShoppingCart();
      // Adicionar 10 itens para trigger discount de 10%
      for (let i = 0; i < 10; i++) {
        cart.addItem({ name: `Product ${i}`, price: 10, quantity: 1 });
      }
      
      expect(cart.getTotal()).toBe(90); // 100 - 10% = 90
    });
  });
});
```

### Array Processing

```typescript
describe('calculateAverage - 0-1-Many', () => {
  describe('with 0 numbers', () => {
    it('should return 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });

    it('should not throw error', () => {
      expect(() => calculateAverage([])).not.toThrow();
    });
  });

  describe('with 1 number', () => {
    it('should return the number itself', () => {
      expect(calculateAverage([5])).toBe(5);
      expect(calculateAverage([0])).toBe(0);
      expect(calculateAverage([-10])).toBe(-10);
    });
  });

  describe('with many numbers', () => {
    it('should calculate correct average', () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateAverage([10, 20, 30])).toBe(20);
    });

    it('should handle large arrays efficiently', () => {
      const largeArray = Array(10000).fill(5);
      expect(calculateAverage(largeArray)).toBe(5);
    });

    it('should handle mixed positive and negative', () => {
      expect(calculateAverage([-5, 0, 5])).toBe(0);
      expect(calculateAverage([-10, -5, 15])).toBe(0);
    });
  });
});
```

### String Splitting

```typescript
describe('splitByComma - 0-1-Many', () => {
  describe('with 0 items (empty string)', () => {
    it('should return empty array for empty string', () => {
      expect(splitByComma('')).toEqual([]);
    });

    it('should return empty array for just spaces', () => {
      expect(splitByComma('   ')).toEqual([]);
    });
  });

  describe('with 1 item (no comma)', () => {
    it('should return array with single item', () => {
      expect(splitByComma('apple')).toEqual(['apple']);
    });

    it('should trim whitespace', () => {
      expect(splitByComma('  apple  ')).toEqual(['apple']);
    });
  });

  describe('with many items', () => {
    it('should split by comma', () => {
      expect(splitByComma('apple,banana,orange'))
        .toEqual(['apple', 'banana', 'orange']);
    });

    it('should handle spaces around commas', () => {
      expect(splitByComma('apple , banana , orange'))
        .toEqual(['apple', 'banana', 'orange']);
    });

    it('should handle many items (10+)', () => {
      const items = Array(15).fill(null).map((_, i) => `item${i}`);
      const input = items.join(',');
      
      expect(splitByComma(input)).toEqual(items);
    });

    it('should handle empty items between commas', () => {
      expect(splitByComma('apple,,banana,,,orange'))
        .toEqual(['apple', 'banana', 'orange']); // Remove vazios
    });
  });
});
```

### Database Queries

```typescript
describe('getUsersByRole - 0-1-Many', () => {
  describe('with 0 users', () => {
    it('should return empty array when no users exist', async () => {
      const users = await getUsersByRole('admin');
      
      expect(users).toEqual([]);
      expect(users).toHaveLength(0);
    });
  });

  describe('with 1 user', () => {
    beforeEach(async () => {
      await createUser({ role: 'admin' });
    });

    it('should return array with single user', async () => {
      const users = await getUsersByRole('admin');
      
      expect(users).toHaveLength(1);
      expect(users[0].role).toBe('admin');
    });
  });

  describe('with many users', () => {
    beforeEach(async () => {
      await createUser({ role: 'admin', name: 'Admin 1' });
      await createUser({ role: 'admin', name: 'Admin 2' });
      await createUser({ role: 'admin', name: 'Admin 3' });
      await createUser({ role: 'user', name: 'User 1' });
    });

    it('should return only users with matching role', async () => {
      const admins = await getUsersByRole('admin');
      
      expect(admins).toHaveLength(3);
      expect(admins.every(u => u.role === 'admin')).toBe(true);
    });

    it('should handle pagination', async () => {
      // Criar 50 users
      for (let i = 0; i < 50; i++) {
        await createUser({ role: 'user', name: `User ${i}` });
      }

      const page1 = await getUsersByRole('user', { page: 1, limit: 20 });
      const page2 = await getUsersByRole('user', { page: 2, limit: 20 });
      
      expect(page1).toHaveLength(20);
      expect(page2).toHaveLength(20);
    });
  });
});
```

## Padrões de Teste

### Template Genérico

```typescript
describe('[Function] - 0-1-Many', () => {
  describe('with 0 [items]', () => {
    it('should handle empty case correctly', () => {
      // Teste com coleção vazia
    });
  });

  describe('with 1 [item]', () => {
    it('should handle single item correctly', () => {
      // Teste com um único elemento
    });
  });

  describe('with many [items]', () => {
    it('should handle multiple items correctly', () => {
      // Teste com vários elementos (3+)
    });
  });
});
```

## Casos Especiais

### 0-1-Many-Boundary

Às vezes você quer adicionar um teste no **limite**:

```typescript
describe('with maximum items', () => {
  it('should handle maximum allowed items', () => {
    const cart = new ShoppingCart({ maxItems: 100 });
    
    for (let i = 0; i < 100; i++) {
      cart.addItem(product);
    }
    
    expect(cart.getItemCount()).toBe(100);
  });

  it('should reject item when at maximum', () => {
    const cart = new ShoppingCart({ maxItems: 100 });
    
    for (let i = 0; i < 100; i++) {
      cart.addItem(product);
    }
    
    expect(() => cart.addItem(product)).toThrow('Cart is full');
  });
});
```

### 0-1-2-Many

Para alguns casos, vale adicionar **2 elementos** também:

```typescript
describe('with 2 items', () => {
  it('should compare two items correctly', () => {
    // Útil para testes de comparação, ordenação, etc
  });
});
```

## Bugs Comuns que 0-1-Many Revela

### ❌ Divisão por Zero
```typescript
function calculateAverage(numbers) {
  return numbers.reduce((a, b) => a + b) / numbers.length;
  // ❌ Falha com array vazio! (divisão por zero)
}
```

### ❌ Off-by-One Errors
```typescript
function getLastItem(items) {
  return items[items.length]; // ❌ Deveria ser items.length - 1
}
```

### ❌ Singular/Plural
```typescript
function getMessage(count) {
  return `You have ${count} items`; // ❌ "You have 1 items"
}

// ✅ Correto:
function getMessage(count) {
  return count === 1 ? 'You have 1 item' : `You have ${count} items`;
}
```

### ❌ Loop Não Executado
```typescript
function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    // ❌ Nunca executa se items.length === 0
    // Pode ter lógica que assume pelo menos 1 item
  }
}
```

## Checklist

Ao testar qualquer função que recebe coleção:

- [ ] Testei com array/lista vazia (0)?
- [ ] Testei com exatamente 1 elemento?
- [ ] Testei com múltiplos elementos (3+)?
- [ ] Tratamento de singular/plural correto?
- [ ] Sem divisão por zero?
- [ ] Sem off-by-one errors?
- [ ] Performance aceitável com muitos elementos?

---

**Comando para usar:** `/heuristica 0-1-many [função ou recurso que recebe coleção]`

**Exemplo:** `/heuristica 0-1-many ShoppingCart precisa testar com cart vazio, 1 item e múltiplos itens`


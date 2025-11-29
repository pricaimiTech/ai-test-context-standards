# 🔄 Técnica: Transição de Estados (State Transition Testing)

## Tipo: Black Box

## O que é?

Testa todas as **transições válidas** e **inválidas** entre estados de um sistema. Ideal para workflows, máquinas de estado, status de pedidos, etc.

## Como Aplicar

### Exemplo 1: Status de Pedido

**Estados:** Pending → Paid → Processing → Shipped → Delivered

**Transições Válidas:**
- Pending → Paid
- Paid → Processing
- Processing → Shipped
- Shipped → Delivered
- Pending/Paid → Cancelled

```typescript
describe('Order State Transitions', () => {
  describe('Valid Transitions', () => {
    it('should transition from Pending to Paid', async () => {
      const order = await createOrder({ status: 'pending' });
      
      await order.pay();
      
      expect(order.status).toBe('paid');
    });

    it('should transition from Paid to Processing', async () => {
      const order = await createOrder({ status: 'paid' });
      
      await order.process();
      
      expect(order.status).toBe('processing');
    });

    it('should transition from Processing to Shipped', async () => {
      const order = await createOrder({ status: 'processing' });
      
      await order.ship();
      
      expect(order.status).toBe('shipped');
    });

    it('should transition from Shipped to Delivered', async () => {
      const order = await createOrder({ status: 'shipped' });
      
      await order.deliver();
      
      expect(order.status).toBe('delivered');
    });

    it('should transition from Pending to Cancelled', async () => {
      const order = await createOrder({ status: 'pending' });
      
      await order.cancel();
      
      expect(order.status).toBe('cancelled');
    });
  });

  describe('Invalid Transitions', () => {
    it('should NOT transition from Pending to Shipped', async () => {
      const order = await createOrder({ status: 'pending' });
      
      await expect(order.ship()).rejects.toThrow('Invalid state transition');
      expect(order.status).toBe('pending'); // Estado não mudou
    });

    it('should NOT transition from Delivered to Pending', async () => {
      const order = await createOrder({ status: 'delivered' });
      
      await expect(order.pay()).rejects.toThrow('Order already delivered');
    });

    it('should NOT transition from Cancelled to any state', async () => {
      const order = await createOrder({ status: 'cancelled' });
      
      await expect(order.process()).rejects.toThrow('Order is cancelled');
    });
  });

  describe('State Persistence', () => {
    it('should persist state changes', async () => {
      const order = await createOrder({ status: 'pending' });
      await order.pay();
      
      // Recarregar do banco
      const reloaded = await Order.findById(order.id);
      expect(reloaded.status).toBe('paid');
    });
  });
});
```

### Exemplo 2: Semáforo

**Estados:** Red → Yellow → Green → Yellow → Red (ciclo)

```typescript
describe('Traffic Light State Machine', () => {
  let trafficLight: TrafficLight;

  beforeEach(() => {
    trafficLight = new TrafficLight();
  });

  it('should start in Red state', () => {
    expect(trafficLight.getCurrentState()).toBe('red');
  });

  it('should transition Red → Yellow → Green → Yellow → Red', () => {
    expect(trafficLight.getCurrentState()).toBe('red');
    
    trafficLight.next();
    expect(trafficLight.getCurrentState()).toBe('yellow');
    
    trafficLight.next();
    expect(trafficLight.getCurrentState()).toBe('green');
    
    trafficLight.next();
    expect(trafficLight.getCurrentState()).toBe('yellow');
    
    trafficLight.next();
    expect(trafficLight.getCurrentState()).toBe('red'); // Volta ao início
  });

  it('should cycle through states indefinitely', () => {
    for (let i = 0; i < 12; i++) {
      trafficLight.next();
    }
    // Após 12 transições (3 ciclos completos), deve estar em red
    expect(trafficLight.getCurrentState()).toBe('red');
  });
});
```

### Exemplo 3: Conta Bancária

**Estados:** Active, Frozen, Closed

```typescript
describe('Bank Account States', () => {
  describe('Active Account', () => {
    it('can be frozen', async () => {
      const account = await createAccount({ status: 'active' });
      await account.freeze();
      expect(account.status).toBe('frozen');
    });

    it('can be closed', async () => {
      const account = await createAccount({ status: 'active', balance: 0 });
      await account.close();
      expect(account.status).toBe('closed');
    });

    it('cannot be closed with positive balance', async () => {
      const account = await createAccount({ status: 'active', balance: 100 });
      await expect(account.close()).rejects.toThrow('Balance must be zero');
    });
  });

  describe('Frozen Account', () => {
    it('can be reactivated', async () => {
      const account = await createAccount({ status: 'frozen' });
      await account.unfreeze();
      expect(account.status).toBe('active');
    });

    it('cannot make transactions while frozen', async () => {
      const account = await createAccount({ status: 'frozen', balance: 100 });
      await expect(account.withdraw(50)).rejects.toThrow('Account is frozen');
    });
  });

  describe('Closed Account', () => {
    it('cannot be reopened', async () => {
      const account = await createAccount({ status: 'closed' });
      await expect(account.reopen()).rejects.toThrow('Cannot reopen closed account');
    });

    it('cannot make any transactions', async () => {
      const account = await createAccount({ status: 'closed' });
      await expect(account.deposit(100)).rejects.toThrow('Account is closed');
    });
  });
});
```

### Exemplo 4: Pull Request no GitHub

**Estados:** Open → (Review) → Approved/Changes Requested → Merged/Closed

```typescript
describe('Pull Request Lifecycle', () => {
  it('should follow complete approval flow', async () => {
    const pr = await createPR({ status: 'open' });
    expect(pr.status).toBe('open');

    // Solicitar review
    await pr.requestReview('reviewer1');
    expect(pr.reviewers).toContain('reviewer1');

    // Aprovar
    await pr.approve('reviewer1');
    expect(pr.approvals).toContain('reviewer1');

    // Merge
    await pr.merge();
    expect(pr.status).toBe('merged');
    expect(pr.mergedAt).toBeInstanceOf(Date);
  });

  it('should handle changes requested flow', async () => {
    const pr = await createPR({ status: 'open' });

    await pr.requestChanges('reviewer1', 'Please fix tests');
    expect(pr.status).toBe('changes_requested');

    // Push novos commits
    await pr.pushCommits();
    expect(pr.status).toBe('open'); // Volta para open

    // Re-review e aprovação
    await pr.approve('reviewer1');
    await pr.merge();
    expect(pr.status).toBe('merged');
  });

  it('should not allow merge without approval', async () => {
    const pr = await createPR({ status: 'open' });
    
    await expect(pr.merge()).rejects.toThrow('Requires approval');
  });

  it('should not allow changes after merge', async () => {
    const pr = await createPR({ status: 'merged' });
    
    await expect(pr.pushCommits()).rejects.toThrow('PR is already merged');
  });
});
```

## Diagrama de Estados

Sempre desenhe (ou descreva) o diagrama:

```typescript
/**
 * State Diagram:
 * 
 *   [Draft] ──create──> [Open]
 *      ↓                   ↓
 *   [Closed]         [In Review]
 *                         ↓
 *                    [Approved] ──merge──> [Merged]
 *                         ↓
 *                  [Changes Requested] ──fix──> [Open]
 */
```

## Template para State Machine

```typescript
class StateMachine {
  private state: string;
  private validTransitions: Map<string, string[]>;

  constructor(initialState: string) {
    this.state = initialState;
    this.validTransitions = new Map([
      ['state1', ['state2', 'state3']],
      ['state2', ['state3']],
      ['state3', ['state1']], // Loop
    ]);
  }

  transition(toState: string): void {
    const allowed = this.validTransitions.get(this.state) || [];
    
    if (!allowed.includes(toState)) {
      throw new Error(`Cannot transition from ${this.state} to ${toState}`);
    }
    
    this.state = toState;
  }

  getCurrentState(): string {
    return this.state;
  }
}

describe('State Machine', () => {
  it('should allow valid transitions', () => {
    const sm = new StateMachine('state1');
    
    sm.transition('state2');
    expect(sm.getCurrentState()).toBe('state2');
    
    sm.transition('state3');
    expect(sm.getCurrentState()).toBe('state3');
  });

  it('should reject invalid transitions', () => {
    const sm = new StateMachine('state2');
    
    expect(() => sm.transition('state1')).toThrow();
  });
});
```

## Testando Todos os Caminhos

```typescript
describe('All Paths', () => {
  // Caminho completo 1: Sucesso
  it('happy path: pending → paid → processing → shipped → delivered', async () => {
    const order = await createOrder();
    await order.pay();
    await order.process();
    await order.ship();
    await order.deliver();
    expect(order.status).toBe('delivered');
  });

  // Caminho completo 2: Cancelamento
  it('cancellation path: pending → cancelled', async () => {
    const order = await createOrder();
    await order.cancel();
    expect(order.status).toBe('cancelled');
  });

  // Caminho parcial: Cancelar após pagamento
  it('late cancellation: pending → paid → cancelled', async () => {
    const order = await createOrder();
    await order.pay();
    await order.cancel();
    expect(order.status).toBe('cancelled');
  });
});
```

## Checklist

- [ ] Identifiquei todos os estados?
- [ ] Mapeei todas as transições válidas?
- [ ] Testei cada transição válida?
- [ ] Testei transições inválidas (devem falhar)?
- [ ] Testei loops (se houver)?
- [ ] Testei estado inicial?
- [ ] Testei estados finais?
- [ ] Estado persiste corretamente?

---

**Comando:** `/tecnica state-transition [sistema com estados]`

**Exemplo:** `/tecnica state-transition sistema de aprovação de documentos com estados: draft, pending_review, approved, rejected, archived`


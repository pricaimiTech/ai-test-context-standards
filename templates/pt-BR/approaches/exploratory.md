# 🔍 Abordagem: Teste Exploratório (Exploratory Testing)

## O que é?

Teste **não roteirizado** onde você aprende, projeta e executa testes simultaneamente. Combinação de aprendizado, planejamento e execução em tempo real.

## Diferença: Scripted vs Exploratory

```
Scripted Testing:
1. Escrever casos de teste ✍️
2. Executar casos de teste ▶️
3. Reportar resultados 📊

Exploratory Testing:
1. Aprender + Projetar + Executar + Reportar (TUDO AO MESMO TEMPO) 🔄
```

## Quando Usar

✅ **Use quando:**
- Tempo limitado
- Requisitos vagos/incompletos
- Nova funcionalidade (explorar comportamento)
- Complementar testes automatizados
- Procurar bugs não óbvios
- Aprender o sistema

❌ **Não use quando:**
- Precisa de testes repetíveis/automatizados
- Precisa documentar todos os passos
- Teste de regressão (use automatizados)

## Como Aplicar

### 1. Time-Boxing (Sessões)

```typescript
/**
 * Charter: Explorar funcionalidade de checkout
 * Duração: 60 minutos
 * Foco: Fluxo de pagamento e validações
 * 
 * Descobertas:
 * - Bug: Não valida CVV com 4 dígitos (Amex)
 * - Sugestão: Adicionar feedback visual em campos inválidos
 * - Dúvida: O que acontece se sessão expirar durante pagamento?
 */
```

**Template de Charter:**

```markdown
## Sessão de Teste Exploratório

**Data**: 2024-01-15
**Testador**: João Silva
**Duração**: 90 minutos
**Build/Versão**: v2.3.0

### Charter
Explorar [funcionalidade X] com foco em [aspecto Y]

### Áreas Testadas
- [ ] Login flow
- [ ] Form validation
- [ ] Error handling
- [ ] Edge cases

### Bugs Encontrados
1. [BUG-123] Campo aceita email inválido
2. [BUG-124] Botão fica habilitado após erro

### Observações
- Performance degradou com 1000+ itens
- UX confusa no step 3

### Questões
- O que deveria acontecer se...?
- Comportamento X é intencional?
```

### 2. Tours (Roteiros)

#### Tourist Tour (Turista)
Explore features principais como um turista:

```typescript
describe('Tourist Tour - E-commerce', () => {
  it('should complete happy path', async () => {
    // 1. Navegar homepage
    await page.goto('/');
    // Observar: layout, elementos visíveis, performance
    
    // 2. Buscar produto
    await page.fill('[data-testid="search"]', 'laptop');
    // Observar: resultados, ordenação, filtros
    
    // 3. Ver detalhes
    await page.click('.product-card:first-child');
    // Observar: informações, imagens, reviews
    
    // 4. Adicionar ao carrinho
    await page.click('[data-testid="add-to-cart"]');
    // Observar: feedback, animação, contador
    
    // 5. Checkout
    await page.goto('/checkout');
    // Observar: resumo, validações, métodos de pagamento
  });
});
```

#### Saboteur Tour (Sabotador)
Tente quebrar o sistema:

```typescript
describe('Saboteur Tour', () => {
  it('should try to break the system', async () => {
    // Tentar inputs inválidos
    await page.fill('[name="email"]', '<script>alert(1)</script>');
    await page.fill('[name="quantity"]', '-1');
    await page.fill('[name="price"]', '999999999999');
    
    // Clicar múltiplas vezes
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="submit"]');
    }
    
    // Voltar/avançar no navegador
    await page.goBack();
    await page.goForward();
    
    // Modificar localStorage
    await page.evaluate(() => {
      localStorage.setItem('cart', 'invalid json');
    });
  });
});
```

#### Obsessive-Compulsive Tour
Repita mesma ação várias vezes:

```typescript
describe('OCD Tour', () => {
  it('should handle repeated actions', async () => {
    // Adicionar/remover item 50 vezes
    for (let i = 0; i < 50; i++) {
      await page.click('[data-testid="add"]');
      await page.click('[data-testid="remove"]');
    }
    
    // Atualizar página repetidamente
    for (let i = 0; i < 20; i++) {
      await page.reload();
    }
  });
});
```

### 3. Heurísticas de Exploração

#### SFDIPOT
Use para guiar exploração (já vimos na heurística):
- Structure, Function, Data, Interface, Platform, Operation, Time

#### CRUD
Explore:
- Create várias vezes seguidas
- Read com diferentes filtros
- Update campos um por um
- Delete e tentar acessar depois

#### Goldilocks
Teste com valores:
- Muito pequenos
- Adequados
- Muito grandes

### 4. Pair Testing

Dois testadores explorando juntos:

```typescript
// Testador 1: Navega
// Testador 2: Observa e anota
// Depois: Trocar papéis

/**
 * Session Notes:
 * 
 * Testador A (navegando):
 * - Tentou fazer X mas Y aconteceu
 * - Esperava ver Z mas não apareceu
 * 
 * Testador B (observando):
 * - Notei que loading demora muito
 * - Error message não é clara
 * - Sugestão: tentar com usuário diferente
 */
```

### 5. Questions-Driven Exploration

Faça perguntas e explore para responder:

```typescript
/**
 * Pergunta 1: O que acontece se exceder limite de itens no carrinho?
 * Exploração:
 * - Adicionar 100 itens → OK
 * - Adicionar 1000 itens → Performance degrada
 * - Adicionar 10000 itens → Navegador trava!
 * 
 * Bug encontrado: Sem limite máximo de itens
 * 
 * Pergunta 2: Como sistema lida com conexão lenta?
 * Exploração:
 * - Simular 3G
 * - Simular offline/online intermitente
 * - Descoberta: Requests duplicados quando offline
 */
```

## Técnicas de Exploração

### Variáveis
Altere uma variável por vez:

```typescript
// Variável: Tipo de usuário
- User comum
- User premium
- User admin
- User sem permissão

// Variável: Estado do sistema
- Sistema vazio (primeira vez)
- Sistema com dados
- Sistema com muitos dados (1000+ registros)
- Sistema durante manutenção
```

### Combinações Incomuns

```typescript
// Testar combinações raras:
describe('Unusual Combinations', () => {
  it('should handle edge combinations', async () => {
    // Usuário premium + cupom de desconto + item em promoção
    await applyPromotionCode('PROMO50');
    await addPremiumItem(); // Já tem desconto
    // Qual desconto prevalece?
    
    // Produto físico + download digital no mesmo pedido
    await addPhysicalProduct();
    await addDigitalProduct();
    // Como calcular frete?
  });
});
```

### Sequências Não Lineares

```typescript
// Não seguir o fluxo normal:
describe('Non-linear Flow', () => {
  it('should handle skipping steps', async () => {
    // 1. Ir direto para step 3 via URL
    await page.goto('/checkout/step-3');
    // O que acontece?
    
    // 2. Voltar 2 steps
    await page.goto('/checkout/step-1');
    // Dados persistem?
    
    // 3. Pular direto para confirmação
    await page.goto('/checkout/complete');
    // Sistema previne?
  });
});
```

## Registro e Documentação

### Mind Map

```
Login
├── Valid Credentials
│   ├── Remember me checked
│   ├── Remember me unchecked
│   └── Multiple tabs
├── Invalid Credentials
│   ├── Wrong password
│   ├── Wrong email
│   └── Both wrong
└── Edge Cases
    ├── SQL injection attempt
    ├── XSS attempt
    └── Very long password (1000+ chars)
```

### Session Notes Template

```markdown
# Exploração: [Feature Name]

## Setup
- Ambiente: Staging
- Dados de teste: User #123
- Navegador: Chrome 120

## Timeline
- 14:00 - Iniciado exploração de login
- 14:15 - Encontrado bug XYZ
- 14:30 - Testado variações de email
- 14:45 - Explorado reset password
- 15:00 - Encerrado

## Bugs Encontrados
1. [Crítico] Sistema aceita email sem @
2. [Médio] Loading infinito em 3G

## Observações
- UX confusa no link "Esqueci senha"
- Sugestão: adicionar validação em tempo real

## Para Próxima Sessão
- Testar integração com OAuth
- Explorar cenário de conta bloqueada
```

## Ferramentas

### Session-Based Test Management (SBTM)

```typescript
/**
 * Charter: Explore payment processing
 * 
 * Time:
 * - Setup: 10min
 * - Testing: 60min
 * - Bug reporting: 20min
 * 
 * Coverage:
 * - Credit card: 40%
 * - PayPal: 30%
 * - PIX: 20%
 * - Bug investigation: 10%
 * 
 * Metrics:
 * - Bugs found: 3
 * - Questions raised: 5
 * - Test ideas generated: 8
 */
```

## Combining with Automation

```typescript
// Use exploratório para encontrar bugs
// Depois automatize os cenários importantes:

describe('Bugs found during exploration', () => {
  it('should validate email format (Bug #123)', () => {
    // Exploração encontrou este bug
    // Agora automatizar para regressão
    expect(validateEmail('invalid')).toBe(false);
  });

  it('should handle concurrent cart updates (Bug #124)', () => {
    // Cenário descoberto explorando
    // Automatizar para garantir fix
  });
});
```

## Checklist

- [ ] Defini charter claro
- [ ] Time-boxed (30-90 minutos)
- [ ] Explorei happy path
- [ ] Tentei quebrar o sistema (saboteur)
- [ ] Testei combinações incomuns
- [ ] Documentei descobertas
- [ ] Registrei bugs encontrados
- [ ] Listei perguntas/dúvidas
- [ ] Sugeri melhorias
- [ ] Automatizei cenários importantes

---

**Comando:** `/abordagem exploratory [funcionalidade]`

**Exemplo:** `/abordagem exploratory nova feature de chat preciso explorar todos os cenários possíveis em 60 minutos`


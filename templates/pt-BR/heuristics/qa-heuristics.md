# 🎯 Heurísticas de QA

## O que são Heurísticas de Teste?

Heurísticas são atalhos mentais, regras práticas e estratégias que ajudam testadores a encontrar bugs de forma eficiente. São guias, não regras absolutas.

## Heurísticas de Cobertura de Teste

### SFDIPOT (San Francisco Depot)

Mnemônico para lembrar diferentes tipos de teste:

- **S**tructure (Estrutura) - Teste a arquitetura e organização do código
- **F**unction (Função) - Teste cada funcionalidade conforme especificada
- **D**ata (Dados) - Teste com diferentes tipos e combinações de dados
- **I**nterface (Interface) - Teste todas as interfaces (UI, API, CLI)
- **P**latform (Plataforma) - Teste em diferentes sistemas operacionais, browsers, dispositivos
- **O**peration (Operação) - Teste o sistema em diferentes estados operacionais
- **T**ime (Tempo) - Teste comportamentos relacionados ao tempo

### FEW HICCUPPS

Dimensões de qualidade do produto:

- **F**eature Set - Conjunto de funcionalidades
- **E**xperience - Experiência do usuário
- **W**orkflow - Fluxo de trabalho

- **H**elpful - Documentação útil
- **I**nput/Output - Entrada e saída de dados
- **C**ompatibility - Compatibilidade com outros sistemas
- **C**omplexity - Complexidade do sistema
- **U**sability - Facilidade de uso
- **P**erformance - Desempenho
- **P**ortability - Portabilidade
- **S**ecurity - Segurança

## Técnicas de Teste

### Análise de Valor Limite (Boundary Value Analysis)

Teste nos limites e adjacências:

```typescript
// Exemplo: Validação de idade (18-65)
const testCases = [
  { age: 17, valid: false },  // Abaixo do mínimo
  { age: 18, valid: true },   // Mínimo (válido)
  { age: 19, valid: true },   // Acima do mínimo
  { age: 64, valid: true },   // Abaixo do máximo
  { age: 65, valid: true },   // Máximo (válido)
  { age: 66, valid: false },  // Acima do máximo
];

// Também teste:
{ age: 0, valid: false },     // Zero
{ age: -1, valid: false },    // Negativo
{ age: null, valid: false },  // Null
{ age: undefined, valid: false }, // Undefined
{ age: 'abc', valid: false }, // Tipo errado
{ age: Infinity, valid: false }, // Infinito
```

### Particionamento de Equivalência

Divida inputs em classes equivalentes:

```typescript
// Exemplo: Desconto por quantidade
// 1-9: sem desconto
// 10-49: 10% desconto
// 50-99: 20% desconto
// 100+: 30% desconto

const testCases = [
  { quantity: 5, discount: 0 },     // Classe 1
  { quantity: 25, discount: 10 },   // Classe 2
  { quantity: 75, discount: 20 },   // Classe 3
  { quantity: 150, discount: 30 },  // Classe 4
];

// Também teste os limites de cada classe
```

### Pairwise Testing (All-Pairs)

Teste todas as combinações de pares de parâmetros:

```typescript
// Parâmetros:
// Browser: Chrome, Firefox, Safari
// OS: Windows, Mac, Linux
// Language: EN, PT, ES

// Em vez de 3×3×3 = 27 testes, Pairwise reduz para ~9:
const testCases = [
  { browser: 'Chrome', os: 'Windows', lang: 'EN' },
  { browser: 'Chrome', os: 'Mac', lang: 'PT' },
  { browser: 'Chrome', os: 'Linux', lang: 'ES' },
  { browser: 'Firefox', os: 'Windows', lang: 'PT' },
  { browser: 'Firefox', os: 'Mac', lang: 'ES' },
  { browser: 'Firefox', os: 'Linux', lang: 'EN' },
  { browser: 'Safari', os: 'Windows', lang: 'ES' },
  { browser: 'Safari', os: 'Mac', lang: 'EN' },
  { browser: 'Safari', os: 'Linux', lang: 'PT' },
];
```

### State Transition Testing

Teste transições entre estados:

```typescript
// Exemplo: Estados de um pedido
enum OrderState {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Transições válidas
const validTransitions = [
  { from: 'PENDING', to: 'PAID', action: 'pay' },
  { from: 'PAID', to: 'PROCESSING', action: 'process' },
  { from: 'PROCESSING', to: 'SHIPPED', action: 'ship' },
  { from: 'SHIPPED', to: 'DELIVERED', action: 'deliver' },
  { from: 'PENDING', to: 'CANCELLED', action: 'cancel' },
  { from: 'PAID', to: 'CANCELLED', action: 'cancel' },
];

// Testar transições inválidas
const invalidTransitions = [
  { from: 'PENDING', to: 'SHIPPED' },      // Pular estados
  { from: 'DELIVERED', to: 'PENDING' },    // Voltar para trás
  { from: 'CANCELLED', to: 'PAID' },       // Reativar cancelado
];
```

## Heurísticas de Busca de Bugs

### CRUD

Teste operações básicas em todos os recursos:

- **C**reate - Criar novos registros
- **R**ead - Ler/visualizar registros
- **U**pdate - Atualizar registros existentes
- **D**elete - Deletar registros

Para cada operação, teste:
- Casos de sucesso
- Casos de erro
- Permissões
- Validações
- Edge cases

### Goldilocks (Test em 3s)

Teste com três valores: muito pequeno, adequado, muito grande

```typescript
// Exemplo: Campo de texto
const testInputs = [
  '',                                    // Vazio (muito pequeno)
  'Valid Name',                          // Válido (adequado)
  'A'.repeat(1000),                      // Muito longo (muito grande)
];

// Exemplo: Upload de arquivo
const testFiles = [
  { size: 0, name: 'empty.txt' },        // Arquivo vazio
  { size: 1024, name: 'valid.txt' },     // Arquivo normal
  { size: 100*1024*1024, name: 'huge.txt' }, // Arquivo gigante
];
```

### 0, 1, Many

Teste com zero, um e múltiplos itens:

```typescript
// Exemplo: Lista de produtos no carrinho
describe('Shopping Cart', () => {
  test('with 0 items', () => {
    // Carrinho vazio
  });

  test('with 1 item', () => {
    // Um único item
  });

  test('with many items', () => {
    // Múltiplos itens (ex: 10, 100)
  });
});

// Exemplo: Array de emails
const testCases = [
  { emails: [], description: 'no emails' },
  { emails: ['one@test.com'], description: 'one email' },
  { emails: ['a@test.com', 'b@test.com', 'c@test.com'], description: 'many emails' },
];
```

### Touring Heuristics

Diferentes "tours" pela aplicação:

**Guidebook Tour** - Siga o happy path conforme documentação
**Money Tour** - Teste funcionalidades que geram receita
**Landmark Tour** - Visite todas as telas principais
**Intellectual Tour** - Teste os recursos mais complexos
**FedEx Tour** - Siga o fluxo de dados através do sistema
**Saboteur Tour** - Tente quebrar o sistema propositalmente
**Antisocial Tour** - Use a aplicação de forma não intencional
**Obsessive-Compulsive Tour** - Repita mesmas ações múltiplas vezes

## Heurísticas de Dados de Teste

### CRUSSPIC STMPL

Categorias de dados de teste:

- **C**ompliant - Dados em conformidade
- **R**andom - Dados aleatórios
- **U**nique - Dados únicos
- **S**imilar - Dados similares
- **S**pecial - Caracteres especiais
- **P**attern - Padrões específicos
- **I**nvalid - Dados inválidos
- **C**orrupt - Dados corrompidos

- **S**tructure - Estrutura dos dados
- **T**ype - Tipos de dados
- **M**issing - Dados faltando
- **P**ermutation - Permutações
- **L**arge - Dados grandes

```typescript
const testData = {
  // Compliant
  validEmail: 'user@example.com',
  
  // Random
  randomEmail: generateRandomEmail(),
  
  // Unique
  uniqueEmail: `user-${Date.now()}@test.com`,
  
  // Similar
  similarEmail: 'user@examp1e.com', // l -> 1
  
  // Special characters
  specialChars: 'user+test@example.com',
  unicodeEmail: 'üser@exämple.com',
  
  // Invalid
  invalidEmail: 'not-an-email',
  
  // Missing
  missingAt: 'userexample.com',
  
  // Large
  longEmail: 'a'.repeat(255) + '@example.com',
};
```

### Dados de Borda (Edge Data)

```typescript
// Strings
const stringTests = [
  '',                           // Vazio
  ' ',                          // Espaço
  '   ',                        // Múltiplos espaços
  '\n\t',                       // Whitespace
  'a'.repeat(255),              // Máximo permitido
  'a'.repeat(256),              // Acima do máximo
  '<script>alert(1)</script>',  // XSS
  "'; DROP TABLE users; --",    // SQL Injection
  '../../../etc/passwd',        // Path traversal
  '你好世界',                    // Unicode
  '🎉🎈🎊',                      // Emojis
  'null',                       // String "null"
  'undefined',                  // String "undefined"
];

// Números
const numberTests = [
  0,                            // Zero
  -1,                           // Negativo
  1,                            // Um
  Number.MAX_SAFE_INTEGER,      // Máximo seguro
  Number.MAX_SAFE_INTEGER + 1,  // Acima do máximo
  Number.MIN_SAFE_INTEGER,      // Mínimo seguro
  Infinity,                     // Infinito
  -Infinity,                    // Infinito negativo
  NaN,                          // Not a Number
  0.1 + 0.2,                    // Float precision issue
];

// Datas
const dateTests = [
  new Date('1970-01-01'),       // Unix epoch
  new Date('2000-01-01'),       // Y2K
  new Date('2038-01-19'),       // 32-bit timestamp limit
  new Date('2024-02-29'),       // Ano bissexto
  new Date('2023-02-29'),       // Ano não bissexto (inválido)
  new Date('Invalid'),          // Data inválida
];

// Arrays
const arrayTests = [
  [],                           // Vazio
  [1],                          // Um elemento
  [1, 2, 3],                    // Múltiplos elementos
  Array(1000).fill(1),          // Array grande
  [null, undefined, NaN],       // Valores especiais
  [1, '2', true, {}],           // Tipos mistos
];

// Objetos
const objectTests = [
  {},                           // Vazio
  { key: 'value' },             // Simples
  { nested: { deep: { value: 1 } } }, // Aninhado
  { circular: {} },             // Referência circular
  Object.create(null),          // Sem prototype
];

// Configurar referência circular
objectTests[3].circular = objectTests[3];
```

## Heurísticas de Compatibilidade

### Browsers (COWS)

- **C**hrome
- **O**pera
- (Microsoft Edge - Chromium-based)
- **S**afari
- Also test: Firefox

### Dispositivos

- Desktop (Windows, Mac, Linux)
- Tablets (iPad, Android tablets)
- Smartphones (iOS, Android - diferentes tamanhos)
- Smartwatches (se aplicável)

### Resoluções Comuns

```typescript
const viewports = [
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1024, height: 768, name: 'iPad Landscape' },
  { width: 1366, height: 768, name: 'Laptop' },
  { width: 1920, height: 1080, name: 'Desktop Full HD' },
  { width: 2560, height: 1440, name: 'Desktop 2K' },
  { width: 3840, height: 2160, name: 'Desktop 4K' },
];
```

## Heurísticas de Performance

### Load, Stress, Spike Testing

```typescript
// Load Testing - Comportamento sob carga esperada
// 1000 usuários simultâneos por 10 minutos

// Stress Testing - Encontrar ponto de quebra
// Aumentar usuários até sistema falhar

// Spike Testing - Aumento súbito de carga
// 100 → 10000 usuários em 10 segundos

// Soak Testing - Performance ao longo do tempo
// 1000 usuários por 24 horas
```

### Métricas Importantes

- **Response Time** - Tempo de resposta (< 200ms ideal)
- **Throughput** - Requisições por segundo
- **Error Rate** - Taxa de erro (< 0.1%)
- **CPU Usage** - Uso de CPU (< 70%)
- **Memory Usage** - Uso de memória
- **Database Connections** - Conexões abertas
- **Network Bandwidth** - Largura de banda

## Heurísticas de Segurança

### STRIDE

Categorias de ameaças:

- **S**poofing - Falsificação de identidade
- **T**ampering - Adulteração de dados
- **R**epudiation - Repúdio de ações
- **I**nformation Disclosure - Divulgação de informações
- **D**enial of Service - Negação de serviço
- **E**levation of Privilege - Elevação de privilégio

```typescript
// Spoofing
test('should not allow user to impersonate another user');

// Tampering
test('should validate data integrity');
test('should reject modified JWT tokens');

// Repudiation
test('should log all critical actions');
test('should have audit trail');

// Information Disclosure
test('should not expose sensitive data in error messages');
test('should not return stack traces to client');

// Denial of Service
test('should have rate limiting');
test('should handle malformed requests');

// Elevation of Privilege
test('should enforce role-based access control');
test('should not allow privilege escalation');
```

### OWASP Top 10

1. **Broken Access Control**
2. **Cryptographic Failures**
3. **Injection**
4. **Insecure Design**
5. **Security Misconfiguration**
6. **Vulnerable Components**
7. **Authentication Failures**
8. **Software and Data Integrity Failures**
9. **Logging and Monitoring Failures**
10. **Server-Side Request Forgery (SSRF)**

## Checklist de Heurísticas

### Para Cada Funcionalidade Nova

- [ ] Happy path funciona?
- [ ] Validações estão corretas?
- [ ] Tratamento de erro funciona?
- [ ] Funciona com dados vazios?
- [ ] Funciona com dados grandes?
- [ ] Funciona em diferentes browsers?
- [ ] Funciona em mobile?
- [ ] Performance é aceitável?
- [ ] Segurança foi considerada?
- [ ] Acessibilidade foi verificada?
- [ ] Documentação existe?
- [ ] Logs estão adequados?

### Antes de Cada Release

- [ ] Todos os testes passam?
- [ ] Performance não regrediu?
- [ ] Sem vulnerabilidades conhecidas?
- [ ] Documentação atualizada?
- [ ] Migration/rollback plan existe?
- [ ] Monitoring configurado?
- [ ] Backups funcionam?

## Oráculos de Teste

Fontes de verdade para validar comportamento:

1. **Especificação** - Requisitos documentados
2. **Comparação** - Comparar com versão anterior ou concorrente
3. **Heurística** - Princípios gerais (CRUD, etc)
4. **Consistência** - Comportamento consistente em todo sistema
5. **História** - Padrões históricos de bugs

## Princípios Fundamentais

### Pesticide Paradox

> "Testes executados repetidamente não encontrarão novos bugs"

**Solução**: Revise e atualize casos de teste regularmente

### Error Guessing

Use experiência e intuição para prever onde bugs podem estar:

- Código recém-modificado
- Código complexo
- Código com histórico de bugs
- Integrações entre sistemas
- Tratamento de casos especiais
- Lógica de negócio crítica

### Exploratory Testing

Combine aprendizado, design e execução de testes simultaneamente:

- Use charters de teste (objetivos de 60-90min)
- Documente o que aprendeu
- Siga sua intuição
- Faça perguntas
- Varie suas ações

---

**Lembre-se**: Heurísticas são guias, não regras. Adapte ao contexto do seu projeto e use seu julgamento profissional.


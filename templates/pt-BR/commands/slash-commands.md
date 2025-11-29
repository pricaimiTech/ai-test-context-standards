# 🎯 Sistema de Comandos Slash

## O que são?

Comandos slash são atalhos para invocar **contextos específicos** de teste, heurísticas ou técnicas, permitindo que você oriente a IA rapidamente sobre qual abordagem usar.

## Inspiração: BMAD

Inspirado no [BMAD (Build Me A Diagram)](https://github.com/bmad-sim/bmad-ecosystem), este sistema permite invocar contextos específicos usando `/` seguido do comando.

## Como Usar

### Sintaxe Básica

```
/comando [contexto] [descrição da tarefa]
```

### Exemplos

```
/heuristica sfdipot UserService.createUser() preciso testar todas as dimensões

/tecnica boundary-analysis validateAge() testar limites de idade

/abordagem exploratory feature de checkout nova, preciso explorar todos cenários
```

## Comandos Disponíveis

### `/heuristica [nome]`

Aplica uma heurística específica de QA aos testes.

**Heurísticas Disponíveis:**

- **sfdipot** - Structure, Function, Data, Interface, Platform, Operation, Time
- **crud** - Create, Read, Update, Delete
- **0-1-many** - Zero, One, Many (boundary testing)
- **goldilocks** - Too little, Just right, Too much
- **stride** - Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege
- **owasp-top10** - OWASP Top 10 security risks

**Exemplos:**

```
/heuristica sfdipot 
Preciso testar o endpoint POST /api/users
Garanta que todas as dimensões SFDIPOT sejam cobertas

/heuristica crud
Sistema de gerenciamento de produtos
Teste todos os aspectos CRUD

/heuristica 0-1-many
Função que processa array de itens
Teste com 0, 1 e muitos elementos

/heuristica goldilocks
Validação de senha
Teste senha muito curta, adequada, e muito longa

/heuristica stride
Endpoint de autenticação /auth/login
Analise ameaças de segurança STRIDE

/heuristica owasp-top10
API REST completa
Verificar vulnerabilidades OWASP
```

### `/tecnica [nome]`

Aplica uma técnica específica de teste.

**Técnicas Black Box:**

- **boundary-analysis** - Análise de valores limites
- **equivalence-partitioning** - Particionamento de equivalência
- **state-transition** - Transição de estados
- **decision-table** - Tabela de decisão

**Técnicas White Box:**

- **statement-coverage** - Cobertura de statements
- **branch-coverage** - Cobertura de branches
- **path-coverage** - Cobertura de caminhos

**Exemplos:**

```
/tecnica boundary-analysis
função validateAge(age: number)
Idade deve estar entre 0 e 120

/tecnica equivalence-partitioning
Sistema de descontos baseado em valor da compra
< $50, $50-$100, $100-$500, > $500

/tecnica state-transition
Pedido pode estar: Pending → Processing → Shipped → Delivered
Teste todas transições válidas e inválidas

/tecnica statement-coverage
PaymentService.processPayment()
Garantir 100% dos statements executados

/tecnica branch-coverage
função isEligible(age, isCitizen)
Testar todos os branches true/false

/tecnica path-coverage
Função com 3 ifs independentes
Testar todos os 8 caminhos possíveis
```

### `/abordagem [nome]`

Usa uma abordagem específica de teste.

**Abordagens Disponíveis:**

- **exploratory** - Teste exploratório
- **pairwise** - Teste combinatório pairwise
- **property-based** - Teste baseado em propriedades

**Exemplos:**

```
/abordagem exploratory
Nova feature de chat real-time
60 minutos de exploração, documentar bugs e observações

/abordagem pairwise
Sistema com 4 browsers, 3 SOs, 2 themes, 3 languages
Muitas combinações, use pairwise para reduzir

/abordagem property-based
função reverse(array)
Propriedade: reverse(reverse(x)) === x
```

## Combinando Comandos

Você pode combinar múltiplos contextos:

```
Crie testes para UserService.register()

/heuristica sfdipot
/tecnica boundary-analysis
/abordagem exploratory

Use SFDIPOT para dimensões,
boundary analysis para validações de input,
e depois explore cenários não óbvios
```

## Quando Usar Cada Comando

### Use `/heuristica` quando:
- ✅ Precisar de dimensões/aspectos a considerar
- ✅ Não souber por onde começar
- ✅ Quiser garantir cobertura ampla
- ✅ Testar segurança (STRIDE, OWASP)

### Use `/tecnica` quando:
- ✅ Souber que precisa testar limites (boundary)
- ✅ Precisar de cobertura de código específica
- ✅ Testar máquina de estados
- ✅ Criar tabela de decisão

### Use `/abordagem` quando:
- ✅ Tempo limitado (exploratory)
- ✅ Muitas combinações (pairwise)
- ✅ Propriedades matemáticas (property-based)
- ✅ Estratégia de teste específica

## Template de Uso

```markdown
## Tarefa
[Descreva o que precisa testar]

## Contexto
/[comando] [nome]

## Requisitos Específicos
- [Requisito 1]
- [Requisito 2]

## Observações
[Qualquer contexto adicional]
```

## Exemplo Completo

```markdown
## Tarefa
Criar testes para o módulo de processamento de pedidos

## Contexto
/heuristica crud
/tecnica state-transition
/abordagem exploratory

## Requisitos Específicos
- Testar criação, leitura, atualização e cancelamento de pedidos
- Validar transições de estado (Pending → Processing → Shipped → Delivered)
- Explorar cenários edge cases e comportamento sob falhas

## Observações
- Sistema integra com API de pagamento externa
- Pedidos podem ser cancelados apenas em estado Pending ou Processing
- Após 30 dias no estado Delivered, pedido é arquivado
```

**Resultado esperado:**
A IA vai gerar testes considerando:
1. **CRUD** - Todos os aspectos Create/Read/Update/Delete
2. **State Transition** - Todas transições válidas e inválidas
3. **Exploratory** - Cenários não óbvios, edge cases, falhas

## Referência Rápida

| Comando | Uso | Quando Usar |
|---------|-----|-------------|
| `/heuristica sfdipot` | Dimensões amplas | Começar testes, cobertura ampla |
| `/heuristica crud` | Operações de dados | APIs REST, repositórios |
| `/heuristica 0-1-many` | Quantidades | Arrays, coleções, loops |
| `/heuristica goldilocks` | Tamanhos/valores | Validações, limites |
| `/heuristica stride` | Segurança | Auth, APIs, dados sensíveis |
| `/heuristica owasp-top10` | Vulnerabilidades | Web apps, APIs |
| `/tecnica boundary-analysis` | Limites | Validações numéricas/string |
| `/tecnica equivalence-partitioning` | Partições | Classificações, categorias |
| `/tecnica state-transition` | Estados | Workflows, FSM |
| `/tecnica statement-coverage` | Cobertura linha | Garantir código executado |
| `/tecnica branch-coverage` | Cobertura branch | Testar if/else |
| `/tecnica path-coverage` | Cobertura caminho | Lógica complexa |
| `/abordagem exploratory` | Exploração | Tempo limitado, descobrir bugs |
| `/abordagem pairwise` | Combinações | Muitos parâmetros |
| `/abordagem property-based` | Propriedades | Funções matemáticas |

## Dicas

✅ **DO:**
- Seja específico na descrição da tarefa
- Combine comandos quando fizer sentido
- Use contexto adicional para guiar a IA
- Referencie arquivos/funções específicas

❌ **DON'T:**
- Não use comandos genéricos sem contexto
- Não combine comandos contraditórios
- Não esqueça de descrever a tarefa

## Suporte Multi-AI

Este sistema funciona com:
- ✅ **Cursor AI** (via .cursorrules)
- ✅ **Claude Code** (via claude-instructions.md)
- ✅ **GitHub Copilot** (via .github/copilot-instructions.md)
- ✅ **Google Gemini** (via .gemini-context.md)

Cada AI está configurada para entender e responder aos comandos slash.

---

**Nota**: Os comandos são case-insensitive. `/heuristica`, `/Heuristica`, `/HEURISTICA` funcionam igual.

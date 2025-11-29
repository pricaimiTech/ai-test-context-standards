# 🤖 Como Usar Comandos no Claude Code

## 📁 Estrutura

O CLI agora cria **dois sistemas de comandos**:

1. **`.ai/commands/`** - Documentação geral de comandos slash
2. **`.claude/commands/`** - Comandos individuais para Claude Code ✨

## 🎯 Como Funciona

Quando você seleciona `claude` como plataforma AI, o CLI cria:

```
seu-projeto/
├── .ai/
│   ├── heuristics/
│   ├── techniques/
│   ├── approaches/
│   └── commands/
│       └── slash-commands.md          # Documentação geral
│
├── .claude/
│   └── commands/                       # ✨ Comandos Claude
│       ├── heuristica-sfdipot.md
│       ├── heuristica-crud.md
│       ├── tecnica-boundary-analysis.md
│       ├── abordagem-exploratory.md
│       └── ... (15 arquivos total)
│
└── claude-instructions.md              # Instruções principais
```

## 💬 Como Usar no Claude Code

### Sintaxe

No Claude Code, invoque um comando digitando o nome do arquivo (sem `.md`):

```
heuristica-sfdipot
```

Ou use com contexto:

```
heuristica-sfdipot - Preciso testar UserService.createUser() 
considerando todas as dimensões SFDIPOT
```

### Exemplos Práticos

#### 1. Aplicar Heurística SFDIPOT

```
heuristica-sfdipot

Estou testando o endpoint POST /api/users
Preciso garantir cobertura de todas as dimensões
```

**O que o comando faz:**
- Carrega `.ai/heuristics/sfdipot.md`
- Aplica os conceitos ao seu teste
- Segue o checklist fornecido

#### 2. Usar Técnica de Boundary Analysis

```
tecnica-boundary-analysis

Função validateAge(age: number)
Idade deve estar entre 0 e 120
```

**O que o comando faz:**
- Carrega `.ai/techniques/black-box/boundary-analysis.md`
- Aplica a técnica aos seus testes
- Usa exemplos do arquivo

#### 3. Abordagem Exploratória

```
abordagem-exploratory

Nova feature de checkout
60 minutos de exploração
Documentar bugs e observações
```

**O que o comando faz:**
- Carrega `.ai/approaches/exploratory.md`
- Usa a abordagem para guiar os testes
- Segue as estratégias do arquivo

## 📋 Lista Completa de Comandos

### Heurísticas

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `heuristica-sfdipot` | Structure, Function, Data, Interface, Platform, Operation, Time | Cobertura ampla de dimensões |
| `heuristica-crud` | Create, Read, Update, Delete | APIs REST, repositórios |
| `heuristica-0-1-many` | Zero, One, Many | Arrays, coleções, loops |
| `heuristica-goldilocks` | Too little, Just right, Too much | Validações, limites |
| `heuristica-stride` | Security threats | Autenticação, segurança |
| `heuristica-owasp-top10` | Security vulnerabilities | Web apps, APIs |

### Técnicas Black Box

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `tecnica-boundary-analysis` | Valores limites | Validações numéricas/string |
| `tecnica-equivalence-partitioning` | Partições de equivalência | Classificações, categorias |
| `tecnica-state-transition` | Transição de estados | Workflows, FSM |

### Técnicas White Box

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `tecnica-statement-coverage` | Cobertura de statements | Garantir código executado |
| `tecnica-branch-coverage` | Cobertura de branches | Testar if/else |
| `tecnica-path-coverage` | Cobertura de caminhos | Lógica complexa |

### Abordagens

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `abordagem-exploratory` | Teste exploratório | Tempo limitado, descobrir bugs |
| `abordagem-pairwise` | Teste combinatório | Muitos parâmetros |
| `abordagem-property-based` | Propriedades matemáticas | Funções puras |

## 🔗 Como os Comandos Funcionam

Cada comando em `.claude/commands/` é um arquivo pequeno que:

1. **Referencia** o arquivo completo em `.ai/`
2. **Instrui** o Claude a ler o conteúdo completo
3. **Define prioridade** sobre padrões genéricos

### Exemplo de Estrutura de Comando

```markdown
# Heurística: SFDIPOT

Leia o arquivo completo em `.ai/heuristics/sfdipot.md` e 
aplique essa heurística aos testes.

## Contexto
Esta heurística está sendo invocada via comando slash.

## Ação
1. Leia o conteúdo completo de `.ai/heuristics/sfdipot.md`
2. Aplique os conceitos aos testes
3. Siga o checklist fornecido

## Prioridade
Esta heurística tem prioridade sobre padrões genéricos.
```

## ✨ Vantagens

### Para Claude Code
✅ Comandos nativos em `.claude/commands/`
✅ Invocação direta pelo nome
✅ Integração perfeita com o Claude

### Para Outras IAs
✅ Documentação centralizada em `.ai/`
✅ Mesmos arquivos, múltiplas IAs
✅ Consistência entre plataformas

## 🚀 Workflow Recomendado

### 1. Começar com Heurística

```
heuristica-sfdipot

Preciso testar PaymentService.processPayment()
```

### 2. Aplicar Técnica Específica

```
tecnica-boundary-analysis

Valores de pagamento devem estar entre $0.01 e $10,000
```

### 3. Usar Abordagem Complementar

```
abordagem-exploratory

Explorar cenários de falha de pagamento
```

## 📖 Documentação Adicional

- **`.ai/commands/slash-commands.md`** - Guia completo de todos os comandos
- **`claude-instructions.md`** - Instruções principais para Claude Code
- **`.ai/heuristics/`** - Conteúdo completo das heurísticas
- **`.ai/techniques/`** - Conteúdo completo das técnicas
- **`.ai/approaches/`** - Conteúdo completo das abordagens

## 🎯 Próximos Passos

1. Execute o CLI no seu projeto:
   ```bash
   npx ai-test-standards init
   ```

2. Selecione `claude` quando perguntado sobre plataformas AI

3. Verifique que `.claude/commands/` foi criado:
   ```bash
   ls -la .claude/commands/
   ```

4. Use os comandos no Claude Code!

## 💡 Dicas

- ✅ **Combine comandos**: Use heurística + técnica + abordagem
- ✅ **Seja específico**: Descreva o contexto após invocar o comando
- ✅ **Itere**: Use diferentes comandos conforme avança nos testes
- ✅ **Customize**: Edite comandos em `.claude/commands/` se necessário

---

**Agora o Claude Code entende seus comandos perfeitamente! 🎉**


# AI Test Context Standards 🤖

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991)](https://openai.com/)

> Agente Autônomo de Qualidade de Software

Uma biblioteca CLI que atua como um **QA Lead Virtual**. Ela lê requisitos de negócio (PRD), consulta um repositório remoto de heurísticas de teste e gera automaticamente planos de teste e casos de teste utilizando Inteligência Artificial (OpenAI GPT-4o-mini).

---

## ⚡ Quick Start

```bash
# 1. Clone e instale
git clone https://github.com/qajonatasmartins/ai-test-context-standards.git
cd ai-test-context-standards
npm install

# 2. Configure sua API Key
echo "OPENAI_API_KEY=sk-proj-your-key" > .env

# 3. Compile
npm run build:clean

# 4. Execute
npm run qa:review -- example/requisitos/requisito.md
npm run qa:plan -- example/requisitos/requisito.md
npm run qa:spec -- example/strategy/strategy-*.json
```

📖 Para instruções detalhadas, veja a [seção completa de instalação](#-instalação).

---

## 🚀 Funcionalidades

- ✅ **Planejamento Autônomo:** Analisa o PRD e decide *sozinho* quais técnicas de teste aplicar
- 🔍 **Revisão de Requisitos:** Identifica problemas de qualidade nos requisitos antes de criar testes
- 🌐 **Integração com GitHub:** Busca heurísticas (ex: SFDIPOT, STRIDE, Boundary Value) diretamente do repositório de padrões
- 📝 **Geração de Specs:** Cria especificações de teste detalhadas baseadas em templates otimizados
- 💰 **Baixo Custo:** Otimizado para usar modelos `gpt-4o-mini` com contexto comprimido (~$0.05 por análise completa)
- 🔌 **Agnóstico:** Separa o Código (Engine) do Conhecimento (Heurísticas em Markdown)
- 🎯 **Pipeline Estruturado:** Review → Plan → Spec em 3 comandos simples
- 📦 **Templates Prontos:** Suporte nativo para ClickUp, com Jira e Azure DevOps no roadmap

---

## 🎬 Demonstração

### Input: Requisito de Negócio

```markdown
# Sistema de Reserva de Hotel

O usuário deve poder selecionar datas de check-in e check-out.
O check-out deve ser posterior ao check-in.
```

### Output: Caso de Teste Gerado

```json
{
  "id": "TC-001",
  "title": "Verificar Check-out anterior ao Check-in",
  "preCondition": "Usuário autenticado na tela de reserva",
  "steps": [
    "1. Selecionar Check-in como data de hoje",
    "2. Selecionar Check-out como data de ontem",
    "3. Clicar em 'Continuar'"
  ],
  "expectedResult": "Sistema bloqueia e exibe: 'Check-out deve ser posterior ao Check-in'",
  "severity": "High",
  "technique": "boundary-analysis",
  "tags": ["validação", "datas", "negativo"]
}
```

### Pipeline Completo

```bash
# Passo 1: Analisa qualidade do requisito
$ npm run qa:review -- requisito.md
✓ Requisito analisado: 8.5/10
⚠ 2 ambiguidades encontradas
💡 3 sugestões de melhoria

# Passo 2: Gera estratégia de teste
$ npm run qa:plan -- requisito.md
✓ Heurísticas selecionadas: boundary-analysis, 0-1-many
✓ Abordagem: black-box
✓ Plano salvo em: strategy/strategy-2024-12-03.json

# Passo 3: Gera casos de teste
$ npm run qa:spec -- strategy/strategy-2024-12-03.json
✓ 15 casos de teste gerados
✓ Specs salvas em: specs/specs-2024-12-03.json
```

## 🛠️ Pré-requisitos

- Node.js (v18+)
- Conta na OpenAI (com créditos ativos)
- Repositório GitHub contendo as heurísticas (arquivos .md)

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/qajonatasmartins/ai-test-context-standards.git
cd ai-test-context-standards
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o ambiente:

Crie um arquivo `.env` na raiz:

```env
OPENAI_API_KEY=sk-proj-....
AI_MODEL=gpt-4o-mini
GITHUB_TOKEN=github_pat_... (Opcional, se o repo for privado)
STANDARDS_REPO=ai-test-context-standards
```

4. Compile o projeto:

```bash
npm run build:clean
```

## 🎮 Como Usar

### 1. Verificar Conexões

Antes de começar, verifique se a ferramenta consegue acessar a IA e o GitHub:

```bash
# Testa conexão com GitHub e lista heurísticas disponíveis
npm run qa:check

# Testa conexão com OpenAI e saldo
npm run qa:test-ai
```

### 2. Fluxo de Trabalho Recomendado

O processo de geração de testes segue um pipeline de 3 etapas:

```
📄 Requisito (PRD) 
    ↓
🔍 Review (Análise de Qualidade)
    ↓
📋 Plan (Estratégia de Teste)
    ↓
✅ Spec (Casos de Teste)
```

### 4. Executando os Comandos

#### 4.1 Revisar Requisitos

Analise a qualidade dos seus requisitos antes de gerar testes:

```bash
npm run qa:review -- example/requisitos/requisito.md
```

**O que vai acontecer:**
- O Agente analisa o requisito em busca de ambiguidades, lacunas e problemas.
- Gera um relatório detalhado em `example/review/`.
- Sugere melhorias antes de prosseguir.

#### 4.2 Criar Plano de Teste

Crie uma estratégia de teste com base nos requisitos revisados:

```bash
npm run qa:plan -- example/requisitos/requisito.md
```

**O que vai acontecer:**
- O Agente decide quais heurísticas aplicar (ex: SFDIPOT, Boundary Analysis, STRIDE).
- Define a abordagem de teste (caixa-preta, caixa-branca, exploratória).
- Gera um plano estratégico em `example/strategy/`.

#### 4.3 Gerar Especificações de Teste

Com o plano pronto, gere os casos de teste detalhados:

```bash
npm run qa:spec -- example/strategy/strategy-*.json
```

**O que vai acontecer:**
- O Agente gera casos de teste estruturados baseados no plano.
- Salva as especificações em `example/specs/`.
- Output pronto para integração com ferramentas como ClickUp, Jira, etc.

### 5. Modos de Execução

#### Modo Individual
Execute cada comando separadamente para controle total:

```bash
# Passo 1: Review
npm run qa:review -- meu-requisito.md

# Passo 2: Plan (após revisar e corrigir)
npm run qa:plan -- meu-requisito.md

# Passo 3: Spec (usando o plano gerado)
npm run qa:spec -- example/strategy/strategy-TIMESTAMP.json
```

#### Modo Pipeline (Futuro)
Em desenvolvimento: execução automática de todos os passos.

### 6. Dicas de Uso

**✅ Boas Práticas:**
- Sempre execute `qa:review` primeiro para identificar problemas no requisito
- Use arquivos Markdown para requisitos (melhor formatação)
- Organize seus requisitos em `example/requisitos/`
- Revise e ajuste o plano antes de gerar specs
- Mantenha backup das especificações geradas

**❌ Evite:**
- Pular a etapa de review
- Requisitos muito vagos ou incompletos
- Executar comandos sem ter a API Key configurada
- Ignorar os warnings e sugestões do review

## 📂 Estrutura do Projeto

```
ai-test-context-standards/
├── src/
│   ├── cli.ts                       # Ponto de entrada (Comandos CLI)
│   ├── core/
│   │   ├── RequirementsReviewer.ts  # Analisa qualidade dos requisitos
│   │   ├── TestPlanner.ts           # Define estratégia de teste
│   │   ├── TestExecutor.ts          # Gera casos de teste detalhados
│   │   └── ai/
│   │       ├── factory.ts           # Factory para providers de IA
│   │       ├── interfaces.ts        # Contratos de IA
│   │       └── providers/
│   │           └── openai.ts        # Integração com OpenAI
│   ├── config/
│   │   └── defaultConfig.ts         # Configurações padrão
│   ├── utils/
│   │   └── githubLoader.ts          # Conector com repositório de padrões
│   ├── prompts/
│   │   ├── criarCTs.md              # Prompt para criar casos de teste
│   │   └── formatarHeuristicas.md   # Prompt para formatar heurísticas
│   ├── templates/
│   │   ├── commands/
│   │   │   └── slash-commands.md    # Comandos disponíveis
│   │   ├── test-case/
│   │   │   └── templateCT_clickup.md  # Template ClickUp
│   │   └── test-patterns/
│   │       ├── unit.md              # Padrão de testes unitários
│   │       ├── integration.md       # Padrão de testes de integração
│   │       ├── e2e.md               # Padrão de testes E2E
│   │       └── api.md               # Padrão de testes de API
│   ├── heuristics/
│   │   └── prd-analysis.md          # Heurísticas para análise de PRD
│   └── mcp/                         # Model Context Protocol (futuro)
├── example/
│   ├── requisitos/                  # PRDs de entrada
│   │   └── requisito.md
│   ├── review/                      # Saídas de revisão de requisitos
│   ├── strategy/                    # Planos de teste gerados
│   └── specs/                       # Casos de teste gerados
├── docs/
│   ├── QUICKSTART.md                # Guia de início rápido
│   ├── PUBLISHING.md                # Guia de publicação NPM
│   ├── CLAUDE-SETUP.md              # Configuração Claude AI
│   └── libs.md                      # Bibliotecas utilizadas
├── dist/                            # Código compilado (gerado pelo build)
├── .env                             # Variáveis de ambiente (criar manualmente)
└── package.json                     # Configurações e scripts NPM
```

## 📝 Exemplos de Saída

### Review de Requisitos

```json
{
  "issues": [
    {
      "type": "ambiguity",
      "description": "Termo 'usuário válido' não está definido",
      "severity": "high",
      "suggestion": "Definir critérios de validação de usuário"
    }
  ],
  "score": 7.5,
  "recommendations": ["Adicionar critérios de aceitação", "Definir casos extremos"]
}
```

### Plano de Teste

```json
{
  "strategy": {
    "heuristics": ["SFDIPOT", "boundary-analysis"],
    "approach": "black-box",
    "priority": "high"
  },
  "testAreas": [
    {
      "feature": "Validação de datas",
      "technique": "boundary-analysis",
      "rationale": "Campo crítico com limites definidos"
    }
  ]
}
```

### Especificação de Teste

```json
{
  "id": "TC-001",
  "title": "Verificar Check-out anterior ao Check-in",
  "preCondition": "Usuário autenticado na tela de reserva",
  "steps": [
    "1. Selecionar Check-in como data de hoje",
    "2. Selecionar Check-out como data de ontem",
    "3. Clicar em 'Continuar'"
  ],
  "expectedResult": "Sistema bloqueia a operação e exibe: 'Check-out deve ser posterior ao Check-in'",
  "severity": "High",
  "technique": "boundary-analysis",
  "tags": ["validação", "datas", "negativo"]
}
```

## 🧩 Arquitetura de Heurísticas

### Estratégia Atual: Híbrida (GitHub + Fallback Local)

A ferramenta utiliza uma abordagem híbrida para máxima flexibilidade e confiabilidade:

#### 1. **Fonte Primária: GitHub (Remoto)**
- **Como funciona:** A CLI busca heurísticas do repositório em tempo de execução.
- **Manutenibilidade:** ⭐⭐⭐⭐⭐ (Excelente)
  - Times de QA podem atualizar padrões sem rebuild/redeploy
  - Versionamento via Git
  - Colaboração facilitada
- **Flexibilidade:** Total - suporta repositórios privados e públicos
- **Risco:** Dependência de rede

#### 2. **Fonte Secundária: Local (Fallback)**
- **Como funciona:** Heurísticas incluídas em `src/heuristics/` e `src/templates/` como backup
- **Uso:** Ativado automaticamente se GitHub estiver indisponível
- **Benefício:** Resiliência e funcionamento offline
- **Conteúdo Local:**
  - `src/heuristics/prd-analysis.md` - Heurísticas para análise de PRD
  - `src/templates/test-patterns/` - Padrões de teste (unit, integration, e2e, api)
  - `src/templates/commands/` - Comandos e slash-commands disponíveis
- **Manutenibilidade:** ⭐⭐ - Requer rebuild para atualizar

---

## 💰 Otimização de Custos

### Estratégia de Contexto Comprimido

Esta ferramenta implementa **prompts técnicos** ao invés de textos didáticos para minimizar consumo de tokens:

#### Comparativo de Custos (Base: gpt-4o-mini @ $0.15/1M tokens)

| Tipo de Heurística | Tokens Médios | Custo/1k execuções | Exemplo |
|:-------------------|:-------------:|:------------------:|:--------|
| **Didática** (Texto acadêmico) | ~1.500 | $0.22 | "A técnica foi criada por..." |
| **Técnica** (Instrução direta) | ~300 | $0.04 | "Aplique validação em limites..." |
| **Nossa Implementação** | **~300** | **~$0.04** | Prompts otimizados |

### Economia Real: 80% de redução em custos de tokens

**Como conseguimos:**
1. **Formato de Instrução:** Heurísticas escritas como comandos diretos à IA
2. **Remoção de Fluff:** Zero explicações históricas ou teóricas
3. **Estrutura Padronizada:** Templates fixos reduzem overhead

**Exemplo Comparativo:**

❌ **Abordagem Didática (Alto Custo):**
```markdown
# Boundary Value Analysis
A análise de valor limite foi desenvolvida nos anos 70...
Serve para identificar bugs nos limites...
Exemplo prático: imagine um campo de idade...
```

✅ **Abordagem Técnica (Baixo Custo):**
```markdown
# boundary-analysis
Foque em: min, max, min-1, max+1, valores especiais (0, null, "").
Gere testes para limites de entrada do campo.
```

---

## 🎯 Benefícios da Arquitetura

1. **Separação de Preocupações:** 
   - Engine (TypeScript) separado do Conhecimento (Markdown)
   - QAs melhoram heurísticas sem tocar no código

2. **Escalabilidade:**
   - Adicione novas heurísticas criando arquivos `.md`
   - Suporte multi-idioma via `src/templates/{pattern}/`

3. **Custo-Benefício:**
   - Modelo `gpt-4o-mini` com contexto otimizado
   - Output estruturado (JSON) reduz pós-processamento

4. **Manutenibilidade:**
   - Repositório Git para versionamento de padrões
   - CI/CD pode validar qualidade das heurísticas

---

## 🗺️ Roadmap

### ✅ Implementado (v1.0)
- [x] Análise de requisitos (qa:review)
- [x] Geração de plano de teste (qa:plan)
- [x] Geração de especificações (qa:spec)
- [x] Integração com OpenAI GPT-4o-mini
- [x] Suporte a templates locais
- [x] Comandos CLI básicos

### 🚧 Em Desenvolvimento
- [ ] Integração com GitHub para heurísticas remotas
- [ ] Model Context Protocol (MCP) - pasta `src/mcp/`
- [ ] Pipeline automatizado (review → plan → spec)
- [ ] Suporte multi-idioma (i18n)
- [ ] Templates para Jira e Azure DevOps

### 🔮 Planejado (Futuro)
- [ ] Suporte a múltiplos providers de IA (Anthropic, Gemini)
- [ ] Interface web (dashboard)
- [ ] Integração direta com ferramentas de gestão
- [ ] Exportação para diferentes formatos (CSV, Excel, XML)
- [ ] Análise de cobertura de testes
- [ ] Sugestões de testes baseadas em código-fonte

---

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|:---------|:----------|:-------|:------------|
| `OPENAI_API_KEY` | Chave de API da OpenAI | - | ✅ Sim |
| `AI_MODEL` | Modelo GPT a utilizar | `gpt-4o-mini` | ❌ Não |
| `GITHUB_TOKEN` | Token para repos privados | - | ❌ Não |
| `STANDARDS_REPO` | Nome do repositório de padrões | `ai-test-context-standards` | ❌ Não |
| `GITHUB_OWNER` | Dono do repositório de padrões | Auto-detectado | ❌ Não |

### Configuração Customizada

Você pode criar um arquivo de configuração personalizado em `config/custom.json`:

```json
{
  "ai": {
    "model": "gpt-4o-mini",
    "temperature": 0.3,
    "maxTokens": 4000
  },
  "github": {
    "owner": "seu-usuario",
    "repo": "seu-repo-de-padroes",
    "branch": "main"
  },
  "output": {
    "format": "json",
    "includeMetadata": true
  }
}
```

---

## 📚 Recursos Disponíveis

### Heurísticas de Teste (em desenvolvimento)

O projeto possui heurísticas locais e busca padrões adicionais do GitHub:

- **PRD Analysis** - Análise de qualidade de requisitos (disponível em `src/heuristics/`)
- **SFDIPOT** - Structure, Function, Data, Interfaces, Platform, Operations, Time (GitHub)
- **STRIDE** - Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation (GitHub)
- **CRUD** - Create, Read, Update, Delete (GitHub)
- **0-1-Many** - Zero, One, Many scenarios (GitHub)
- **Goldilocks** - Too Little, Just Right, Too Much (GitHub)
- **OWASP Top 10** - Security testing heuristics (GitHub)

### Técnicas de Teste (GitHub)

#### Caixa-Preta
- Análise de Valor Limite (Boundary Analysis)
- Particionamento de Equivalência
- Transição de Estados

#### Caixa-Branca
- Cobertura de Declarações
- Cobertura de Branches
- Cobertura de Caminhos

### Padrões de Teste (Disponíveis Localmente)

Templates de teste completos em `src/templates/test-patterns/`:

- **Testes Unitários** (`unit.md`) - Estrutura completa para testes unitários
- **Testes de Integração** (`integration.md`) - Padrões para testes de integração
- **Testes E2E** (`e2e.md`) - End-to-End testing patterns
- **Testes de API** (`api.md`) - REST API testing patterns

### Templates de Caso de Teste

- **ClickUp Template** (`src/templates/test-case/templateCT_clickup.md`) - Formato para integração com ClickUp

### Comandos Disponíveis

- **Slash Commands** (`src/templates/commands/slash-commands.md`) - Comandos especiais para uso com IA

---

## 🐛 Troubleshooting

### Erro: "OpenAI API Key not found"

**Solução:** Configure a variável de ambiente `OPENAI_API_KEY` no arquivo `.env`

```bash
# Crie o arquivo .env na raiz do projeto
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env
```

### Erro: "Failed to fetch from GitHub"

**Possíveis causas:**
1. Repositório privado sem token configurado → Configure `GITHUB_TOKEN`
2. Nome do repositório incorreto → Verifique `STANDARDS_REPO`
3. Problemas de rede → A ferramenta usará heurísticas locais automaticamente

**Solução de Fallback:** As heurísticas locais em `src/heuristics/` e `src/templates/` serão usadas automaticamente.

### Saída vazia ou incompleta

**Solução:** Verifique se:
- O arquivo de requisitos está no formato correto (Markdown)
- Há créditos suficientes na sua conta OpenAI
- O modelo configurado (`AI_MODEL`) está disponível
- O arquivo de entrada existe no caminho especificado

### Comando não encontrado

**Solução:** Certifique-se de que o projeto foi compilado:

```bash
npm run build:clean
```

---

## ❓ FAQ (Perguntas Frequentes)

### P: Qual o custo aproximado por execução?

**R:** Com `gpt-4o-mini` ($0.15/1M tokens), cada execução completa (review + plan + spec) custa aproximadamente $0.05 a $0.15, dependendo da complexidade do requisito.

### P: Posso usar outros modelos além do gpt-4o-mini?

**R:** Sim! Configure a variável `AI_MODEL` no `.env`. Modelos suportados: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`. Note que modelos maiores aumentam o custo.

### P: Os dados dos meus requisitos são enviados para a OpenAI?

**R:** Sim, os requisitos são enviados para a API da OpenAI para análise. Certifique-se de que isso está de acordo com suas políticas de segurança. Para dados sensíveis, considere usar uma instância auto-hospedada de LLM.

### P: Preciso executar os 3 comandos sempre?

**R:** Não obrigatoriamente. Você pode:
- Executar apenas `qa:review` para análise de qualidade
- Pular direto para `qa:plan` se o requisito já estiver validado
- Usar apenas `qa:spec` com um plano pré-existente

### P: Como adiciono minhas próprias heurísticas?

**R:** Crie arquivos `.md` em `src/heuristics/` seguindo o formato técnico (instruções diretas). Veja a seção [Como adicionar novas heurísticas](#como-adicionar-novas-heurísticas).

### P: A ferramenta funciona offline?

**R:** Parcialmente. As heurísticas locais funcionam offline, mas a geração de testes requer conexão com a API da OpenAI. A busca de heurísticas do GitHub também requer internet.

### P: Posso usar com Claude ou outros LLMs?

**R:** Atualmente apenas OpenAI é suportado. Suporte para Anthropic Claude e Google Gemini está no roadmap.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja nosso [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

### Como adicionar novas heurísticas

**Opção 1: Localmente (no pacote)**
1. Crie um arquivo `.md` em `src/heuristics/` ou `src/templates/`
2. Siga o formato técnico (instruções diretas, sem teoria excessiva)
3. Reconstrua o projeto: `npm run build:clean`
4. Teste com a ferramenta
5. Submeta um PR

**Opção 2: Repositório Externo (GitHub)**
1. Configure um repositório de padrões no GitHub
2. Organize em estrutura similar: `heuristics/`, `techniques/`, `test-patterns/`
3. Configure as variáveis `GITHUB_OWNER` e `STANDARDS_REPO`
4. A ferramenta buscará automaticamente os arquivos do GitHub

---

## 📄 Licença

Este projeto está licenciado sob a licença ISC.

---

## 👥 Autores

**Jonatas Martins** - [@qajonatasmartins](https://github.com/qajonatasmartins)

**Priscila Caimi** - [@pricaimiTech](https://github.com/pricaimiTech)

---

## 🔗 Links Úteis

- [Documentação Completa](docs/)
- [Guia de Início Rápido](docs/QUICKSTART.md)
- [Publicação NPM](docs/PUBLISHING.md)
- [Configuração Claude](docs/CLAUDE-SETUP.md)
- [Comandos Claude](CLAUDE-COMMANDS.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Repositório GitHub](https://github.com/qajonatasmartins/ai-test-context-standards)

# QA AI Agent 🤖
> Agente Autônomo de Qualidade de Software (MVP)

Uma biblioteca CLI que atua como um **QA Lead Virtual**. Ela lê requisitos de negócio (PRD), consulta um repositório remoto de heurísticas de teste e gera automaticamente planos de teste e casos de teste utilizando Inteligência Artificial (OpenAI GPT-4o-mini).

## 🚀 Funcionalidades

- **Planejamento Autônomo:** Analisa o PRD e decide *sozinho* quais técnicas de teste aplicar.
- **Integração com GitHub:** Busca heurísticas (ex: Seven Dwarfs, Boundary Value) diretamente do seu repositório de padrões.
- **Baixo Custo:** Otimizado para usar modelos `gpt-4o-mini` gerando apenas JSON.
- **Agnóstico:** Separa o Código (Engine) do Conhecimento (Heurísticas em Markdown).

## 🛠️ Pré-requisitos

- Node.js (v18+)
- Conta na OpenAI (com créditos ativos)
- Repositório GitHub contendo as heurísticas (arquivos .md)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone [https://github.com/qajonatasmartins/qa-ai-lib.git](https://github.com/qajonatasmartins/qa-ai-lib.git)
cd qa-ai-lib
````

2.  Instale as dependências:

<!-- end list -->

```bash
npm install
```

3.  Configure o ambiente:
    Crie um arquivo `.env` na raiz:

<!-- end list -->

```env
OPENAI_API_KEY=sk-proj-....
AI_MODEL=gpt-4o-mini
GITHUB_TOKEN=github_pat_... (Se o repo de heurísticas for privado)
STANDARDS_REPO=ai-test-context-standards
HEURISTICAS_PATH=caminho/para/pasta/heuristics
```

4.  Compile o projeto:

<!-- end list -->

```bash
npm run build:clean
```

## 🎮 Como Usar

### 1\. Verificar Conexões

Antes de começar, verifique se a ferramenta consegue acessar a IA e o GitHub.

```bash
# Testa conexão com GitHub e lista heurísticas disponíveis
npm run qa:check

# Testa conexão com OpenAI e saldo
npm run qa:test-ai
```


### 2\. Gerar Testes (O Comando Principal)

Crie um arquivo de texto (ex: `requisito.md`) com suas regras de negócio e execute:

```bash
npm run qa:analyze -- requisito.md
```

**O que vai acontecer:**

1.  O Agente lê o `requisito.txt`.
2.  O Agente olha para o GitHub e vê quais ferramentas tem (ex: "Tenho Seven Dwarfs e Análise de Limite").
3.  O Agente decide: "Para as datas, vou usar Limite. Para o fluxo, vou usar Seven Dwarfs".
4.  O Agente gera os testes e salva em `qa-report-DATA.json`.

## 📂 Estrutura do Projeto

```
qa-ai-lib/
├── src/
│   ├── cli.ts              # Ponto de entrada (Comandos)
│   ├── core/
│   │   ├── TestPlanner.ts  # Cérebro: Define a estratégia
│   │   └── TestExecutor.ts # Mãos: Gera os testes detalhados
│   ├── utils/
│   │   └── githubLoader.ts # Conector com o Repositório de Padrões
│   └── config/
└── dist/                   # Código compilado (Gerado pelo build)
```

## 📝 Exemplo de Saída

```json
[
  {
    "title": "Verificar Check-out anterior ao Check-in",
    "preCondition": "Usuário na tela de reserva",
    "steps": "1. Selecionar Check-in hoje. 2. Selecionar Check-out ontem.",
    "expectedResult": "Sistema deve bloquear a data e exibir mensagem de erro.",
    "severity": "High",
    "strategy": "boundary-value"
  }
]
```

# Escolha da estratégia das heuristicas 


### 1. Opção A: Buscar do GitHub (Atual)
* **Como funciona:** A CLI baixa o MD em tempo de execução e injeta no prompt.
* **Token Cost:** Igual à Opção B.
* **Latência:** Alta (tem o tempo do request HTTP + tempo da IA).
* **Manutenibilidade:** ⭐⭐⭐⭐⭐ (Excelente). Seu time de QA pode melhorar a heurística alterando o Markdown no GitHub sem precisar que você gere uma nova versão (release/npm publish) da biblioteca.
* **Risco:** Se o GitHub cair ou a internet oscilar, a CLI falha.

### 2. Opção B: Hardcoded/Local (`src/heuristics`)
* **Como funciona:** Os textos estão dentro do pacote npm instalado.
* **Token Cost:** Igual à Opção A.
* **Latência:** Baixa (leitura de disco é instantânea).
* **Manutenibilidade:** ⭐⭐ (Ruim). Se descobrir que a heurística está confundindo a IA, você precisa alterar o código, buildar, publicar versão nova e pedir para todo mundo atualizar (`npm update`).
* **Risco:** Zero dependência de rede externa.

### 3. Opção C: A "Third Way" (Minha Recomendação) - Contexto Comprimido + Cache
A verdadeira economia de tokens não está em *onde* guardar, mas *como* enviar.
* **Estratégia:** Manter no GitHub (pela manutenibilidade), mas criar versões **"Token-Friendly"**.
* **O Truque:** Em vez de usar um artigo acadêmico explicando o que é "Boundary Value Analysis" (que gasta 1.000 tokens), você cria um prompt técnico direto de 200 tokens.

---

### 💰 Levantamento de Custos (Cenário Hipotético)

Considerando:
* **Modelo:** `gpt-4o-mini` ($0.15 / 1M input tokens).
* **Cenário:** 1.000 execuções de teste.
* **Heurística "Didática" (Texto longo):** ~1.500 tokens (Explica conceito, dá exemplos, história).
* **Heurística "Técnica" (Prompt otimizado):** ~300 tokens (Instrução direta: "Faça X, Y, Z").

| Estratégia | Onde fica o arquivo? | Tamanho do Contexto | Custo Estimado (1k runs) | Pros | Contras |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Atual** | GitHub | 1.500 tokens | ~$0.22 | Fácil atualizar | Lento + Verboso |
| **2. Local** | `src/` | 1.500 tokens | ~$0.22 | Rápido | Ruim de atualizar |
| **3. Híbrida (Recomendada)** | **GitHub** | **300 tokens** | **~$0.04** | **Barato + Flexível** | Exige prompt engineering |

---

### 🏆 Opção 1 

**Por que?**
1.  **Separação de Preocupações:** Código é Código, Conhecimento é Conhecimento. Deixar as heurísticas no GitHub permite que QAs que não sabem programar melhorem os prompts.
2.  **Economia Real:** A economia virá de você reescrever os Markdowns para serem **Instruções de Sistema** e não **Artigos de Blog**.
    * *Ruim:* "A técnica dos 7 anões foi criada por fulano e serve para..."
    * *Bom:* "Atue como a persona Zangado: foque estritamente em falhas de validação, inputs nulos e estouro de memória."

-----

**Author:** Jonatas Martins e Priscila Caimi

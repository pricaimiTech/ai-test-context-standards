# 🕵️ Heurística: Technical Spec Review (Análise Técnica)

## 🎯 Objetivo
Analisar especificações técnicas de API, Banco de Dados e Integrações.

## ⚡ Gatilhos
Use esta lente quando o documento tiver: Endpoints, JSON, Diagramas, Tabelas.

## 🧠 O que analisar
1. **Contrato de API:** Tipagem, obrigatoriedade, status codes de erro.
2. **Segurança:** Autenticação, autorização, dados sensíveis expostos.
3. **Performance:** Latência, timeout, limites de requisição.
4. **Tratamento de Erros:** O que acontece nos fluxos infelizes?

## 📝 Formato de Saída (JSON)

Gere um relatório JSON estritamente neste formato:

```json
{
  "summary": "Breve resumo da qualidade da documentação (0 a 10)",
  "gaps": [
    {
      "topic": "Nome do Tópico (ex: Autenticação)",
      "description": "O que está faltando definir.",
      "impact": "High/Medium/Low"
    }
  ],
  "risks": [
    {
      "category": "Technical/Business/Security",
      "description": "Descrição do risco",
      "mitigation": "Sugestão de mitigação"
    }
  ],
  "questions": [
    "Pergunta 1 para o PO?",
    "Pergunta 2 sobre o fluxo X?"
  ]
}
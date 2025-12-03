# Especificação Técnica: API de Reserva de Hotel

## 1. Visão Geral
Serviço responsável por processar novas reservas, validando disponibilidade, regras de ocupação e processando o pagamento inicial.

## 2. Endpoints

### 2.1 Criar Reserva
**Rota:** `POST /api/v1/bookings`
**Descrição:** Cria uma nova reserva no sistema.

#### 📋 Contrato de Entrada (Request Body)

```json
{
  "customer": {
    "id": "uuid",           // Obrigatório
    "email": "string"       // Obrigatório, formato de email válido
  },
  "dates": {
    "checkIn": "YYYY-MM-DD",  // Obrigatório, >= Data Atual
    "checkOut": "YYYY-MM-DD"  // Obrigatório, > checkIn
  },
  "room": {
    "type": "string",       // Enum: "STANDARD", "DELUXE", "SUITE"
    "quantity": 1           // Min: 1, Max: 5
  },
  "guests": {
    "adults": 1,            // Min: 1
    "children": 0,          // Opcional, Default: 0
    "infants": 0            // Opcional, Default: 0 (0-2 anos)
  },
  "payment": {
    "method": "CREDIT_CARD",
    "encryptedToken": "string" // Token do gateway de pagamento
  }
}
````

#### ✅ Regras de Validação de Campos (Field Validation)

1.  **Datas (`dates`):**

      * `checkIn`: Não pode ser no passado.
      * `checkOut`: Deve ser pelo menos 1 dia após o check-in.
      * **Duração Máxima:** A estadia não pode exceder 30 dias consecutivos.

2.  **Ocupação (`guests` & `room.type`):**

      * **STANDARD:** Máx 2 adultos + 1 criança.
      * **DELUXE:** Máx 4 adultos + 2 crianças.
      * **SUITE:** Máx 6 pessoas (soma de adultos + crianças).
      * *Bebês (`infants`)* não contam para o limite de capacidade da sala, mas devem ser informados.

3.  **Pagamento:**

      * O `encryptedToken` deve ter exatamente 64 caracteres (hash).

#### 📤 Contrato de Saída (Response)

**Sucesso (201 Created):**

```json
{
  "bookingId": "uuid-gerado",
  "status": "CONFIRMED",
  "totalPrice": 1500.00,
  "createdAt": "ISO8601"
}
```

**Erro de Validação (400 Bad Request):**

```json
{
  "error": "VALIDATION_ERROR",
  "code": "MAX_OCCUPANCY_EXCEEDED",
  "message": "Room type STANDARD allows max 2 adults."
}
```

**Erro de Negócio (422 Unprocessable Entity):**

```json
{
  "error": "BUSINESS_RULE",
  "code": "DATES_UNAVAILABLE",
  "message": "Selected dates are fully booked."
}
```

## 3\. Requisitos Não-Funcionais (SLA)

1.  O tempo de resposta da API deve ser inferior a **500ms** no percentil 95.
2.  O sistema deve suportar **idempotência**: enviar o mesmo payload duas vezes (com mesmo `Idempotency-Key` no header) não deve gerar duas cobranças.

<!-- end list -->

````

---

### 🚀 Parte 2: Instruções de Execução

Enriquecer o PRD com especificações técnicas (contratos de API, tipos de dados e payloads) cria o cenário ideal para testar a capacidade da IA de gerar testes de **Integração**, **Contrato** e **Validação de Schema**, além dos funcionais.

Como você criou a pasta `example` e o arquivo acima, siga os passos:

**1. Garanta que o build está limpo e atualizado:**

```bash
npm run build:clean
````

--- 

**2. Execute o Agente apontando para o novo arquivo:**

```bash
npm run qa:analyze -- example/requisito.md
```

#### 🧠 O que esperar da Análise da IA:

Com este nível de detalhe no Markdown, o Agente (`TestPlanner`) deve ser capaz de identificar estratégias mais complexas:

  * **Boundary Value Analysis:** Focado nas datas (ex: testar estadia de 30 dias vs 31 dias) e quantidade de hóspedes.
  * **Contract Testing / Schema Validation:** Testar envio de campos obrigatórios faltando, formatos de e-mail inválidos ou tipos de dados errados (string onde deveria ser int).
  * **Business Logic Testing:** Cruzamento de regras de ocupação (Adultos + Crianças) versus o Tipo de Quarto selecionado.
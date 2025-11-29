# 🎯 Heurística SFDIPOT

## O que é?

SFDIPOT (San Francisco Depot) é uma heurística de cobertura de teste que ajuda a lembrar diferentes dimensões para testar.

## Mnemônico: S-F-D-I-P-O-T

- **S**tructure (Estrutura)
- **F**unction (Função)
- **D**ata (Dados)
- **I**nterface (Interface)
- **P**latform (Plataforma)
- **O**peration (Operação)
- **T**ime (Tempo)

## Como Usar

### Structure (Estrutura)
Teste a arquitetura e organização do código:
- Como os componentes se conectam?
- Dependências estão corretas?
- Módulos estão bem isolados?

**Exemplo de teste:**
```typescript
describe('Module Structure', () => {
  it('should not have circular dependencies', () => {
    // Verificar imports circulares
  });

  it('should follow dependency injection pattern', () => {
    // Verificar que dependências são injetadas
  });
});
```

### Function (Função)
Teste cada funcionalidade conforme especificação:
- Faz o que deveria fazer?
- Retorna valores corretos?
- Trata erros apropriadamente?

**Exemplo de teste:**
```typescript
describe('User Registration Function', () => {
  it('should create user with valid data', async () => {
    const user = await registerUser(validData);
    expect(user.id).toBeDefined();
    expect(user.email).toBe(validData.email);
  });

  it('should throw error for invalid email', async () => {
    await expect(registerUser({ email: 'invalid' }))
      .rejects.toThrow('Invalid email');
  });
});
```

### Data (Dados)
Teste com diferentes tipos e combinações de dados:
- Dados válidos
- Dados inválidos
- Dados vazios
- Dados grandes
- Caracteres especiais
- Unicode

**Exemplo de teste:**
```typescript
describe('Data Variations', () => {
  const testData = [
    { input: '', expected: 'error' },           // Vazio
    { input: 'valid@email.com', expected: 'ok' }, // Válido
    { input: 'a'.repeat(300), expected: 'error' }, // Muito longo
    { input: 'test@例え.jp', expected: 'ok' },   // Unicode
    { input: '<script>alert(1)</script>', expected: 'error' }, // XSS
  ];

  testData.forEach(({ input, expected }) => {
    it(`should handle: ${input.substring(0, 20)}...`, () => {
      const result = validateEmail(input);
      expect(result.status).toBe(expected);
    });
  });
});
```

### Interface (Interface)
Teste todas as interfaces do sistema:
- UI (botões, formulários, navegação)
- API (endpoints, payloads)
- CLI (comandos, flags)
- Integrações externas

**Exemplo de teste:**
```typescript
describe('API Interface', () => {
  it('should accept JSON payload', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John' })
      .set('Content-Type', 'application/json');
    
    expect(response.status).toBe(201);
  });

  it('should reject invalid content-type', async () => {
    const response = await request(app)
      .post('/api/users')
      .send('name=John')
      .set('Content-Type', 'text/plain');
    
    expect(response.status).toBe(415);
  });
});
```

### Platform (Plataforma)
Teste em diferentes ambientes:
- Sistemas operacionais (Windows, Mac, Linux)
- Navegadores (Chrome, Firefox, Safari)
- Dispositivos (Desktop, Tablet, Mobile)
- Versões (Node 18, 20, 22)

**Exemplo de teste:**
```typescript
describe('Cross-Platform', () => {
  const platforms = ['win32', 'darwin', 'linux'];

  platforms.forEach(platform => {
    it(`should work on ${platform}`, () => {
      jest.spyOn(process, 'platform', 'get')
        .mockReturnValue(platform);
      
      const result = getSystemInfo();
      expect(result.platform).toBe(platform);
    });
  });
});
```

### Operation (Operação)
Teste o sistema em diferentes estados operacionais:
- Sistema iniciando
- Sistema em execução normal
- Sistema sob carga
- Sistema em manutenção
- Sistema sendo encerrado

**Exemplo de teste:**
```typescript
describe('Operational States', () => {
  it('should handle startup sequence', async () => {
    const app = await startApp();
    expect(app.status).toBe('running');
  });

  it('should handle graceful shutdown', async () => {
    await app.shutdown();
    expect(app.status).toBe('stopped');
    expect(app.connections).toBe(0);
  });

  it('should queue requests during maintenance', async () => {
    app.setMaintenanceMode(true);
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(503);
  });
});
```

### Time (Tempo)
Teste comportamentos relacionados ao tempo:
- Timeouts
- Timers
- Agendamentos
- Fusos horários
- Datas especiais (29 de fevereiro, virada de ano)
- Sincronização

**Exemplo de teste:**
```typescript
describe('Time-Related Behavior', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should timeout after 5 seconds', async () => {
    const promise = fetchWithTimeout('/api/slow', 5000);
    
    jest.advanceTimersByTime(5000);
    
    await expect(promise).rejects.toThrow('Timeout');
  });

  it('should handle leap year', () => {
    const date = new Date('2024-02-29');
    expect(isValidDate(date)).toBe(true);
  });

  it('should handle timezone correctly', () => {
    const utcDate = new Date('2024-01-01T00:00:00Z');
    const localDate = convertToTimezone(utcDate, 'America/Sao_Paulo');
    expect(localDate.getHours()).toBe(21); // UTC-3
  });
});
```

## Aplicando SFDIPOT no Seu Teste

Quando usar esta heurística, percorra cada letra e pergunte:

1. **Structure**: Testei a estrutura do código?
2. **Function**: Testei todas as funcionalidades?
3. **Data**: Testei com dados variados?
4. **Interface**: Testei todas as interfaces?
5. **Platform**: Testei em diferentes plataformas?
6. **Operation**: Testei em diferentes estados operacionais?
7. **Time**: Testei comportamentos temporais?

## Exemplo Completo

```typescript
describe('User Service (SFDIPOT)', () => {
  // S - Structure
  describe('Structure', () => {
    it('should inject dependencies correctly', () => {
      const service = new UserService(mockRepo, mockEmail);
      expect(service).toBeDefined();
    });
  });

  // F - Function
  describe('Function', () => {
    it('should create user', async () => {
      const user = await service.createUser(validData);
      expect(user.id).toBeDefined();
    });
  });

  // D - Data
  describe('Data', () => {
    it('should handle empty email', async () => {
      await expect(service.createUser({ email: '' }))
        .rejects.toThrow();
    });
  });

  // I - Interface
  describe('Interface', () => {
    it('should expose public methods only', () => {
      const methods = Object.keys(service);
      expect(methods).not.toContain('_privateMethod');
    });
  });

  // P - Platform
  describe('Platform', () => {
    it('should work with different DB versions', async () => {
      // Testar compatibilidade
    });
  });

  // O - Operation
  describe('Operation', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill(null)
        .map(() => service.createUser(generateData()));
      
      await expect(Promise.all(promises)).resolves.toBeTruthy();
    });
  });

  // T - Time
  describe('Time', () => {
    it('should set correct timestamps', async () => {
      const before = Date.now();
      const user = await service.createUser(validData);
      const after = Date.now();
      
      expect(user.createdAt).toBeGreaterThanOrEqual(before);
      expect(user.createdAt).toBeLessThanOrEqual(after);
    });
  });
});
```

## Quando Usar SFDIPOT

✅ **Use quando:**
- Precisar de cobertura abrangente
- Explorando nova funcionalidade
- Revisando testes existentes
- Procurando gaps de cobertura

❌ **Não use quando:**
- Teste é muito simples
- Tempo é extremamente limitado
- Apenas alguns aspectos são relevantes

---

**Comando para usar:** `/heuristica sfdipot [descrição do que quer testar]`


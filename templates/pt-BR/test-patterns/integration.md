# 🔗 Padrões de Testes de Integração

## O que são Testes de Integração?

Testes de integração verificam como diferentes módulos, serviços ou componentes trabalham juntos. Testam as interações entre unidades do sistema, incluindo banco de dados, APIs, filas, etc.

## Diferença entre Unit e Integration Tests

```typescript
// ❌ TESTE UNITÁRIO: Mock de todas as dependências
it('should create user (unit)', async () => {
  const mockDb = { create: jest.fn().mockResolvedValue({ id: '1' }) };
  const mockEmail = { send: jest.fn() };
  const service = new UserService(mockDb, mockEmail);
  
  await service.createUser(userData);
  
  expect(mockDb.create).toHaveBeenCalled();
});

// ✅ TESTE DE INTEGRAÇÃO: Banco de dados real (teste)
it('should create user (integration)', async () => {
  const service = new UserService(testDb, emailService);
  
  const user = await service.createUser(userData);
  
  // Verificar no banco real
  const savedUser = await testDb.users.findById(user.id);
  expect(savedUser.name).toBe(userData.name);
});
```

## Setup de Ambiente de Teste

### Docker Compose para Testes
```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_pass
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data  # Dados em memória (mais rápido)

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
```

### Configuração de Teste
```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_TEST_URL,
    },
  },
});

beforeAll(async () => {
  // Aplicar migrations
  execSync('npm run db:migrate:test');
  
  // Conectar ao banco
  await testDb.$connect();
});

beforeEach(async () => {
  // Limpar dados entre testes
  const tables = ['users', 'posts', 'comments'];
  for (const table of tables) {
    await testDb.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
});

afterAll(async () => {
  // Fechar conexões
  await testDb.$disconnect();
});

export { testDb };
```

## Testes com Banco de Dados

### Transações e Rollback
```typescript
describe('UserRepository', () => {
  let repository: UserRepository;
  let db: Database;

  beforeEach(async () => {
    db = await createTestDb();
    repository = new UserRepository(db);
  });

  afterEach(async () => {
    await db.rollback(); // Desfazer mudanças
  });

  it('should save user to database', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const user = await repository.create(userData);

    // Verificar que foi salvo
    expect(user.id).toBeDefined();
    
    // Buscar do banco para confirmar
    const found = await repository.findById(user.id);
    expect(found?.name).toBe(userData.name);
    expect(found?.email).toBe(userData.email);
  });

  it('should enforce unique email constraint', async () => {
    const email = 'duplicate@example.com';
    
    await repository.create({ name: 'User 1', email });
    
    await expect(
      repository.create({ name: 'User 2', email })
    ).rejects.toThrow(/unique constraint/i);
  });

  it('should cascade delete related records', async () => {
    const user = await repository.create({ name: 'John' });
    const post = await postRepository.create({ 
      userId: user.id, 
      title: 'Test Post' 
    });

    await repository.delete(user.id);

    // Post relacionado deve ter sido deletado
    const foundPost = await postRepository.findById(post.id);
    expect(foundPost).toBeNull();
  });
});
```

### Testes com Seeds
```typescript
// test/seeds/user-seeds.ts
export const testUsers = [
  { id: '1', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
  { id: '2', name: 'Regular User', email: 'user@test.com', role: 'user' },
  { id: '3', name: 'Guest User', email: 'guest@test.com', role: 'guest' },
];

export async function seedUsers(db: Database) {
  for (const user of testUsers) {
    await db.users.create({ data: user });
  }
}

// Uso no teste
describe('User Authorization', () => {
  beforeEach(async () => {
    await seedUsers(testDb);
  });

  it('should allow admin to delete any user', async () => {
    const admin = testUsers[0];
    const target = testUsers[1];

    const result = await userService.deleteUser(target.id, admin.id);
    
    expect(result.success).toBe(true);
  });
});
```

## Testes de API / HTTP

### Supertest (Express/Node.js)
```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: userData.name,
      email: userData.email,
    });
    expect(response.body.password).toBeUndefined(); // não retornar senha
  });

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'invalid-email' })
      .expect(400);

    expect(response.body.error).toMatch(/email/i);
  });

  it('should return 409 for duplicate email', async () => {
    const userData = { name: 'John', email: 'john@test.com' };
    
    // Criar primeiro usuário
    await request(app).post('/api/users').send(userData);
    
    // Tentar criar duplicado
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(409);

    expect(response.body.error).toMatch(/already exists/i);
  });
});

describe('GET /api/users/:id', () => {
  let userId: string;

  beforeEach(async () => {
    // Criar usuário para testes
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' });
    userId = response.body.id;
  });

  it('should return user by ID', async () => {
    const response = await request(app)
      .get(`/api/users/${userId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: userId,
      name: 'Test',
      email: 'test@example.com',
    });
  });

  it('should return 404 for non-existent user', async () => {
    await request(app)
      .get('/api/users/non-existent-id')
      .expect(404);
  });
});
```

### Autenticação em Testes
```typescript
describe('Protected endpoints', () => {
  let authToken: string;

  beforeEach(async () => {
    // Login para obter token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = response.body.token;
  });

  it('should access protected route with valid token', async () => {
    await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('should reject request without token', async () => {
    await request(app)
      .get('/api/profile')
      .expect(401);
  });

  it('should reject request with invalid token', async () => {
    await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);
  });
});

// Helper para criar token de teste
async function createAuthToken(userId: string): Promise<string> {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password' });
  
  return response.body.token;
}
```

## Testes de Serviços Externos

### Mocking de APIs Externas
```typescript
import nock from 'nock';

describe('PaymentService integration with Stripe', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should process payment successfully', async () => {
    // Mock da API do Stripe
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(200, {
        id: 'ch_123456',
        status: 'succeeded',
        amount: 1000,
      });

    const paymentService = new PaymentService();
    const result = await paymentService.charge({
      amount: 1000,
      currency: 'usd',
      source: 'tok_visa',
    });

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('ch_123456');
  });

  it('should handle API errors gracefully', async () => {
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .reply(402, {
        error: { message: 'Insufficient funds' },
      });

    const paymentService = new PaymentService();
    
    await expect(
      paymentService.charge({ amount: 1000, currency: 'usd' })
    ).rejects.toThrow('Insufficient funds');
  });

  it('should retry on network errors', async () => {
    nock('https://api.stripe.com')
      .post('/v1/charges')
      .times(2)
      .replyWithError({ code: 'ECONNRESET' })
      .post('/v1/charges')
      .reply(200, { id: 'ch_123', status: 'succeeded' });

    const paymentService = new PaymentService({ maxRetries: 3 });
    const result = await paymentService.charge({ amount: 1000 });

    expect(result.success).toBe(true);
  });
});
```

### Testcontainers (Serviços Reais)
```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';

describe('Full integration with real services', () => {
  let postgresContainer: PostgreSqlContainer;
  let redisContainer: RedisContainer;
  let db: PrismaClient;
  let redis: Redis;

  beforeAll(async () => {
    // Iniciar containers
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('testdb')
      .start();
    
    redisContainer = await new RedisContainer().start();

    // Conectar aos containers
    db = new PrismaClient({
      datasources: {
        db: { url: postgresContainer.getConnectionUri() },
      },
    });

    redis = new Redis({
      host: redisContainer.getHost(),
      port: redisContainer.getPort(),
    });

    // Aplicar migrations
    await runMigrations(postgresContainer.getConnectionUri());
  }, 60000); // Timeout maior para download de imagens

  afterAll(async () => {
    await db.$disconnect();
    await redis.quit();
    await postgresContainer.stop();
    await redisContainer.stop();
  });

  it('should cache user data in Redis', async () => {
    const userService = new UserService(db, redis);
    
    // Primeira chamada: busca do DB
    const user1 = await userService.getUser('123');
    
    // Segunda chamada: busca do cache
    const user2 = await userService.getUser('123');
    
    expect(user1).toEqual(user2);
    
    // Verificar que está no cache
    const cached = await redis.get('user:123');
    expect(JSON.parse(cached!)).toMatchObject(user1);
  });
});
```

## Testes de Message Queues

### RabbitMQ / Redis Queue
```typescript
describe('Order processing queue', () => {
  let queue: Queue;

  beforeEach(async () => {
    queue = new Queue('orders', {
      connection: {
        host: 'localhost',
        port: 5672,
      },
    });
    await queue.empty(); // Limpar fila
  });

  afterEach(async () => {
    await queue.close();
  });

  it('should process order through queue', async () => {
    const orderData = {
      id: '123',
      items: [{ productId: '1', quantity: 2 }],
      total: 200,
    };

    // Adicionar à fila
    await queue.add('process-order', orderData);

    // Aguardar processamento
    const job = await queue.getJob('process-order');
    await job?.finished();

    // Verificar resultado
    const order = await db.orders.findUnique({ where: { id: '123' } });
    expect(order?.status).toBe('processed');
  });

  it('should retry failed jobs', async () => {
    const processSpy = jest.spyOn(orderService, 'process');
    processSpy
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({ success: true });

    await queue.add('process-order', { id: '123' }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    // Aguardar tentativas
    await new Promise(resolve => setTimeout(resolve, 5000));

    expect(processSpy).toHaveBeenCalledTimes(2);
    const order = await db.orders.findUnique({ where: { id: '123' } });
    expect(order?.status).toBe('processed');
  });
});
```

## Testes de WebSocket

```typescript
import io from 'socket.io-client';

describe('WebSocket notifications', () => {
  let clientSocket: Socket;
  let serverSocket: Socket;

  beforeEach((done) => {
    clientSocket = io('http://localhost:3000');
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    clientSocket.close();
  });

  it('should receive notification when user is created', (done) => {
    clientSocket.on('user:created', (data) => {
      expect(data).toMatchObject({
        id: expect.any(String),
        name: 'John Doe',
      });
      done();
    });

    // Criar usuário (deve disparar evento)
    request(app)
      .post('/api/users')
      .send({ name: 'John Doe', email: 'john@test.com' });
  });

  it('should broadcast message to all connected clients', (done) => {
    const client1 = io('http://localhost:3000');
    const client2 = io('http://localhost:3000');
    
    let receivedCount = 0;

    const checkDone = () => {
      receivedCount++;
      if (receivedCount === 2) {
        client1.close();
        client2.close();
        done();
      }
    };

    client1.on('broadcast', checkDone);
    client2.on('broadcast', checkDone);

    clientSocket.emit('broadcast', { message: 'Hello everyone!' });
  });
});
```

## Testes de Arquivos e Upload

```typescript
import fs from 'fs-extra';
import path from 'path';

describe('File upload', () => {
  const uploadDir = path.join(__dirname, '../uploads/test');

  beforeEach(async () => {
    await fs.ensureDir(uploadDir);
  });

  afterEach(async () => {
    await fs.remove(uploadDir);
  });

  it('should upload file successfully', async () => {
    const filePath = path.join(__dirname, 'fixtures/test-image.jpg');
    
    const response = await request(app)
      .post('/api/upload')
      .attach('file', filePath)
      .expect(200);

    expect(response.body).toMatchObject({
      filename: expect.stringMatching(/\.jpg$/),
      size: expect.any(Number),
      url: expect.any(String),
    });

    // Verificar que arquivo foi salvo
    const uploadedFile = path.join(uploadDir, response.body.filename);
    expect(await fs.pathExists(uploadedFile)).toBe(true);
  });

  it('should reject files larger than limit', async () => {
    const largFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const tempFile = path.join(__dirname, 'temp-large.bin');
    await fs.writeFile(tempFile, largFile);

    await request(app)
      .post('/api/upload')
      .attach('file', tempFile)
      .expect(413); // Payload Too Large

    await fs.remove(tempFile);
  });

  it('should only accept specific file types', async () => {
    const textFile = path.join(__dirname, 'fixtures/test.txt');
    await fs.writeFile(textFile, 'test content');

    const response = await request(app)
      .post('/api/upload')
      .attach('file', textFile)
      .expect(400);

    expect(response.body.error).toMatch(/file type/i);
    await fs.remove(textFile);
  });
});
```

## Boas Práticas

### ✅ FAZER
```typescript
// Isolar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test_db';

// Limpar estado entre testes
beforeEach(async () => {
  await cleanDatabase();
  await clearCache();
});

// Testar fluxos completos
it('should complete user registration flow', async () => {
  // 1. Criar usuário
  const user = await request(app)
    .post('/api/users')
    .send(userData);

  // 2. Verificar email foi enviado
  expect(emailService.send).toHaveBeenCalled();

  // 3. Confirmar email
  await request(app)
    .get(`/api/verify/${user.body.verificationToken}`);

  // 4. Verificar usuário ativo
  const activeUser = await db.users.findById(user.body.id);
  expect(activeUser.isActive).toBe(true);
});

// Usar fixtures e factories
const testUser = await createTestUser({ role: 'admin' });
const testPost = await createTestPost({ authorId: testUser.id });
```

### ❌ EVITAR
```typescript
// Depender de ordem de execução
it('test 1', () => { globalVar = 'value'; });
it('test 2', () => { expect(globalVar).toBe('value'); }); // ❌

// Testes muito lentos
it('should process 10000 records', async () => { // ❌ > 30s
  for (let i = 0; i < 10000; i++) {
    await db.create({ data: generateData() });
  }
});

// Não limpar recursos
it('test', async () => {
  await createTempFile();
  // ❌ esqueceu de deletar
});

// Timeouts muito curtos
it('test', async () => {
  await slowOperation();
}, 100); // ❌ pode falhar intermitentemente
```

## Checklist

- [ ] Testes usam banco/serviços de teste (não produção)
- [ ] Estado limpo entre testes (beforeEach/afterEach)
- [ ] Containers/serviços iniciados antes dos testes
- [ ] Recursos liberados após testes (conexões, arquivos)
- [ ] Seeds consistentes para dados de teste
- [ ] Testes de fluxos completos (end-to-end de features)
- [ ] APIs externas mockadas ou isoladas
- [ ] Tempo de execução razoável (< 30s por arquivo)
- [ ] Testes independentes e determinísticos

---

**Lembre-se**: Testes de integração são mais lentos que unitários, mas mais rápidos que E2E. Use-os para validar integrações críticas.


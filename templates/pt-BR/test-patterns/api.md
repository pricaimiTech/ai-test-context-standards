# 🔌 Padrões de Testes de API

## O que são Testes de API?

Testes de API validam endpoints HTTP/REST, GraphQL, gRPC ou WebSocket, verificando request/response, status codes, headers, autenticação, validação e contratos.

## Setup Básico

### REST API com Supertest

```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('User API', () => {
  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });
});
```

### GraphQL com Apollo

```typescript
import { ApolloServer } from '@apollo/server';
import { createTestClient } from '@apollo/server/testing';

describe('GraphQL API', () => {
  let server: ApolloServer;
  let client: any;

  beforeAll(async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();
    client = createTestClient(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should query user by ID', async () => {
    const GET_USER = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `;

    const { data, errors } = await client.query({
      query: GET_USER,
      variables: { id: '1' },
    });

    expect(errors).toBeUndefined();
    expect(data.user).toMatchObject({
      id: '1',
      name: expect.any(String),
      email: expect.any(String),
    });
  });
});
```

## Testes de CRUD Completo

```typescript
describe('User CRUD Operations', () => {
  let userId: string;
  let authToken: string;

  beforeAll(async () => {
    // Login para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    
    authToken = loginResponse.body.token;
  });

  // CREATE
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        role: 'user',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser)
        .expect(201);

      userId = response.body.id;

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
      expect(response.body.password).toBeUndefined(); // Não retornar senha
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test', email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toMatch(/email/i);
    });

    it('should return 409 for duplicate email', async () => {
      const duplicate = {
        name: 'Jane Doe',
        email: 'john@example.com', // Email já existe
        password: 'Pass123',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicate)
        .expect(409);

      expect(response.body.error).toMatch(/already exists/i);
    });
  });

  // READ
  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  // UPDATE
  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      const updates = {
        name: 'John Updated',
        email: 'john.updated@example.com',
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject(updates);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should partially update user', async () => {
      const response = await request(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'John Patched' })
        .expect(200);

      expect(response.body.name).toBe('John Patched');
      expect(response.body.email).toBe('john.updated@example.com'); // Não mudou
    });
  });

  // DELETE
  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verificar que foi deletado
      await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

## Testes de Autenticação e Autorização

```typescript
describe('Authentication & Authorization', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'ValidPass123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toMatchObject({
        email: 'user@test.com',
      });
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should return 400 for missing fields', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com' })
        .expect(400);
    });
  });

  describe('Protected Endpoints', () => {
    it('should reject requests without token', async () => {
      await request(app)
        .get('/api/profile')
        .expect(401);
    });

    it('should reject expired token', async () => {
      const expiredToken = 'expired.jwt.token';
      
      await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);
    });

    it('should accept valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'ValidPass123' });

      const token = loginResponse.body.token;

      await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Role-Based Access Control', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
      // Login como admin
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'AdminPass123' });
      adminToken = adminLogin.body.token;

      // Login como user
      const userLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'UserPass123' });
      userToken = userLogin.body.token;
    });

    it('should allow admin to access admin endpoint', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny regular user access to admin endpoint', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
```

## Testes de Validação

```typescript
describe('Input Validation', () => {
  describe('POST /api/products', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({})
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name', message: expect.any(String) }),
          expect.objectContaining({ field: 'price', message: expect.any(String) }),
        ])
      );
    });

    it('should validate field types', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Product',
          price: 'not-a-number', // Deveria ser number
          stock: 'invalid',
        })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'price' })
      );
    });

    it('should validate field constraints', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'A', // Muito curto
          price: -10, // Negativo
          stock: 1000000, // Acima do máximo
        })
        .expect(400);

      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should sanitize inputs', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: '<script>alert("XSS")</script>',
          description: '<img src=x onerror=alert(1)>',
          price: 100,
        })
        .expect(201);

      // Verificar que HTML foi sanitizado
      expect(response.body.name).not.toContain('<script>');
      expect(response.body.description).not.toContain('onerror');
    });
  });
});
```

## Testes de Paginação e Filtros

```typescript
describe('Pagination and Filtering', () => {
  beforeAll(async () => {
    // Criar múltiplos registros para teste
    for (let i = 1; i <= 50; i++) {
      await db.products.create({
        name: `Product ${i}`,
        category: i % 2 === 0 ? 'electronics' : 'clothing',
        price: i * 10,
      });
    }
  });

  describe('GET /api/products', () => {
    it('should return first page by default', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.data).toHaveLength(20); // Default page size
      expect(response.body.pagination).toMatchObject({
        page: 1,
        perPage: 20,
        total: 50,
        totalPages: 3,
      });
    });

    it('should return requested page', async () => {
      const response = await request(app)
        .get('/api/products?page=2&perPage=15')
        .expect(200);

      expect(response.body.data).toHaveLength(15);
      expect(response.body.pagination.page).toBe(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/products?category=electronics')
        .expect(200);

      expect(response.body.data).toHaveLength(20);
      response.body.data.forEach((product: any) => {
        expect(product.category).toBe('electronics');
      });
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=100&maxPrice=300')
        .expect(200);

      response.body.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(300);
      });
    });

    it('should sort by field', async () => {
      const response = await request(app)
        .get('/api/products?sortBy=price&order=desc')
        .expect(200);

      const prices = response.body.data.map((p: any) => p.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/products?search=Product%2010')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((product: any) => {
        expect(product.name).toMatch(/Product 10/i);
      });
    });
  });
});
```

## Testes de Rate Limiting

```typescript
describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .get('/api/public-endpoint')
        .expect(200);
    }
  });

  it('should block requests exceeding limit', async () => {
    // Fazer requisições até o limite
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/public-endpoint');
    }

    // Próxima requisição deve ser bloqueada
    const response = await request(app)
      .get('/api/public-endpoint')
      .expect(429); // Too Many Requests

    expect(response.body.error).toMatch(/rate limit/i);
    expect(response.headers).toHaveProperty('retry-after');
  });

  it('should reset after time window', async () => {
    // Exceder limite
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/public-endpoint');
    }

    await request(app).get('/api/public-endpoint').expect(429);

    // Aguardar janela de tempo (ex: 1 minuto)
    await new Promise(resolve => setTimeout(resolve, 61000));

    // Agora deve permitir novamente
    await request(app).get('/api/public-endpoint').expect(200);
  }, 65000);
});
```

## Testes de Upload de Arquivos

```typescript
describe('File Upload', () => {
  it('should upload single file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('file content'), 'test.txt')
      .expect(200);

    expect(response.body).toMatchObject({
      filename: expect.stringMatching(/\.txt$/),
      size: expect.any(Number),
      url: expect.any(String),
    });
  });

  it('should upload multiple files', async () => {
    const response = await request(app)
      .post('/api/upload/multiple')
      .attach('files', Buffer.from('file 1'), 'file1.txt')
      .attach('files', Buffer.from('file 2'), 'file2.txt')
      .expect(200);

    expect(response.body.files).toHaveLength(2);
  });

  it('should reject files exceeding size limit', async () => {
    const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB

    await request(app)
      .post('/api/upload')
      .attach('file', largeFile, 'large.bin')
      .expect(413); // Payload Too Large
  });

  it('should only accept allowed file types', async () => {
    const response = await request(app)
      .post('/api/upload/image')
      .attach('file', Buffer.from('not an image'), 'test.txt')
      .expect(400);

    expect(response.body.error).toMatch(/file type/i);
  });
});
```

## Testes de Contract (Schema Validation)

```typescript
import Ajv from 'ajv';

const ajv = new Ajv();

describe('API Contract Tests', () => {
  const userSchema = {
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 0 },
      role: { type: 'string', enum: ['user', 'admin', 'guest'] },
    },
  };

  it('should return user matching schema', async () => {
    const response = await request(app)
      .get('/api/users/1')
      .expect(200);

    const validate = ajv.compile(userSchema);
    const valid = validate(response.body);

    expect(valid).toBe(true);
    if (!valid) {
      console.log(validate.errors);
    }
  });

  it('should return array of users matching schema', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const validate = ajv.compile({
      type: 'array',
      items: userSchema,
    });

    expect(validate(response.body.data)).toBe(true);
  });
});
```

## Testes de Headers HTTP

```typescript
describe('HTTP Headers', () => {
  it('should return correct content-type', async () => {
    const response = await request(app).get('/api/users');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should include CORS headers', async () => {
    const response = await request(app).get('/api/public');

    expect(response.headers).toHaveProperty('access-control-allow-origin');
    expect(response.headers).toHaveProperty('access-control-allow-methods');
  });

  it('should include security headers', async () => {
    const response = await request(app).get('/api/users');

    expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-xss-protection');
  });

  it('should include cache headers', async () => {
    const response = await request(app).get('/api/static-data');

    expect(response.headers).toHaveProperty('cache-control');
    expect(response.headers).toHaveProperty('etag');
  });

  it('should support ETag caching', async () => {
    const response1 = await request(app).get('/api/users/1');
    const etag = response1.headers['etag'];

    const response2 = await request(app)
      .get('/api/users/1')
      .set('If-None-Match', etag)
      .expect(304); // Not Modified

    expect(response2.body).toEqual({});
  });
});
```

## Boas Práticas

### ✅ FAZER
```typescript
// Usar variáveis de ambiente para URLs
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Criar helpers de autenticação
async function getAuthToken(role: string): Promise<string> {
  // ...
}

// Agrupar testes relacionados
describe('User Management', () => {
  describe('Creation', () => { /* ... */ });
  describe('Update', () => { /* ... */ });
  describe('Deletion', () => { /* ... */ });
});

// Limpar dados entre testes
beforeEach(async () => {
  await cleanDatabase();
  await seedTestData();
});

// Testar status codes corretos
expect(response.status).toBe(201); // Não apenas .expect(201)
```

### ❌ EVITAR
```typescript
// Hardcoded URLs
await request('http://localhost:3000').get('/users'); // ❌

// Não verificar estrutura de resposta
expect(response.body).toBeTruthy(); // ❌ Muito vago

// Dependências entre testes
let globalUserId;
test('create', () => { globalUserId = ... }); // ❌
test('update', () => { update(globalUserId); }); // ❌

// Não limpar dados
test('test', async () => {
  await createTestData();
  // ❌ não limpou
});
```

## Checklist

- [ ] Todos os endpoints testados (CRUD completo)
- [ ] Status codes corretos (200, 201, 400, 401, 403, 404, 500)
- [ ] Headers verificados (Content-Type, CORS, Security)
- [ ] Autenticação e autorização testadas
- [ ] Validação de input testada
- [ ] Paginação e filtros funcionam
- [ ] Rate limiting configurado
- [ ] Upload de arquivos testado
- [ ] Contract/Schema validado
- [ ] Tratamento de erro consistente

---

**Lembre-se**: APIs são contratos. Testes garantem que o contrato é respeitado.


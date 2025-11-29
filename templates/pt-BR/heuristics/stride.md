# 🔒 Heurística STRIDE (Segurança)

## O que é?

STRIDE é uma heurística da Microsoft para identificar ameaças de segurança. Cada letra representa um tipo de ameaça que você deve testar.

## Mnemônico: S-T-R-I-D-E

- **S**poofing (Falsificação de Identidade)
- **T**ampering (Adulteração de Dados)
- **R**epudiation (Repúdio/Negação)
- **I**nformation Disclosure (Divulgação de Informação)
- **D**enial of Service (Negação de Serviço)
- **E**levation of Privilege (Elevação de Privilégio)

## Como Usar para Testes

### S - Spoofing (Falsificação de Identidade)

**Ameaça:** Atacante se passa por outro usuário/sistema.

**Testes:**

```typescript
describe('Spoofing Protection', () => {
  it('should reject forged JWT tokens', async () => {
    const forgedToken = jwt.sign(
      { userId: 'admin', role: 'admin' },
      'wrong-secret'
    );

    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${forgedToken}`)
      .expect(403);

    expect(response.body.error).toMatch(/invalid token/i);
  });

  it('should reject expired tokens', async () => {
    const expiredToken = jwt.sign(
      { userId: '123' },
      JWT_SECRET,
      { expiresIn: '-1h' } // Expirado há 1 hora
    );

    await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should validate user exists before trusting token', async () => {
    const tokenForDeletedUser = jwt.sign(
      { userId: 'deleted-user-id' },
      JWT_SECRET
    );

    await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${tokenForDeletedUser}`)
      .expect(404);
  });

  it('should require strong password for authentication', async () => {
    await expect(
      authService.login('user@test.com', 'weak')
    ).rejects.toThrow('Invalid credentials');
  });

  it('should implement rate limiting on login', async () => {
    // Tentar 5 logins inválidos
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@test.com', password: 'wrong' });
    }

    // 6ª tentativa deve ser bloqueada
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'wrong' })
      .expect(429);

    expect(response.body.error).toMatch(/too many attempts/i);
  });
});
```

### T - Tampering (Adulteração de Dados)

**Ameaça:** Atacante modifica dados em trânsito ou armazenados.

**Testes:**

```typescript
describe('Tampering Protection', () => {
  it('should reject modified request body', async () => {
    // Usuário tenta modificar price no request
    const response = await request(app)
      .post('/api/orders')
      .send({
        productId: '123',
        quantity: 1,
        price: 0.01, // ❌ Tentando fraudar preço
      })
      .expect(400);

    expect(response.body.error).toMatch(/invalid price/i);
  });

  it('should verify data integrity with checksums', async () => {
    const data = { amount: 100, currency: 'USD' };
    const checksum = calculateChecksum(data);

    // Modificar dados sem atualizar checksum
    data.amount = 1;

    await expect(
      processPayment(data, checksum)
    ).rejects.toThrow('Checksum mismatch');
  });

  it('should prevent SQL injection', async () => {
    const maliciousEmail = "admin@test.com' OR '1'='1";

    const user = await userService.findByEmail(maliciousEmail);

    expect(user).toBeNull(); // Não deve retornar todos os usuários
  });

  it('should validate file uploads', async () => {
    // Tentar upload de PHP disfarçado de imagem
    const maliciousFile = new File(
      ['<?php system($_GET["cmd"]); ?>'],
      'hack.php.jpg'
    );

    const response = await request(app)
      .post('/api/upload')
      .attach('file', maliciousFile.buffer, maliciousFile.name)
      .expect(400);

    expect(response.body.error).toMatch(/invalid file type/i);
  });
});
```

### R - Repudiation (Repúdio)

**Ameaça:** Usuário nega ter realizado uma ação.

**Testes:**

```typescript
describe('Repudiation Prevention', () => {
  it('should log all critical actions', async () => {
    const spy = jest.spyOn(auditLog, 'log');

    await userService.deleteUser('123', { actorId: 'admin-id' });

    expect(spy).toHaveBeenCalledWith({
      action: 'DELETE_USER',
      actorId: 'admin-id',
      targetUserId: '123',
      timestamp: expect.any(Date),
      ipAddress: expect.any(String),
    });
  });

  it('should maintain immutable audit trail', async () => {
    const logEntry = await auditLog.create({
      action: 'TRANSFER_MONEY',
      amount: 1000,
    });

    // Tentar modificar log
    await expect(
      auditLog.update(logEntry.id, { amount: 10 })
    ).rejects.toThrow('Audit logs are immutable');
  });

  it('should include timestamp in all logs', async () => {
    await userService.updateUser('123', { name: 'New Name' });

    const logs = await auditLog.find({ targetUserId: '123' });

    logs.forEach(log => {
      expect(log.timestamp).toBeInstanceOf(Date);
      expect(log.timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  it('should sign critical transactions', async () => {
    const transaction = await createTransaction({
      from: 'user1',
      to: 'user2',
      amount: 500,
    });

    expect(transaction.signature).toBeDefined();
    expect(verifySignature(transaction)).toBe(true);
  });
});
```

### I - Information Disclosure (Divulgação de Informação)

**Ameaça:** Vazamento de informações sensíveis.

**Testes:**

```typescript
describe('Information Disclosure Prevention', () => {
  it('should not expose password in API responses', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      password: 'SecurePass123',
    });

    expect(user.password).toBeUndefined();
  });

  it('should not return stack traces to client', async () => {
    const response = await request(app)
      .get('/api/users/invalid-id-format')
      .expect(400);

    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toHaveProperty('stackTrace');
  });

  it('should not expose internal paths in errors', async () => {
    const response = await request(app)
      .get('/api/non-existent')
      .expect(404);

    const errorMessage = response.body.error;
    expect(errorMessage).not.toMatch(/\/Users\//);
    expect(errorMessage).not.toMatch(/node_modules/);
  });

  it('should mask sensitive data in logs', () => {
    const spy = jest.spyOn(logger, 'info');

    logger.info('User login', {
      email: 'user@test.com',
      password: 'secret123',
      creditCard: '4111111111111111',
    });

    expect(spy).toHaveBeenCalledWith('User login', {
      email: 'user@test.com',
      password: '***REDACTED***',
      creditCard: '***REDACTED***',
    });
  });

  it('should use HTTPS for sensitive data', async () => {
    // Verificar que requests HTTP são redirecionados
    const response = await request(app)
      .get('http://example.com/api/login')
      .expect(301);

    expect(response.headers.location).toMatch(/^https:\/\//);
  });

  it('should set secure headers', async () => {
    const response = await request(app).get('/');

    expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('strict-transport-security');
  });
});
```

### D - Denial of Service (Negação de Serviço)

**Ameaça:** Atacante sobrecarrega o sistema.

**Testes:**

```typescript
describe('Denial of Service Prevention', () => {
  it('should have rate limiting', async () => {
    // Fazer 100 requisições
    const requests = Array(100).fill(null).map(() =>
      request(app).get('/api/data')
    );

    await Promise.all(requests);

    // 101ª requisição deve ser bloqueada
    const response = await request(app)
      .get('/api/data')
      .expect(429);

    expect(response.body.error).toMatch(/rate limit/i);
  });

  it('should limit payload size', async () => {
    const hugePayload = { data: 'A'.repeat(10 * 1024 * 1024) }; // 10MB

    await request(app)
      .post('/api/data')
      .send(hugePayload)
      .expect(413); // Payload Too Large
  });

  it('should timeout long-running requests', async () => {
    const slowEndpoint = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 60000))
    );

    await expect(
      callWithTimeout(slowEndpoint, 5000)
    ).rejects.toThrow('Timeout');
  });

  it('should limit concurrent connections per user', async () => {
    const userId = 'user123';

    // Abrir 10 conexões
    const connections = Array(10).fill(null).map(() =>
      openWebSocket(userId)
    );

    await Promise.all(connections);

    // 11ª conexão deve ser rejeitada
    await expect(
      openWebSocket(userId)
    ).rejects.toThrow('Too many connections');
  });

  it('should handle regex DoS (ReDoS)', () => {
    const maliciousInput = 'a'.repeat(10000) + 'X';
    const start = Date.now();

    validateInput(maliciousInput);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Não deve travar
  });
});
```

### E - Elevation of Privilege (Elevação de Privilégio)

**Ameaça:** Usuário obtém acesso não autorizado.

**Testes:**

```typescript
describe('Elevation of Privilege Prevention', () => {
  it('should enforce role-based access control', async () => {
    const regularUser = await loginAs('user');

    await request(app)
      .delete('/api/users/123')
      .set('Authorization', `Bearer ${regularUser.token}`)
      .expect(403);
  });

  it('should prevent privilege escalation via parameter tampering', async () => {
    const userToken = await loginAs('user');

    // Tentar se promover a admin
    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ role: 'admin' })
      .expect(403);

    expect(response.body.error).toMatch(/cannot modify role/i);
  });

  it('should prevent path traversal', async () => {
    await request(app)
      .get('/api/files/../../etc/passwd')
      .expect(400);
  });

  it('should validate user owns resource before modification', async () => {
    const user1 = await loginAs('user1');
    const user2Post = await createPost({ authorId: 'user2' });

    // User1 tenta deletar post de User2
    await request(app)
      .delete(`/api/posts/${user2Post.id}`)
      .set('Authorization', `Bearer ${user1.token}`)
      .expect(403);
  });

  it('should prevent privilege escalation via JWT manipulation', async () => {
    const userToken = await loginAs('user');
    const decoded = jwt.decode(userToken);

    // Tentar criar novo token com role admin
    const forgedToken = jwt.sign(
      { ...decoded, role: 'admin' },
      'guessed-secret'
    );

    await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${forgedToken}`)
      .expect(403);
  });
});
```

## Template Completo STRIDE

```typescript
describe('[Feature] - STRIDE Security', () => {
  describe('Spoofing', () => {
    it('should prevent identity falsification', () => {});
  });

  describe('Tampering', () => {
    it('should prevent data modification', () => {});
  });

  describe('Repudiation', () => {
    it('should maintain audit trail', () => {});
  });

  describe('Information Disclosure', () => {
    it('should protect sensitive data', () => {});
  });

  describe('Denial of Service', () => {
    it('should handle resource exhaustion', () => {});
  });

  describe('Elevation of Privilege', () => {
    it('should enforce access control', () => {});
  });
});
```

## Checklist STRIDE

Para cada feature, pergunte:

- [ ] **Spoofing**: Como alguém poderia se passar por outro usuário?
- [ ] **Tampering**: Onde dados podem ser modificados indevidamente?
- [ ] **Repudiation**: Estou logando ações críticas?
- [ ] **Information Disclosure**: Que dados sensíveis podem vazar?
- [ ] **Denial of Service**: Como alguém poderia derrubar o sistema?
- [ ] **Elevation of Privilege**: Como alguém poderia ganhar mais acesso?

---

**Comando:** `/heuristica stride [funcionalidade a testar segurança]`

**Exemplo:** `/heuristica stride sistema de autenticação e autorização de usuários`


# 🛡️ Heurística OWASP Top 10

## O que é?

OWASP Top 10 são as vulnerabilidades de segurança mais críticas em aplicações web. Use para guiar testes de segurança.

## Top 10 (2021)

### 1. Broken Access Control

**Problema:** Usuários acessam recursos sem permissão.

```typescript
describe('Access Control', () => {
  it('should prevent unauthorized access', async () => {
    const userToken = await loginAs('user');
    
    await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should validate resource ownership', async () => {
    const user1 = await loginAs('user1');
    const user2Post = createPost({ userId: 'user2' });
    
    await request(app)
      .delete(`/api/posts/${user2Post.id}`)
      .set('Authorization', `Bearer ${user1.token}`)
      .expect(403);
  });
});
```

### 2. Cryptographic Failures

**Problema:** Dados sensíveis expostos ou mal criptografados.

```typescript
describe('Cryptography', () => {
  it('should hash passwords with bcrypt', async () => {
    const user = await userService.create({
      password: 'plaintext',
    });
    
    expect(user.password).not.toBe('plaintext');
    expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt format
  });

  it('should use HTTPS for sensitive data', async () => {
    const response = await request(app)
      .post('http://example.com/api/login') // HTTP
      .expect(301); // Redirect to HTTPS
    
    expect(response.headers.location).toMatch(/^https:/);
  });
});
```

### 3. Injection

**Problema:** SQL, NoSQL, Command Injection.

```typescript
describe('Injection Prevention', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "admin' OR '1'='1";
    
    const user = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [maliciousInput] // ✅ Parametrizado
    );
    
    expect(user).toBeNull();
  });

  it('should prevent NoSQL injection', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        email: { $ne: null }, // Tentativa de injeção
        password: { $ne: null },
      })
      .expect(400);
  });

  it('should sanitize HTML', () => {
    const dirty = '<script>alert("XSS")</script>';
    const clean = sanitize(dirty);
    
    expect(clean).not.toContain('<script>');
  });
});
```

### 4. Insecure Design

**Problema:** Falhas arquiteturais fundamentais.

```typescript
describe('Secure Design', () => {
  it('should require MFA for sensitive operations', async () => {
    const user = await loginAs('user');
    
    // Tentar transferir dinheiro sem MFA
    await request(app)
      .post('/api/transfer')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ amount: 10000, to: 'attacker' })
      .expect(403);
    
    expect(response.body.error).toMatch(/MFA required/i);
  });

  it('should implement rate limiting', async () => {
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/data');
    }
    
    await request(app).get('/api/data').expect(429);
  });
});
```

### 5. Security Misconfiguration

**Problema:** Configurações inseguras ou padrões.

```typescript
describe('Security Configuration', () => {
  it('should not expose detailed error messages', async () => {
    const response = await request(app)
      .get('/api/error')
      .expect(500);
    
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toMatch(/node_modules/);
  });

  it('should have security headers', async () => {
    const response = await request(app).get('/');
    
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('should disable directory listing', async () => {
    await request(app).get('/uploads/').expect(403);
  });
});
```

### 6. Vulnerable and Outdated Components

**Problema:** Dependências vulneráveis.

```typescript
// Use npm audit ou snyk
test('should not have vulnerable dependencies', async () => {
  const audit = await runCommand('npm audit --json');
  const vulnerabilities = JSON.parse(audit);
  
  expect(vulnerabilities.metadata.vulnerabilities.high).toBe(0);
  expect(vulnerabilities.metadata.vulnerabilities.critical).toBe(0);
});
```

### 7. Identification and Authentication Failures

**Problema:** Autenticação fraca.

```typescript
describe('Authentication', () => {
  it('should enforce strong passwords', async () => {
    await expect(
      userService.create({ password: 'weak' })
    ).rejects.toThrow(/password must contain/i);
  });

  it('should lock account after failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/login')
        .send({ email: 'user@test.com', password: 'wrong' });
    }
    
    await request(app)
      .post('/api/login')
      .send({ email: 'user@test.com', password: 'correct' })
      .expect(423); // Locked
  });

  it('should implement session timeout', async () => {
    const token = await loginAs('user');
    
    // Simular 30min depois
    jest.advanceTimersByTime(30 * 60 * 1000);
    
    await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(401); // Session expired
  });
});
```

### 8. Software and Data Integrity Failures

**Problema:** Updates/dados não verificados.

```typescript
describe('Data Integrity', () => {
  it('should verify file checksums', async () => {
    const file = { data: 'content', checksum: 'abc123' };
    
    // Modificar dados
    file.data = 'modified';
    
    await expect(verifyIntegrity(file))
      .rejects.toThrow('Checksum mismatch');
  });

  it('should sign critical data', async () => {
    const transaction = {
      from: 'user1',
      to: 'user2',
      amount: 1000,
    };
    
    const signed = signData(transaction, PRIVATE_KEY);
    expect(verifySignature(signed, PUBLIC_KEY)).toBe(true);
    
    // Modificar dados assinados
    signed.amount = 1;
    expect(verifySignature(signed, PUBLIC_KEY)).toBe(false);
  });
});
```

### 9. Security Logging and Monitoring Failures

**Problema:** Falta de logs/alertas.

```typescript
describe('Logging', () => {
  it('should log failed login attempts', async () => {
    const spy = jest.spyOn(logger, 'warn');
    
    await request(app)
      .post('/api/login')
      .send({ email: 'user@test.com', password: 'wrong' });
    
    expect(spy).toHaveBeenCalledWith('Failed login attempt', {
      email: 'user@test.com',
      ip: expect.any(String),
      timestamp: expect.any(Date),
    });
  });

  it('should log privilege escalation attempts', async () => {
    const spy = jest.spyOn(securityLog, 'alert');
    
    const userToken = await loginAs('user');
    await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ role: 'admin' });
    
    expect(spy).toHaveBeenCalledWith('Privilege escalation attempt');
  });
});
```

### 10. Server-Side Request Forgery (SSRF)

**Problema:** Servidor faz requests maliciosos.

```typescript
describe('SSRF Prevention', () => {
  it('should validate URL whitelist', async () => {
    await expect(
      fetchExternalData('http://localhost:6379') // Redis interno
    ).rejects.toThrow('URL not allowed');
  });

  it('should prevent internal network access', async () => {
    const response = await request(app)
      .post('/api/webhook')
      .send({ url: 'http://192.168.1.1/admin' })
      .expect(400);
    
    expect(response.body.error).toMatch(/invalid url/i);
  });

  it('should timeout external requests', async () => {
    await expect(
      fetchExternalData('http://slow-site.com', { timeout: 5000 })
    ).rejects.toThrow('Timeout');
  });
});
```

## Template OWASP

```typescript
describe('[Feature] - OWASP Security', () => {
  it('prevents broken access control', () => {});
  it('protects sensitive data with encryption', () => {});
  it('prevents injection attacks', () => {});
  it('has secure design', () => {});
  it('has secure configuration', () => {});
  it('has no vulnerable dependencies', () => {});
  it('has strong authentication', () => {});
  it('ensures data integrity', () => {});
  it('logs security events', () => {});
  it('prevents SSRF', () => {});
});
```

## Checklist OWASP

- [ ] Access Control testado
- [ ] Criptografia implementada
- [ ] Proteção contra injection
- [ ] Design seguro por padrão
- [ ] Configurações seguras
- [ ] Dependências atualizadas
- [ ] Autenticação forte
- [ ] Integridade de dados
- [ ] Logs de segurança
- [ ] SSRF prevention

---

**Comando:** `/heuristica owasp [funcionalidade]`

**Exemplo:** `/heuristica owasp API de pagamentos precisa testar todas vulnerabilidades OWASP`


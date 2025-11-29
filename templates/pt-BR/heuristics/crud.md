# 🔧 Heurística CRUD

## O que é?

CRUD é uma heurística simples mas poderosa para garantir que todas as operações básicas de um recurso sejam testadas.

## Mnemônico: C-R-U-D

- **C**reate (Criar)
- **R**ead (Ler)
- **U**pdate (Atualizar)
- **D**elete (Deletar)

## Regra de Ouro

**Para CADA recurso do sistema, teste TODAS as 4 operações + Casos de Erro**

## Como Usar

### Create (Criar)

Teste a criação de novos registros:

```typescript
describe('Create User', () => {
  // ✅ Happy Path
  it('should create user with valid data', async () => {
    const user = await userService.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.password).not.toBe('SecurePass123'); // Deve estar hasheado
  });

  // ❌ Error Cases
  it('should reject duplicate email', async () => {
    await userService.create({ email: 'test@example.com' });
    
    await expect(
      userService.create({ email: 'test@example.com' })
    ).rejects.toThrow('Email already exists');
  });

  it('should validate required fields', async () => {
    await expect(
      userService.create({ name: 'John' }) // Falta email
    ).rejects.toThrow('Email is required');
  });

  it('should validate data types', async () => {
    await expect(
      userService.create({ email: 123 }) // Email não é string
    ).rejects.toThrow('Email must be a string');
  });

  // 🔒 Security
  it('should sanitize inputs', async () => {
    const user = await userService.create({
      name: '<script>alert("XSS")</script>',
      email: 'test@example.com',
    });

    expect(user.name).not.toContain('<script>');
  });

  // 📊 Edge Cases
  it('should handle minimum length values', async () => {
    const user = await userService.create({
      name: 'Jo', // Mínimo: 2 caracteres
      email: 'a@b.c', // Email mínimo válido
    });

    expect(user.name).toBe('Jo');
  });

  it('should handle maximum length values', async () => {
    const longName = 'A'.repeat(100); // Máximo permitido
    const user = await userService.create({
      name: longName,
      email: 'test@example.com',
    });

    expect(user.name).toHaveLength(100);
  });
});
```

### Read (Ler)

Teste a leitura/busca de registros:

```typescript
describe('Read User', () => {
  let createdUser: User;

  beforeEach(async () => {
    createdUser = await userService.create(validUserData);
  });

  // ✅ Happy Path
  it('should find user by ID', async () => {
    const user = await userService.findById(createdUser.id);

    expect(user).toBeDefined();
    expect(user.id).toBe(createdUser.id);
    expect(user.email).toBe(createdUser.email);
  });

  it('should find user by email', async () => {
    const user = await userService.findByEmail(createdUser.email);

    expect(user).toBeDefined();
    expect(user.id).toBe(createdUser.id);
  });

  it('should list all users', async () => {
    const users = await userService.findAll();

    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeGreaterThan(0);
    expect(users).toContainEqual(expect.objectContaining({
      id: createdUser.id,
    }));
  });

  // ❌ Error Cases
  it('should return null for non-existent ID', async () => {
    const user = await userService.findById('non-existent-id');

    expect(user).toBeNull();
  });

  it('should return null for non-existent email', async () => {
    const user = await userService.findByEmail('nonexistent@example.com');

    expect(user).toBeNull();
  });

  // 🔒 Security
  it('should not expose password in read operations', async () => {
    const user = await userService.findById(createdUser.id);

    expect(user.password).toBeUndefined();
  });

  // 📊 Pagination
  it('should paginate results', async () => {
    // Criar 30 usuários
    await Promise.all(
      Array(30).fill(null).map(() => userService.create(generateUserData()))
    );

    const page1 = await userService.findAll({ page: 1, limit: 10 });
    const page2 = await userService.findAll({ page: 2, limit: 10 });

    expect(page1.data).toHaveLength(10);
    expect(page2.data).toHaveLength(10);
    expect(page1.data[0].id).not.toBe(page2.data[0].id);
  });

  // 🔍 Filtering
  it('should filter by role', async () => {
    await userService.create({ ...validUserData, role: 'admin' });
    await userService.create({ ...validUserData, role: 'user' });

    const admins = await userService.findAll({ role: 'admin' });

    expect(admins.every(u => u.role === 'admin')).toBe(true);
  });
});
```

### Update (Atualizar)

Teste a atualização de registros:

```typescript
describe('Update User', () => {
  let existingUser: User;

  beforeEach(async () => {
    existingUser = await userService.create(validUserData);
  });

  // ✅ Happy Path - Full Update (PUT)
  it('should update all fields', async () => {
    const updated = await userService.update(existingUser.id, {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'admin',
    });

    expect(updated.name).toBe('Jane Doe');
    expect(updated.email).toBe('jane@example.com');
    expect(updated.role).toBe('admin');
  });

  // ✅ Happy Path - Partial Update (PATCH)
  it('should update single field', async () => {
    const updated = await userService.patch(existingUser.id, {
      name: 'Jane Doe',
    });

    expect(updated.name).toBe('Jane Doe');
    expect(updated.email).toBe(existingUser.email); // Não mudou
  });

  // ❌ Error Cases
  it('should reject update to non-existent user', async () => {
    await expect(
      userService.update('non-existent-id', { name: 'New Name' })
    ).rejects.toThrow('User not found');
  });

  it('should reject duplicate email on update', async () => {
    const user2 = await userService.create({
      email: 'user2@example.com',
    });

    await expect(
      userService.update(user2.id, { email: existingUser.email })
    ).rejects.toThrow('Email already exists');
  });

  it('should validate updated data', async () => {
    await expect(
      userService.update(existingUser.id, { email: 'invalid-email' })
    ).rejects.toThrow('Invalid email');
  });

  // 🔒 Security
  it('should not allow updating sensitive fields directly', async () => {
    await expect(
      userService.update(existingUser.id, { role: 'admin' })
    ).rejects.toThrow('Cannot modify role directly');
  });

  // 📊 Timestamps
  it('should update updatedAt timestamp', async () => {
    const before = new Date();
    await new Promise(resolve => setTimeout(resolve, 100));

    const updated = await userService.update(existingUser.id, {
      name: 'New Name',
    });

    expect(updated.updatedAt).toBeInstanceOf(Date);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    expect(updated.createdAt).toEqual(existingUser.createdAt); // Não muda
  });

  // 🔄 Concurrency
  it('should handle concurrent updates', async () => {
    const updates = Array(10).fill(null).map((_, i) =>
      userService.patch(existingUser.id, { name: `Name ${i}` })
    );

    await expect(Promise.all(updates)).resolves.toBeTruthy();

    const final = await userService.findById(existingUser.id);
    expect(final.name).toMatch(/Name \d/);
  });
});
```

### Delete (Deletar)

Teste a exclusão de registros:

```typescript
describe('Delete User', () => {
  let userToDelete: User;

  beforeEach(async () => {
    userToDelete = await userService.create(validUserData);
  });

  // ✅ Happy Path
  it('should delete existing user', async () => {
    await userService.delete(userToDelete.id);

    const deleted = await userService.findById(userToDelete.id);
    expect(deleted).toBeNull();
  });

  it('should return confirmation on delete', async () => {
    const result = await userService.delete(userToDelete.id);

    expect(result).toEqual({
      success: true,
      message: 'User deleted successfully',
    });
  });

  // ❌ Error Cases
  it('should reject delete of non-existent user', async () => {
    await expect(
      userService.delete('non-existent-id')
    ).rejects.toThrow('User not found');
  });

  it('should not allow deleting yourself', async () => {
    const currentUser = await userService.getCurrentUser();

    await expect(
      userService.delete(currentUser.id)
    ).rejects.toThrow('Cannot delete your own account');
  });

  // 🗑️ Soft Delete
  it('should soft delete instead of hard delete', async () => {
    await userService.delete(userToDelete.id);

    const deleted = await userService.findById(userToDelete.id, {
      includeSoftDeleted: true,
    });

    expect(deleted).toBeDefined();
    expect(deleted.deletedAt).toBeInstanceOf(Date);
  });

  // 🔗 Cascade Delete
  it('should cascade delete related records', async () => {
    // Criar posts do usuário
    await postService.create({
      userId: userToDelete.id,
      title: 'Test Post',
    });

    await userService.delete(userToDelete.id);

    const posts = await postService.findByUserId(userToDelete.id);
    expect(posts).toHaveLength(0);
  });

  // 🔒 Authorization
  it('should only allow admin to delete users', async () => {
    const regularUser = await loginAs('user');

    await expect(
      userService.delete(userToDelete.id, { user: regularUser })
    ).rejects.toThrow('Insufficient permissions');
  });

  // ♻️ Restore
  it('should allow restoring soft-deleted user', async () => {
    await userService.delete(userToDelete.id);
    await userService.restore(userToDelete.id);

    const restored = await userService.findById(userToDelete.id);
    expect(restored).toBeDefined();
    expect(restored.deletedAt).toBeNull();
  });
});
```

## Checklist CRUD Completo

Para cada recurso, verifique:

### Create ✅
- [ ] Criar com dados válidos
- [ ] Rejeitar dados inválidos
- [ ] Validar campos obrigatórios
- [ ] Prevenir duplicatas
- [ ] Sanitizar inputs
- [ ] Testar limites (min/max)

### Read ✅
- [ ] Buscar por ID
- [ ] Buscar por outros campos únicos
- [ ] Listar todos
- [ ] Retornar null para não encontrado
- [ ] Não expor dados sensíveis
- [ ] Paginação funciona
- [ ] Filtros funcionam
- [ ] Ordenação funciona

### Update ✅
- [ ] Atualizar todos campos (PUT)
- [ ] Atualizar campos individuais (PATCH)
- [ ] Rejeitar atualizações inválidas
- [ ] Prevenir duplicatas em updates
- [ ] Proteger campos sensíveis
- [ ] Atualizar timestamps
- [ ] Lidar com concorrência

### Delete ✅
- [ ] Deletar registro existente
- [ ] Rejeitar delete de não existente
- [ ] Soft delete (se aplicável)
- [ ] Cascade delete em relacionados
- [ ] Verificar permissões
- [ ] Permitir restore (se soft delete)

## Exemplo Completo (Template)

```typescript
describe('[Resource] CRUD', () => {
  describe('Create', () => {
    it('should create with valid data', async () => {});
    it('should reject invalid data', async () => {});
    it('should prevent duplicates', async () => {});
  });

  describe('Read', () => {
    it('should find by ID', async () => {});
    it('should return null if not found', async () => {});
    it('should list all with pagination', async () => {});
    it('should filter results', async () => {});
  });

  describe('Update', () => {
    it('should update all fields', async () => {});
    it('should update single field', async () => {});
    it('should reject invalid updates', async () => {});
  });

  describe('Delete', () => {
    it('should delete existing record', async () => {});
    it('should reject delete of non-existent', async () => {});
    it('should cascade delete related records', async () => {});
  });
});
```

---

**Comando para usar:** `/heuristica crud [recurso que quer testar]`

**Exemplo:** `/heuristica crud UserService`


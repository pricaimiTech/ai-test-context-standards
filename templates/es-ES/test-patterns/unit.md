# 🧪 Patrones de Pruebas Unitarias

## ¿Qué son las Pruebas Unitarias?

Las pruebas unitarias validan la unidad más pequeña de código (función, método, clase) de forma aislada, sin dependencias externas.

## Estructura de Prueba (Patrón AAA)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('debería crear un usuario con datos válidos', async () => {
      // Arrange (Organizar)
      const userData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'ContraseñaSegura123',
      };
      const mockRepository = createMockUserRepository();
      const service = new UserService(mockRepository);

      // Act (Actuar)
      const user = await service.createUser(userData);

      // Assert (Afirmar)
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Convenciones de Nomenclatura

### Buenos Nombres
```typescript
✅ it('debería devolver usuario cuando se proporciona ID válido')
✅ it('debería lanzar UserNotFoundError cuando el usuario no existe')
✅ it('debería hashear la contraseña antes de guardar en la base de datos')

❌ it('probar creación de usuario')
❌ it('debería funcionar')
```

## Mocking y Stubs

```typescript
// Mock de repositorio
const mockUserRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
};

// Prueba
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    service = new UserService(mockRepository);
  });

  it('debería llamar al repositorio con datos correctos', async () => {
    const userData = { name: 'Juan', email: 'juan@test.com' };
    mockRepository.create.mockResolvedValue({ id: '1', ...userData });

    await service.createUser(userData);

    expect(mockRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

## Casos de Prueba Esenciales

### Happy Path (Camino Feliz)
```typescript
it('debería procesar el pago exitosamente con datos válidos', async () => {
  const payment = { amount: 100, currency: 'USD' };
  const result = await paymentService.process(payment);
  
  expect(result.success).toBe(true);
});
```

### Casos Extremos
```typescript
it('debería manejar monto cero', async () => {
  await expect(paymentService.process({ amount: 0 }))
    .rejects
    .toThrow('El monto debe ser mayor que cero');
});
```

## Mejores Prácticas

### ✅ HACER
- Pruebas independientes
- Pruebas determinísticas
- Un concepto por prueba
- Aserciones claras

### ❌ EVITAR
- Pruebas dependientes
- Pruebas no determinísticas
- Múltiples conceptos en una prueba
- Aserciones genéricas

---

**Recuerde**: Las pruebas unitarias deben ser FIRST:
- **F**ast (Rápidas)
- **I**ndependent (Independientes)
- **R**epeatable (Repetibles)
- **S**elf-validating (Auto-validantes)
- **T**imely (Oportunas)


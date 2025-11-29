# 🧪 Unit Testing Patterns

## What are Unit Tests?

Unit tests validate the smallest testable unit of code (function, method, class) in isolation, without external dependencies.

## Test Structure (AAA Pattern)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
      };
      const mockRepository = createMockUserRepository();
      const service = new UserService(mockRepository);

      // Act
      const user = await service.createUser(userData);

      // Assert
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Naming Conventions

### Good Names
```typescript
✅ it('should return user when valid ID is provided')
✅ it('should throw UserNotFoundError when user does not exist')
✅ it('should hash password before saving to database')

❌ it('test user creation')
❌ it('should work')
```

## Mocking and Stubs

```typescript
// Mock repository
const mockUserRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
};

// Test
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    service = new UserService(mockRepository);
  });

  it('should call repository with correct data', async () => {
    const userData = { name: 'John', email: 'john@test.com' };
    mockRepository.create.mockResolvedValue({ id: '1', ...userData });

    await service.createUser(userData);

    expect(mockRepository.create).toHaveBeenCalledWith(userData);
  });
});
```

## Essential Test Cases

### Happy Path
```typescript
it('should successfully process payment with valid data', async () => {
  const payment = { amount: 100, currency: 'USD' };
  const result = await paymentService.process(payment);
  
  expect(result.success).toBe(true);
});
```

### Edge Cases
```typescript
it('should handle zero amount', async () => {
  await expect(paymentService.process({ amount: 0 }))
    .rejects
    .toThrow('Amount must be greater than zero');
});

it('should handle empty array', () => {
  expect(calculateAverage([])).toBe(0);
});
```

### Error Cases
```typescript
it('should throw ValidationError when email is invalid', async () => {
  await expect(userService.createUser({ email: 'invalid' }))
    .rejects
    .toThrow(ValidationError);
});
```

## Code Coverage

### Coverage Targets
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Best Practices

### ✅ DO
- Independent tests
- Deterministic tests
- One concept per test
- Clear assertions

### ❌ AVOID
- Dependent tests
- Non-deterministic tests
- Multiple concepts in one test
- Generic assertions

---

**Remember**: Unit tests should be FIRST:
- **F**ast
- **I**ndependent
- **R**epeatable
- **S**elf-validating
- **T**imely


# 🎯 QA Heuristics

## What are Test Heuristics?

Heuristics are mental shortcuts, practical rules, and strategies that help testers find bugs efficiently.

## Test Coverage Heuristics

### SFDIPOT (San Francisco Depot)

- **S**tructure - Test architecture and code organization
- **F**unction - Test each feature as specified
- **D**ata - Test with different types and combinations of data
- **I**nterface - Test all interfaces (UI, API, CLI)
- **P**latform - Test on different OS, browsers, devices
- **O**peration - Test system in different operational states
- **T**ime - Test time-related behaviors

### FEW HICCUPPS

Product quality dimensions:

- **F**eature Set
- **E**xperience
- **W**orkflow
- **H**elpful documentation
- **I**nput/Output
- **C**ompatibility
- **C**omplexity
- **U**sability
- **P**erformance
- **P**ortability
- **S**ecurity

## Test Techniques

### Boundary Value Analysis

Test at boundaries and adjacencies:

```typescript
// Example: Age validation (18-65)
const testCases = [
  { age: 17, valid: false },  // Below minimum
  { age: 18, valid: true },   // Minimum (valid)
  { age: 19, valid: true },   // Above minimum
  { age: 64, valid: true },   // Below maximum
  { age: 65, valid: true },   // Maximum (valid)
  { age: 66, valid: false },  // Above maximum
];
```

### Equivalence Partitioning

Divide inputs into equivalent classes:

```typescript
// Example: Discount by quantity
// 1-9: no discount
// 10-49: 10% discount
// 50-99: 20% discount
// 100+: 30% discount
```

### State Transition Testing

Test transitions between states:

```typescript
enum OrderState {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Test valid and invalid transitions
```

## Bug Finding Heuristics

### CRUD

Test basic operations on all resources:

- **C**reate - Create new records
- **R**ead - Read/view records
- **U**pdate - Update existing records
- **D**elete - Delete records

### Goldilocks (Test in 3s)

Test with three values: too small, just right, too large

```typescript
const testInputs = [
  '',                    // Empty (too small)
  'Valid Name',          // Valid (just right)
  'A'.repeat(1000),      // Too long (too large)
];
```

### 0, 1, Many

Test with zero, one, and multiple items:

```typescript
describe('Shopping Cart', () => {
  test('with 0 items', () => { /* Empty cart */ });
  test('with 1 item', () => { /* Single item */ });
  test('with many items', () => { /* Multiple items */ });
});
```

## Test Data Heuristics

### Edge Data

```typescript
// Strings
const stringTests = [
  '',                           // Empty
  ' ',                          // Space
  '<script>alert(1)</script>',  // XSS
  '../../../etc/passwd',        // Path traversal
  '你好世界',                    // Unicode
  '🎉🎈🎊',                      // Emojis
];

// Numbers
const numberTests = [
  0,
  -1,
  Number.MAX_SAFE_INTEGER,
  Infinity,
  NaN,
];
```

## Security Heuristics

### STRIDE

Threat categories:

- **S**poofing - Identity falsification
- **T**ampering - Data tampering
- **R**epudiation - Action repudiation
- **I**nformation Disclosure - Information disclosure
- **D**enial of Service - Denial of service
- **E**levation of Privilege - Privilege elevation

### OWASP Top 10

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software and Data Integrity Failures
9. Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

## Fundamental Principles

### Pesticide Paradox

> "Tests run repeatedly won't find new bugs"

**Solution**: Review and update test cases regularly

### Error Guessing

Use experience and intuition to predict where bugs might be:

- Recently modified code
- Complex code
- Code with bug history
- System integrations
- Edge case handling
- Critical business logic

---

**Remember**: Heuristics are guides, not rules. Adapt to your project's context.


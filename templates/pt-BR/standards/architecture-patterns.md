# 🏗️ Padrões de Arquitetura

## Estrutura de Diretórios

### Backend (Node.js/TypeScript)
```
src/
├── controllers/         # Controladores de rotas
├── services/           # Lógica de negócio
├── repositories/       # Acesso a dados
├── models/            # Modelos de dados
├── middlewares/       # Middlewares do Express
├── utils/             # Funções utilitárias
├── config/            # Configurações
├── types/             # Definições de tipos TypeScript
└── tests/             # Testes
```

### Frontend (React/Vue)
```
src/
├── components/        # Componentes reutilizáveis
│   ├── ui/           # Componentes de UI base
│   └── features/     # Componentes específicos de features
├── pages/            # Páginas/Views
├── hooks/            # Custom hooks
├── services/         # Chamadas de API
├── store/            # Estado global (Redux/Zustand)
├── utils/            # Funções utilitárias
├── types/            # Tipos TypeScript
└── tests/            # Testes
```

## Padrões de Design

### 1. Repository Pattern
Separa a lógica de acesso a dados da lógica de negócio.

```typescript
// repositories/user-repository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    return this.db.users.findUnique({ where: { id } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    return this.db.users.create({ data: userData });
  }

  // ... outros métodos
}
```

### 2. Service Pattern
Contém a lógica de negócio e orquestra repositórios.

```typescript
// services/user-service.ts
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    // Validação
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email já cadastrado');
    }

    // Lógica de negócio
    const hashedPassword = await hashPassword(data.password);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Efeitos colaterais
    await this.emailService.sendWelcomeEmail(user.email);

    return user;
  }
}
```

### 3. Factory Pattern
Cria objetos sem especificar a classe exata.

```typescript
// factories/notification-factory.ts
interface INotification {
  send(message: string): Promise<void>;
}

class EmailNotification implements INotification {
  async send(message: string) {
    // Enviar email
  }
}

class SMSNotification implements INotification {
  async send(message: string) {
    // Enviar SMS
  }
}

class PushNotification implements INotification {
  async send(message: string) {
    // Enviar push
  }
}

export class NotificationFactory {
  static create(type: 'email' | 'sms' | 'push'): INotification {
    switch (type) {
      case 'email':
        return new EmailNotification();
      case 'sms':
        return new SMSNotification();
      case 'push':
        return new PushNotification();
      default:
        throw new Error(`Tipo de notificação desconhecido: ${type}`);
    }
  }
}
```

### 4. Strategy Pattern
Define uma família de algoritmos e os torna intercambiáveis.

```typescript
// strategies/payment-strategy.ts
interface PaymentStrategy {
  processPayment(amount: number): Promise<PaymentResult>;
}

class CreditCardPayment implements PaymentStrategy {
  async processPayment(amount: number): Promise<PaymentResult> {
    // Processar cartão de crédito
    return { success: true, transactionId: 'cc-123' };
  }
}

class PayPalPayment implements PaymentStrategy {
  async processPayment(amount: number): Promise<PaymentResult> {
    // Processar PayPal
    return { success: true, transactionId: 'pp-456' };
  }
}

class PixPayment implements PaymentStrategy {
  async processPayment(amount: number): Promise<PaymentResult> {
    // Processar PIX
    return { success: true, transactionId: 'pix-789' };
  }
}

export class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  async process(amount: number) {
    return this.strategy.processPayment(amount);
  }
}
```

### 5. Dependency Injection
Inverte o controle de dependências.

```typescript
// container.ts (usando tsyringe ou similar)
import { container } from 'tsyringe';

// Registrar dependências
container.register('IUserRepository', { useClass: UserRepository });
container.register('IEmailService', { useClass: EmailService });
container.register('UserService', { useClass: UserService });

// Usar em controllers
export class UserController {
  constructor(
    @inject('UserService') private userService: UserService
  ) {}

  async createUser(req: Request, res: Response) {
    const user = await this.userService.createUser(req.body);
    return res.status(201).json(user);
  }
}
```

## Arquitetura em Camadas

### Clean Architecture / Hexagonal Architecture

```
┌─────────────────────────────────────┐
│         Interface Layer             │
│    (Controllers, Routes, Views)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Application Layer             │
│    (Use Cases, Services)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Domain Layer                │
│    (Entities, Business Logic)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Infrastructure Layer           │
│  (Database, External APIs, Files)   │
└─────────────────────────────────────┘
```

### Exemplo Prático

```typescript
// domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    private password: string
  ) {}

  updateName(newName: string) {
    if (newName.length < 2) {
      throw new Error('Nome muito curto');
    }
    this.name = newName;
  }

  verifyPassword(plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, this.password);
  }
}

// application/use-cases/create-user.use-case.ts
export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
    private eventBus: IEventBus
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    // 1. Validar dados
    await this.validateInput(input);

    // 2. Criar entidade
    const hashedPassword = await this.passwordHasher.hash(input.password);
    const user = new User(
      generateId(),
      input.name,
      input.email,
      hashedPassword
    );

    // 3. Persistir
    await this.userRepository.save(user);

    // 4. Publicar evento
    await this.eventBus.publish(new UserCreatedEvent(user));

    return user;
  }

  private async validateInput(input: CreateUserInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('Email já existe');
    }
  }
}

// infrastructure/controllers/user.controller.ts
export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async create(req: Request, res: Response) {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
```

## Padrões de Frontend

### 1. Component Composition
```typescript
// Componente base
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
}

// Composição
export function SaveButton() {
  return (
    <Button variant="primary" size="lg" onClick={handleSave}>
      <SaveIcon />
      Salvar
    </Button>
  );
}
```

### 2. Custom Hooks
```typescript
// hooks/use-fetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// Uso
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useFetch<User>(`/api/users/${userId}`);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;

  return <div>{user.name}</div>;
}
```

### 3. Render Props Pattern
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, loading, error } = useFetch<T>(url);
  return <>{children(data, loading, error)}</>;
}

// Uso
<DataFetcher<User> url="/api/user">
  {(user, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage error={error} />;
    return <UserCard user={user} />;
  }}
</DataFetcher>
```

## Padrões de API REST

### RESTful Conventions
```
GET    /api/users           - Listar usuários
GET    /api/users/:id       - Obter usuário específico
POST   /api/users           - Criar usuário
PUT    /api/users/:id       - Atualizar usuário (completo)
PATCH  /api/users/:id       - Atualizar usuário (parcial)
DELETE /api/users/:id       - Deletar usuário

GET    /api/users/:id/posts - Listar posts do usuário
POST   /api/users/:id/posts - Criar post para usuário
```

### Response Patterns
```typescript
// Sucesso
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operação realizada com sucesso"
}

// Erro
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      { "field": "email", "message": "Email inválido" }
    ]
  }
}

// Paginação
{
  "success": true,
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

**Nota**: Adapte estes padrões conforme a necessidade do seu projeto. Use `.ai/custom/` para documentar arquitetura específica.


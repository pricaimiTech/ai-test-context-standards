# ✨ Melhores Práticas

## Git & Controle de Versão

### Commits
```bash
# Formato: tipo(escopo): descrição

# Tipos:
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração de código
test: adição/modificação de testes
chore: tarefas de manutenção

# Exemplos:
feat(auth): adicionar login com Google
fix(api): corrigir validação de email
docs(readme): atualizar instruções de instalação
refactor(user-service): simplificar lógica de validação
test(auth): adicionar testes para recuperação de senha
```

### Branches
```bash
main/master          # Produção
develop             # Desenvolvimento
feature/nome        # Nova funcionalidade
bugfix/nome         # Correção de bug
hotfix/nome         # Correção urgente em produção
release/v1.2.3      # Preparação de release
```

### Pull Requests
- Título claro e descritivo
- Descrição detalhada do que foi feito e por quê
- Screenshots/GIFs para mudanças visuais
- Checklist de review
- Referenciar issues relacionadas

```markdown
## Descrição
Implementação do sistema de autenticação com JWT

## Mudanças
- Adicionar endpoint de login
- Implementar middleware de autenticação
- Criar testes unitários e de integração

## Screenshots
![Login Screen](link-to-image)

## Checklist
- [x] Código testado localmente
- [x] Testes automatizados criados
- [x] Documentação atualizada
- [x] Sem breaking changes
- [ ] Aprovado por pelo menos 1 revisor

Closes #123
```

## Code Review

### Para Revisores
- ✅ Seja construtivo e respeitoso
- ✅ Explique o "porquê" das sugestões
- ✅ Elogie bom código
- ✅ Priorize: segurança > bugs > arquitetura > estilo
- ❌ Não seja pedante em questões de estilo (use linter)

### Para Autores
- ✅ PRs pequenos e focados (< 400 linhas)
- ✅ Self-review antes de solicitar revisão
- ✅ Responda todos os comentários
- ✅ Agradeça feedback construtivo
- ❌ Não leve críticas ao código para o lado pessoal

## Performance

### Frontend
```typescript
// ✅ Lazy loading de rotas
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ✅ Otimização de imagens
<img 
  src="image.jpg" 
  loading="lazy"
  width={800}
  height={600}
  alt="Descrição"
/>

// ✅ Virtual scrolling para listas grandes
import { FixedSizeList } from 'react-window';

// ✅ Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Memoização
const expensiveValue = useMemo(() => 
  calculateExpensiveValue(data), 
  [data]
);

// ✅ Debounce em inputs
const debouncedSearch = useDebounce(searchQuery, 300);
```

### Backend
```typescript
// ✅ Índices no banco de dados
// prisma/schema.prisma
model User {
  id    String @id
  email String @unique
  name  String
  
  @@index([email])
  @@index([name])
}

// ✅ Pagination
async function getUsers(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return db.user.findMany({
    skip,
    take: limit,
  });
}

// ✅ Caching
import { Redis } from 'ioredis';
const redis = new Redis();

async function getUserCached(id: string) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.user.findUnique({ where: { id } });
  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
  return user;
}

// ✅ Bulk operations
// ❌ Ruim: N queries
for (const userId of userIds) {
  await db.user.update({ where: { id: userId }, data: { active: true } });
}

// ✅ Bom: 1 query
await db.user.updateMany({
  where: { id: { in: userIds } },
  data: { active: true },
});

// ✅ Connection pooling
// Já configurado por padrão em ORMs modernos

// ✅ Streaming para arquivos grandes
import { createReadStream } from 'fs';

app.get('/download', (req, res) => {
  const stream = createReadStream('large-file.zip');
  stream.pipe(res);
});
```

## Segurança

### Autenticação e Autorização
```typescript
// ✅ Hash de senhas
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);

// ✅ JWT com expiração
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

// ✅ Refresh tokens
const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.REFRESH_SECRET!,
  { expiresIn: '7d' }
);

// ✅ Middleware de autenticação
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// ✅ RBAC (Role-Based Access Control)
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}

app.delete('/api/users/:id', 
  authenticateToken, 
  requireRole('admin'), 
  deleteUser
);
```

### Validação de Dados
```typescript
import { z } from 'zod';

// ✅ Schema de validação
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().positive().min(18).max(120),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

// ✅ Middleware de validação
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}

app.post('/api/users', validate(userSchema), createUser);
```

### Proteção contra Ataques

```typescript
// ✅ Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de requisições
  message: 'Muitas requisições, tente novamente mais tarde',
});

app.use('/api/', limiter);

// ✅ Helmet (segurança de headers HTTP)
import helmet from 'helmet';
app.use(helmet());

// ✅ CORS configurado corretamente
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));

// ✅ SQL Injection prevention (use ORMs com prepared statements)
// ❌ NUNCA FAÇA:
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ SEMPRE FAÇA:
db.user.findUnique({ where: { email } });

// ✅ XSS Prevention
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);

// ✅ CSRF Protection
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);
```

## Logging e Monitoramento

### Logging Estruturado
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Uso
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Database connection failed', { error: error.message });
logger.warn('API rate limit approaching', { userId, requests: 95 });
```

### Métricas
```typescript
// ✅ Instrumentação básica
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
});

// Endpoint de métricas para Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

## Ambiente e Configuração

### Variáveis de Ambiente
```typescript
// .env.example (commitar)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-here
NODE_ENV=development
PORT=3000

// .env (NÃO commitar - adicionar ao .gitignore)
# Valores reais aqui

// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

### Diferentes Ambientes
```typescript
// config/index.ts
const baseConfig = {
  app: {
    name: 'MyApp',
    version: '1.0.0',
  },
};

const developmentConfig = {
  ...baseConfig,
  database: {
    logging: true,
  },
  cors: {
    origin: '*',
  },
};

const productionConfig = {
  ...baseConfig,
  database: {
    logging: false,
    ssl: true,
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
  },
};

export const config = 
  process.env.NODE_ENV === 'production' 
    ? productionConfig 
    : developmentConfig;
```

## Documentação

### README.md Completo
```markdown
# Nome do Projeto

Breve descrição do projeto

## 🚀 Tecnologias
- Node.js 18+
- TypeScript
- PostgreSQL
- Redis

## 📋 Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

## 🔧 Instalação
\`\`\`bash
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run db:migrate
\`\`\`

## 🏃 Executando
\`\`\`bash
npm run dev      # Desenvolvimento
npm run build    # Build
npm start        # Produção
\`\`\`

## 🧪 Testes
\`\`\`bash
npm test              # Todos os testes
npm run test:unit     # Testes unitários
npm run test:e2e      # Testes E2E
npm run test:coverage # Cobertura
\`\`\`

## 📝 Documentação
- [API Docs](./docs/api.md)
- [Architecture](./docs/architecture.md)

## 🤝 Contribuindo
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing`)
5. Abra um Pull Request

## 📄 Licença
MIT
```

### Documentação de API
```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
app.post('/api/users', createUser);
```

---

**Lembre-se**: Estas são diretrizes, não regras absolutas. Adapte conforme o contexto do seu projeto.


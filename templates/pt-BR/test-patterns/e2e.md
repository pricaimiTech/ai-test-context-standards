# 🌐 Padrões de Testes E2E (End-to-End)

## O que são Testes E2E?

Testes End-to-End simulam o comportamento real do usuário, testando a aplicação completa desde a interface até o banco de dados, passando por todas as camadas.

## Ferramentas Principais

- **Playwright** - Recomendado (multi-browser, rápido, API moderna)
- **Cypress** - Popular (fácil debug, time-travel)
- **Puppeteer** - Google Chrome/Chromium

## Setup Básico (Playwright)

### Instalação
```bash
npm install -D @playwright/test
npx playwright install
```

### Configuração
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Estrutura de Testes

### Page Object Pattern
```typescript
// pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  // Seletores
  private selectors = {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    submitButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]',
  };

  // Ações
  async navigate() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.fill(this.selectors.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.page.fill(this.selectors.passwordInput, password);
  }

  async submit() {
    await this.page.click(this.selectors.submitButton);
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  // Verificações
  async getErrorMessage() {
    return await this.page.textContent(this.selectors.errorMessage);
  }

  async isLoginSuccessful() {
    await this.page.waitForURL('/dashboard');
    return this.page.url().includes('/dashboard');
  }
}

// Uso no teste
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginPage.login('user@example.com', 'ValidPass123');
    
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.login('user@example.com', 'WrongPassword');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });
});
```

## Seletores Robustos

### Prioridade de Seletores
```typescript
// ✅ MELHOR: data-testid (não afetado por mudanças de estilo/texto)
await page.click('[data-testid="submit-button"]');

// ✅ BOM: Atributos semânticos
await page.click('[aria-label="Submit form"]');
await page.click('button[type="submit"]');

// ⚠️ OK: Classes específicas
await page.click('.submit-button');

// ❌ EVITAR: IDs (podem mudar)
await page.click('#btn-123');

// ❌ EVITAR: Texto (internacionalização, mudanças)
await page.click('text=Enviar');

// ❌ EVITAR: Seletores frágeis
await page.click('div > div > button:nth-child(3)');
```

### Boas Práticas de Seletores
```typescript
// Adicionar data-testid nos componentes
<button data-testid="add-to-cart-button">Add to Cart</button>
<input data-testid="search-input" type="text" />
<div data-testid="product-card">{product.name}</div>

// Usar getByRole quando possível
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
await page.getByRole('heading', { name: 'Welcome' }).isVisible();
```

## Fluxos Comuns

### Autenticação
```typescript
// fixtures/auth.fixture.ts
export async function loginAsUser(page: Page, role: 'user' | 'admin' = 'user') {
  const credentials = {
    user: { email: 'user@test.com', password: 'UserPass123' },
    admin: { email: 'admin@test.com', password: 'AdminPass123' },
  };

  await page.goto('/login');
  await page.fill('[data-testid="email"]', credentials[role].email);
  await page.fill('[data-testid="password"]', credentials[role].password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}

// Uso
test('should access protected page', async ({ page }) => {
  await loginAsUser(page, 'user');
  
  await page.goto('/profile');
  await expect(page.getByText('My Profile')).toBeVisible();
});

// Reutilizar sessão (mais rápido)
import { test as base } from '@playwright/test';

const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Login uma vez
    await loginAsUser(page, 'user');
    
    // Salvar estado
    await page.context().storageState({ path: 'auth-state.json' });
    
    await use(page);
  },
});

test('test with auth', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Já está autenticado!
});
```

### Formulários
```typescript
test('should submit contact form', async ({ page }) => {
  await page.goto('/contact');

  // Preencher campos
  await page.fill('[data-testid="name"]', 'John Doe');
  await page.fill('[data-testid="email"]', 'john@example.com');
  await page.fill('[data-testid="subject"]', 'Test Subject');
  await page.fill('[data-testid="message"]', 'This is a test message');

  // Checkbox/Radio
  await page.check('[data-testid="terms-checkbox"]');
  await page.check('[data-testid="contact-method-email"]');

  // Select
  await page.selectOption('[data-testid="category"]', 'support');

  // Upload arquivo
  await page.setInputFiles(
    '[data-testid="attachment"]',
    'path/to/file.pdf'
  );

  // Submit
  await page.click('[data-testid="submit-button"]');

  // Verificar sucesso
  await expect(page.getByText('Message sent successfully')).toBeVisible();
});
```

### Navegação
```typescript
test('should navigate through pages', async ({ page }) => {
  await page.goto('/');

  // Link direto
  await page.click('[data-testid="about-link"]');
  await expect(page).toHaveURL('/about');

  // Botão de voltar
  await page.goBack();
  await expect(page).toHaveURL('/');

  // Botão de avançar
  await page.goForward();
  await expect(page).toHaveURL('/about');

  // Nova aba
  const [newPage] = await Promise.all([
    page.context().waitForEvent('page'),
    page.click('[data-testid="external-link"]'),
  ]);
  await expect(newPage).toHaveURL(/external-site\.com/);
});
```

### Esperas (Waits)
```typescript
// ✅ Esperar elemento aparecer
await page.waitForSelector('[data-testid="loading"]', { state: 'visible' });
await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' });

// ✅ Esperar navegação
await Promise.all([
  page.waitForNavigation(),
  page.click('[data-testid="submit"]'),
]);

// ✅ Esperar requisição
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/users')),
  page.click('[data-testid="load-users"]'),
]);

// ✅ Esperar condição customizada
await page.waitForFunction(() => {
  return document.querySelectorAll('.item').length > 10;
});

// ❌ EVITAR: Sleeps fixos
await page.waitForTimeout(3000); // ❌ Frágil e lento
```

## Assertions Comuns

### Visibilidade
```typescript
// Elemento visível
await expect(page.getByTestId('welcome-message')).toBeVisible();

// Elemento oculto
await expect(page.getByTestId('error-alert')).toBeHidden();

// Elemento existe no DOM (mas pode estar oculto)
await expect(page.getByTestId('hidden-div')).toBeAttached();

// Elemento não existe
await expect(page.getByTestId('deleted-item')).not.toBeAttached();
```

### Conteúdo
```typescript
// Texto exato
await expect(page.getByTestId('title')).toHaveText('Welcome');

// Texto contém
await expect(page.getByTestId('description')).toContainText('Lorem ipsum');

// Múltiplos elementos
await expect(page.getByTestId('item')).toHaveText([
  'Item 1',
  'Item 2',
  'Item 3',
]);

// Input value
await expect(page.getByTestId('email-input')).toHaveValue('test@example.com');
```

### Atributos e Estados
```typescript
// Atributo
await expect(page.getByTestId('link')).toHaveAttribute('href', '/about');

// Classe
await expect(page.getByTestId('button')).toHaveClass(/active/);

// Checkbox/Radio
await expect(page.getByTestId('terms')).toBeChecked();
await expect(page.getByTestId('newsletter')).not.toBeChecked();

// Disabled/Enabled
await expect(page.getByTestId('submit')).toBeEnabled();
await expect(page.getByTestId('submit')).toBeDisabled();

// Foco
await expect(page.getByTestId('search')).toBeFocused();
```

### URL e Navegação
```typescript
// URL exata
await expect(page).toHaveURL('https://example.com/dashboard');

// URL contém
await expect(page).toHaveURL(/dashboard/);

// Título da página
await expect(page).toHaveTitle('Dashboard - My App');
```

## Testes de Responsividade

```typescript
test('should be responsive on mobile', async ({ page }) => {
  // Definir viewport mobile
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');

  // Menu mobile deve estar visível
  await expect(page.getByTestId('mobile-menu-button')).toBeVisible();

  // Menu desktop deve estar oculto
  await expect(page.getByTestId('desktop-menu')).toBeHidden();

  // Abrir menu mobile
  await page.click('[data-testid="mobile-menu-button"]');
  await expect(page.getByTestId('mobile-menu')).toBeVisible();
});

test.describe('Responsive tests', () => {
  const devices = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const device of devices) {
    test(`should render correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize({ 
        width: device.width, 
        height: device.height 
      });
      
      await page.goto('/');
      
      // Screenshot para comparação visual
      await expect(page).toHaveScreenshot(`homepage-${device.name}.png`);
    });
  }
});
```

## Testes de Performance

```typescript
test('should load page within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 segundos
});

test('should have good web vitals', async ({ page }) => {
  await page.goto('/');
  
  // Largest Contentful Paint
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.renderTime || lastEntry.loadTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  });
  
  expect(lcp).toBeLessThan(2500); // 2.5s é "good" para LCP
});
```

## Testes Visuais (Visual Regression)

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  
  // Screenshot da página inteira
  await expect(page).toHaveScreenshot('homepage.png');
  
  // Screenshot de elemento específico
  const header = page.getByTestId('header');
  await expect(header).toHaveScreenshot('header.png');
  
  // Com opções
  await expect(page).toHaveScreenshot('homepage-full.png', {
    fullPage: true,
    mask: [page.getByTestId('dynamic-content')], // Mascarar conteúdo dinâmico
  });
});

test('should not have visual regressions', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Aguardar animações terminarem
  await page.waitForTimeout(500);
  
  // Comparar com baseline
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100, // Tolerar pequenas diferenças
  });
});
```

## Testes de Acessibilidade

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('should be keyboard navigable', async ({ page }) => {
  await page.goto('/');
  
  // Tab através dos elementos
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('first-link')).toBeFocused();
  
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('second-link')).toBeFocused();
  
  // Enter para clicar
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/about');
});

test('should have proper ARIA labels', async ({ page }) => {
  await page.goto('/');
  
  // Verificar labels
  await expect(page.getByLabel('Search')).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
});
```

## Debug de Testes

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/');
  
  // Pausar execução (abre DevTools)
  await page.pause();
  
  // Screenshot
  await page.screenshot({ path: 'debug.png' });
  
  // Video (configurar no playwright.config.ts)
  // video: 'on'
  
  // Trace (time-travel debugging)
  // Configurar: trace: 'on'
  // Ver: npx playwright show-trace trace.zip
  
  // Console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  // Network requests
  page.on('request', request => {
    console.log('REQUEST:', request.url());
  });
  
  page.on('response', response => {
    console.log('RESPONSE:', response.url(), response.status());
  });
});
```

## Fixtures e Helpers

```typescript
// fixtures/test-data.fixture.ts
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123',
    name: 'Admin User',
  },
  user: {
    email: 'user@test.com',
    password: 'UserPass123',
    name: 'Regular User',
  },
};

export async function seedDatabase() {
  // Inserir dados de teste no banco
  await db.users.createMany({ data: Object.values(testUsers) });
}

export async function cleanDatabase() {
  await db.users.deleteMany();
}

// Uso
test.beforeEach(async () => {
  await cleanDatabase();
  await seedDatabase();
});
```

## Paralelização e Isolamento

```typescript
// playwright.config.ts
export default defineConfig({
  // Executar testes em paralelo
  fullyParallel: true,
  workers: 4, // 4 workers paralelos
  
  // Cada teste em contexto isolado
  use: {
    // Cada teste começa com navegador limpo
    storageState: undefined,
  },
});

// Evitar race conditions
test.describe.serial('Order-dependent tests', () => {
  // Estes rodam em sequência
  test('first', async ({ page }) => { /* ... */ });
  test('second', async ({ page }) => { /* ... */ });
});
```

## Boas Práticas

### ✅ FAZER
```typescript
// Usar Page Objects
const loginPage = new LoginPage(page);
await loginPage.login(credentials);

// Data-testid
<button data-testid="submit-btn">Submit</button>

// Esperas automáticas
await page.click('[data-testid="button"]'); // Já espera elemento estar pronto

// Testes independentes
test.beforeEach(async ({ page }) => {
  await setupCleanState();
});

// Screenshots em falhas (configurado automaticamente)
screenshot: 'only-on-failure'
```

### ❌ EVITAR
```typescript
// Sleeps fixos
await page.waitForTimeout(5000); // ❌

// Seletores frágeis
await page.click('div > div > button:nth-child(3)'); // ❌

// Testes dependentes
let globalUserId; // ❌
test('create user', () => { globalUserId = ... });
test('update user', () => { updateUser(globalUserId); }); // ❌

// Sem limpeza
test('test', async () => {
  await createTestData();
  // ❌ não limpou
});
```

## Checklist

- [ ] Page Objects criados para páginas principais
- [ ] Data-testid em elementos testáveis
- [ ] Testes independentes e isolados
- [ ] Esperas automáticas (sem timeouts fixos)
- [ ] Screenshots configurados
- [ ] Testes em múltiplos browsers/dispositivos
- [ ] Acessibilidade verificada
- [ ] Performance medida
- [ ] Debug helpers configurados
- [ ] CI/CD integrado

---

**Lembre-se**: Testes E2E são lentos e caros. Use-os para fluxos críticos e mantenha a maioria dos testes em unit/integration.


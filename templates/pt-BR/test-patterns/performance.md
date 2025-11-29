# ⚡ Padrões de Testes de Performance

## O que são Testes de Performance?

Testes de performance avaliam velocidade, escalabilidade, estabilidade e uso de recursos do sistema sob diferentes cargas de trabalho.

## Tipos de Testes de Performance

### 1. Load Testing (Teste de Carga)
Avalia comportamento sob carga esperada normal.

### 2. Stress Testing (Teste de Estresse)
Encontra o ponto de quebra aumentando carga gradualmente.

### 3. Spike Testing (Teste de Pico)
Avalia comportamento sob aumento súbito de carga.

### 4. Soak Testing (Teste de Imersão)
Avalia estabilidade sob carga prolongada (detecta memory leaks).

### 5. Scalability Testing (Teste de Escalabilidade)
Avalia capacidade de escalar horizontalmente ou verticalmente.

### 6. Volume Testing (Teste de Volume)
Avalia comportamento com grandes volumes de dados.

## Ferramentas

- **k6** - Moderno, scriptable em JavaScript
- **Artillery** - Node.js, fácil configuração YAML
- **JMeter** - Enterprise, GUI, muitos plugins
- **Gatling** - Scala, relatórios detalhados
- **Locust** - Python, distribuído

## Setup com k6

### Instalação
```bash
brew install k6  # macOS
# ou
npm install -g k6
```

### Script Básico
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up para 10 usuários
    { duration: '1m', target: 10 },   // Manter 10 usuários
    { duration: '10s', target: 0 },   // Ramp-down para 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições < 500ms
    http_req_failed: ['rate<0.01'],   // Taxa de erro < 1%
    errors: ['rate<0.1'],              // Taxa de erro custom < 10%
  },
};

export default function () {
  const response = http.get('http://localhost:3000/api/users');
  
  // Verificações
  const checkResult = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has data': (r) => JSON.parse(r.body).data.length > 0,
  });

  errorRate.add(!checkResult);

  sleep(1); // Pensar tempo entre requisições
}
```

### Executar
```bash
k6 run load-test.js
k6 run --vus 50 --duration 5m load-test.js
k6 run --out json=results.json load-test.js
```

## Padrões de Teste

### Load Test (Carga Normal)
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Subir para 100 usuários
    { duration: '5m', target: 100 },  // Manter 100 usuários
    { duration: '2m', target: 0 },    // Descer para 0
  ],
};
```

### Stress Test (Estresse)
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Normal
    { duration: '5m', target: 100 },   
    { duration: '2m', target: 200 },   // Aumentar
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },   // Mais ainda
    { duration: '5m', target: 300 },
    { duration: '10m', target: 400 },  // Ponto de quebra
    { duration: '3m', target: 0 },     // Recuperar
  ],
};
```

### Spike Test (Pico Súbito)
```javascript
export const options = {
  stages: [
    { duration: '10s', target: 100 },   // Normal
    { duration: '1m', target: 100 },
    { duration: '10s', target: 1000 },  // Pico súbito!
    { duration: '3m', target: 1000 },   // Manter pico
    { duration: '10s', target: 100 },   // Voltar ao normal
    { duration: '3m', target: 100 },
    { duration: '10s', target: 0 },
  ],
};
```

### Soak Test (Longa Duração)
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 400 },    // Ramp-up
    { duration: '3h', target: 400 },    // Manter por horas
    { duration: '2m', target: 0 },      // Ramp-down
  ],
};
```

## Testes de Endpoints Específicos

### Autenticação e Token
```javascript
import http from 'k6/http';
import { check } from 'k6';

let authToken;

export function setup() {
  // Executado uma vez antes de todos os testes
  const loginRes = http.post('http://localhost:3000/api/auth/login', 
    JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  authToken = JSON.parse(loginRes.body).token;
  return { token: authToken };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.get('http://localhost:3000/api/profile', params);
  
  check(response, {
    'authenticated': (r) => r.status === 200,
  });
}
```

### Teste de CRUD
```javascript
import http from 'k6/http';
import { check, group } from 'k6';

export default function () {
  const baseUrl = 'http://localhost:3000/api';
  let userId;

  group('Create User', () => {
    const payload = JSON.stringify({
      name: `User ${__VU}-${__ITER}`,
      email: `user-${__VU}-${__ITER}@test.com`,
      password: 'Test123!',
    });

    const response = http.post(`${baseUrl}/users`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(response, {
      'created successfully': (r) => r.status === 201,
      'has user id': (r) => JSON.parse(r.body).id !== undefined,
    });

    userId = JSON.parse(response.body).id;
  });

  group('Read User', () => {
    const response = http.get(`${baseUrl}/users/${userId}`);
    
    check(response, {
      'user found': (r) => r.status === 200,
      'has correct id': (r) => JSON.parse(r.body).id === userId,
    });
  });

  group('Update User', () => {
    const payload = JSON.stringify({
      name: `Updated User ${__VU}-${__ITER}`,
    });

    const response = http.put(`${baseUrl}/users/${userId}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(response, {
      'updated successfully': (r) => r.status === 200,
    });
  });

  group('Delete User', () => {
    const response = http.del(`${baseUrl}/users/${userId}`);
    
    check(response, {
      'deleted successfully': (r) => r.status === 204,
    });
  });
}
```

### Teste de Paginação
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const pages = [1, 2, 3, 4, 5];
  const page = pages[Math.floor(Math.random() * pages.length)];
  
  const response = http.get(
    `http://localhost:3000/api/products?page=${page}&perPage=20`
  );

  check(response, {
    'status 200': (r) => r.status === 200,
    'has pagination': (r) => {
      const body = JSON.parse(r.body);
      return body.pagination && body.pagination.page === page;
    },
    'has data': (r) => JSON.parse(r.body).data.length > 0,
  });
}
```

## Métricas Importantes

### Métricas Built-in do k6
```javascript
// http_req_duration: Tempo total de requisição
// http_req_waiting: Tempo aguardando resposta (TTFB)
// http_req_connecting: Tempo de conexão TCP
// http_req_tls_handshaking: Tempo de TLS handshake
// http_req_sending: Tempo enviando dados
// http_req_receiving: Tempo recebendo dados
// http_req_blocked: Tempo bloqueado
// http_req_failed: Taxa de falha
// http_reqs: Total de requisições
// vus: Virtual users ativos
// vus_max: Máximo de VUs
// iteration_duration: Duração da iteração
```

### Métricas Customizadas
```javascript
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

const errorCounter = new Counter('errors');
const activeUsers = new Gauge('active_users');
const successRate = new Rate('success_rate');
const responseTime = new Trend('custom_response_time');

export default function () {
  const response = http.get('http://localhost:3000/api/users');
  
  // Registrar métricas
  responseTime.add(response.timings.duration);
  successRate.add(response.status === 200);
  
  if (response.status !== 200) {
    errorCounter.add(1);
  }
  
  activeUsers.add(__VU);
}
```

## Thresholds (Limites Aceitáveis)

```javascript
export const options = {
  thresholds: {
    // 95% das requisições devem completar em < 500ms
    http_req_duration: ['p(95)<500'],
    
    // 99% das requisições devem completar em < 1s
    'http_req_duration{type:api}': ['p(99)<1000'],
    
    // Taxa de erro deve ser < 1%
    http_req_failed: ['rate<0.01'],
    
    // Throughput mínimo de 100 req/s
    http_reqs: ['rate>100'],
    
    // Tempo de resposta médio < 200ms
    http_req_duration: ['avg<200'],
    
    // Máximo de 50 erros durante o teste
    errors: ['count<50'],
  },
};
```

## Testes de Database

### Query Performance
```javascript
import sql from 'k6/x/sql';

const db = sql.open('postgres', 'postgres://user:pass@localhost:5432/db');

export default function () {
  // Query simples
  const simpleResult = sql.query(db, 'SELECT * FROM users LIMIT 10');
  
  check(simpleResult, {
    'simple query returned results': (r) => r.length > 0,
  });

  // Query complexa com JOINs
  const complexResult = sql.query(db, `
    SELECT u.*, COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id
    HAVING COUNT(p.id) > 5
  `);

  check(complexResult, {
    'complex query executed': (r) => r !== null,
  });
}

export function teardown() {
  db.close();
}
```

## Testes Frontend

### Lighthouse CI
```yaml
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["warn", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["warn", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

### Web Vitals no Browser
```typescript
import { test } from '@playwright/test';

test('should have good web vitals', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = { lcp: 0, fid: 0, cls: 0 };

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0] as any;
        vitals.fid = firstInput.processingStart - firstInput.startTime;
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            vitals.cls += (entry as any).value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      setTimeout(() => resolve(vitals), 5000);
    });
  });

  console.log('Web Vitals:', metrics);

  // Thresholds do Google
  expect(metrics.lcp).toBeLessThan(2500);  // Good: < 2.5s
  expect(metrics.fid).toBeLessThan(100);   // Good: < 100ms
  expect(metrics.cls).toBeLessThan(0.1);   // Good: < 0.1
});
```

## Monitoring de Performance

### Métricas de Sistema
```javascript
import { Counter, Gauge } from 'k6/metrics';
import exec from 'k6/execution';

const cpuUsage = new Gauge('cpu_usage');
const memoryUsage = new Gauge('memory_usage');

export default function () {
  // Métricas da aplicação
  const response = http.get('http://localhost:3000/api/health');
  const health = JSON.parse(response.body);

  cpuUsage.add(health.cpu);
  memoryUsage.add(health.memory);

  check(health, {
    'cpu usage ok': (h) => h.cpu < 80,
    'memory usage ok': (h) => h.memory < 80,
  });
}
```

## Análise de Resultados

### Métricas Chave

**Response Time (Tempo de Resposta)**
- p50 (mediana): 50% das requisições
- p90: 90% das requisições
- p95: 95% das requisições
- p99: 99% das requisições

**Throughput (Taxa de Transferência)**
- Requisições por segundo
- Dados transferidos por segundo

**Error Rate (Taxa de Erro)**
- % de requisições com erro
- Tipos de erro (4xx, 5xx)

**Resource Usage (Uso de Recursos)**
- CPU
- Memória
- Disk I/O
- Network I/O

### Interpretação

```
✅ BOM:
- p95 < 500ms
- p99 < 1000ms
- Error rate < 0.1%
- CPU < 70%
- Memory estável

⚠️ ATENÇÃO:
- p95 entre 500-1000ms
- p99 entre 1000-2000ms
- Error rate 0.1-1%
- CPU 70-85%
- Memory crescendo lentamente

❌ CRÍTICO:
- p95 > 1000ms
- p99 > 2000ms
- Error rate > 1%
- CPU > 85%
- Memory leak detectado
```

## Boas Práticas

### ✅ FAZER
```javascript
// Usar thresholds para falhar build em CI
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

// Simular comportamento real de usuário
export default function () {
  http.get('http://localhost:3000/');
  sleep(randomBetween(1, 3));
  
  http.get('http://localhost:3000/products');
  sleep(randomBetween(2, 5));
  
  http.post('http://localhost:3000/cart/add', payload);
  sleep(1);
}

// Usar grupos para organizar cenários
group('User Journey', () => {
  group('Browse Products', () => { /* ... */ });
  group('Add to Cart', () => { /* ... */ });
  group('Checkout', () => { /* ... */ });
});

// Monitorar métricas durante o teste
// Use Grafana + InfluxDB para visualização em tempo real
```

### ❌ EVITAR
```javascript
// Sem sleep entre requisições (não é realista)
export default function () {
  http.get('http://localhost:3000/api/1');
  http.get('http://localhost:3000/api/2'); // ❌ Imediato
  http.get('http://localhost:3000/api/3'); // ❌ Imediato
}

// Hardcoded data (causa contenção)
const userId = '123'; // ❌ Todos usarão o mesmo ID

// Não verificar respostas
http.get('http://localhost:3000/api/users'); // ❌ Sem check

// Testar apenas happy path
// ❌ Esqueceu de testar erros, timeouts, edge cases
```

## Checklist

- [ ] Load test executado (carga normal)
- [ ] Stress test executado (encontrar limite)
- [ ] Spike test executado (picos súbitos)
- [ ] Soak test executado se aplicável (memory leaks)
- [ ] Thresholds definidos e atingidos
- [ ] p95 < 500ms, p99 < 1000ms
- [ ] Taxa de erro < 0.1%
- [ ] CPU usage < 70%
- [ ] Memória estável (sem leaks)
- [ ] Database queries otimizadas
- [ ] Indexes apropriados
- [ ] Caching implementado onde faz sentido
- [ ] CDN configurado para assets estáticos
- [ ] Gzip/Brotli compressão habilitada

---

**Lembre-se**: Performance é feature. Teste regularmente e estabeleça baselines.


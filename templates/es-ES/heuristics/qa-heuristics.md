# 🎯 Heurísticas de QA

## ¿Qué son las Heurísticas de Prueba?

Las heurísticas son atajos mentales, reglas prácticas y estrategias que ayudan a los testers a encontrar bugs de manera eficiente.

## Heurísticas de Cobertura de Pruebas

### SFDIPOT

- **S**tructure (Estructura) - Probar arquitectura y organización del código
- **F**unction (Función) - Probar cada funcionalidad según especificación
- **D**ata (Datos) - Probar con diferentes tipos y combinaciones de datos
- **I**nterface (Interfaz) - Probar todas las interfaces (UI, API, CLI)
- **P**latform (Plataforma) - Probar en diferentes SO, navegadores, dispositivos
- **O**peration (Operación) - Probar el sistema en diferentes estados operacionales
- **T**ime (Tiempo) - Probar comportamientos relacionados con el tiempo

## Técnicas de Prueba

### Análisis de Valor Límite

Probar en límites y adyacencias:

```typescript
// Ejemplo: Validación de edad (18-65)
const testCases = [
  { age: 17, valid: false },  // Por debajo del mínimo
  { age: 18, valid: true },   // Mínimo (válido)
  { age: 19, valid: true },   // Por encima del mínimo
  { age: 64, valid: true },   // Por debajo del máximo
  { age: 65, valid: true },   // Máximo (válido)
  { age: 66, valid: false },  // Por encima del máximo
];
```

## Heurísticas de Búsqueda de Bugs

### CRUD

Probar operaciones básicas en todos los recursos:

- **C**reate (Crear) - Crear nuevos registros
- **R**ead (Leer) - Leer/visualizar registros
- **U**pdate (Actualizar) - Actualizar registros existentes
- **D**elete (Eliminar) - Eliminar registros

### 0, 1, Muchos

Probar con cero, uno y múltiples elementos:

```typescript
describe('Carrito de Compras', () => {
  test('con 0 elementos', () => { /* Carrito vacío */ });
  test('con 1 elemento', () => { /* Un solo elemento */ });
  test('con muchos elementos', () => { /* Múltiples elementos */ });
});
```

## Heurísticas de Seguridad

### STRIDE

Categorías de amenazas:

- **S**poofing - Suplantación de identidad
- **T**ampering - Manipulación de datos
- **R**epudiation - Repudio de acciones
- **I**nformation Disclosure - Divulgación de información
- **D**enial of Service - Denegación de servicio
- **E**levation of Privilege - Elevación de privilegios

### OWASP Top 10

1. Control de Acceso Roto
2. Fallas Criptográficas
3. Inyección
4. Diseño Inseguro
5. Configuración de Seguridad Incorrecta
6. Componentes Vulnerables
7. Fallas de Autenticación
8. Fallas de Integridad de Software y Datos
9. Fallas de Registro y Monitoreo
10. Falsificación de Solicitudes del Lado del Servidor (SSRF)

---

**Recuerde**: Las heurísticas son guías, no reglas. Adáptelas al contexto de su proyecto.


# Notas Técnicas: Importador de Niveles

## ⚙️ Consideraciones Técnicas

### 1. Compatibilidad TypeScript/Node.js

El código fue escrito para máxima compatibilidad:

#### ❌ Evitado (Incompatible con Node < 14)
```typescript
// NO usar - falla en Node.js < 14
const arr = [...new Set(items)];  // Spread de Set
for (const [key, value] of map.entries()) {}  // Iterator de Map
```

#### ✅ Usado (Compatible)
```typescript
// SI usar - compatible con cualquier Node.js
const arr = Array.from(new Set(items));
const entries = Object.entries(object);
for (let i = 0; i < entries.length; i++) {
  const [key, value] = entries[i];
}
```

### 2. Manejo de Errores de Red

#### Descarga de Imágenes
- Si falla descarga: registra error pero continúa
- El item se crea sin imagen
- Se reporta en resumen final
- No detiene todo el proceso

```typescript
try {
  const uploadedImageId = await downloadImageAndUpload(imageUrl);
  if (uploadedImageId) {
    imageId = uploadedImageId;
    imagesUploaded++;
  }
} catch (error) {
  // Continúa con siguiente item
  errors.push(`Error descargando imagen: ${error}`);
}
```

### 3. API Calls Secuenciales vs Paralelos

#### Secuencial (Por niveles/misiones/items)
- Garantiza orden de procesamiento
- Evita race conditions
- Más seguro pero más lento

#### Paralelo (Imágenes)
- Se descargan en paralelo donde sea posible
- Futuro: optimizar con Promise.all()

### 4. Orden Numérico Automático

**Algoritmo**:
1. Recolecta todos los valores de una columna
2. Elimina duplicados
3. Ordena alfabéticamente
4. Retorna posición de cada elemento

```typescript
function calculateOrderNum(items: string[]): number[] {
  const uniqueItems = Array.from(new Set(items))
    .filter(item => item && item.trim() !== '');
  const sorted = uniqueItems.sort();  // Orden alfabético
  return items.map(item => sorted.indexOf(item) + 1);  // Posición + 1
}
```

**Ejemplo**:
```
Entrada: ["Nivel 2", "Nivel 1", "Nivel 2"]
Únicos:  ["Nivel 1", "Nivel 2"]
Ordenados: ["Nivel 1", "Nivel 2"]
Resultado: [2, 1, 2]
           ↓ ↓ ↓
           Posición en orden alfabético + 1
```

### 5. Deduplicación Inteligente

#### Niveles
```typescript
const existingLevel = existingLevels.data.find(
  (l: Level) => l.name === levelName
);
// Si existe → reutiliza ID
// Si no existe → crea nuevo
```

#### Misiones
```typescript
const existingMission = existingMissions.data.find(
  (m: Mission) => m.name === missionName
);
// Búsqueda limitada al nivel actual
// Permite misiones con mismo nombre en niveles diferentes
```

#### Items
```typescript
const existingItem = existingItems.data.find(
  (item: MissionItem) => item.title === createItemDto.title
);
// Búsqueda limitada a la misión actual
// Permite items con mismo título en misiones diferentes
```

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: "Address already in use"
**Causa**: Puerto 3012 ya en uso por proceso anterior
**Solución**:
```bash
lsof -ti:3012 | xargs kill -9
# O cambiar puerto en package.json
```

### Problema 2: "No se encontró la hoja..."
**Causa**: Nombre de hoja incorrecta o mal escrita
**Solución**:
- Verifica que sea exactamente: "Niveles Normales - Contenidos"
- Mayúsculas/minúsculas importan
- Sin espacios extra

### Problema 3: Imágenes no se suben
**Causa**: URL inaccesible o servidor de medios down
**Solución**:
- Verifica URLs manualmente en navegador
- Revisa si MediaAPI está corriendo
- Consulta logs de backend

### Problema 4: Items duplicados en BD
**Causa**: Títulos exactamente iguales en misma misión
**Solución**:
- Revisa para no tener títulos duplicados
- La búsqueda es case-sensitive
- Espacios extras cuentan como diferencia

### Problema 5: Niveles/Misiones no se crean
**Causa**: Falta de permisos o datos inválidos
**Solución**:
- Verifica que worldId sea válido
- Revisa que el usuario tenga permisos
- Valida datos en formato correcto

---

## 🔍 Debugging

### Ver logs en navegador
```javascript
// En DevTools Console
localStorage.getItem('manager_auth_token')
// Debe retornar token válido
```

### Ver errores de API
```javascript
// Network tab → ver requests a /api/levels, /api/missions, etc
// Revisar status code y response
```

### Agregar logs en componente
```typescript
console.log('Importando nivel:', levelName);
console.log('Misiones encontradas:', existingMissions.data);
console.log('Items creados:', itemsCreated);
```

---

## 📊 Performance

### Bottlenecks Identificados

1. **Descarga de imágenes**: ~500ms-2s por imagen
   - Mejora: Parallelizar con Promise.all()

2. **API calls por item**: ~100-200ms por call
   - Mejora: Batch operations en backend

3. **Parse de Excel**: Mínimo ~100ms
   - Mejora: Usar web worker

### Optimizaciones Posibles

```typescript
// Parallelizar descargas de imágenes
const imageDownloads = items.map(item =>
  downloadImageAndUpload(item['Imagen del item (URL)'])
);
const imageIds = await Promise.all(imageDownloads);

// Batch API calls
const allLevels = await levelsApi.createBatch(levelDtos);

// Web Worker para parse
const worker = new Worker('excel-parser.worker.js');
```

---

## 🔐 Seguridad

### Validaciones Implementadas

- ✅ Tipo de archivo (.xlsx)
- ✅ Contenido de archivo (hoja existe)
- ✅ URLs de imagen (básico)
- ✅ Tokens en headers (interceptor axios)

### Validaciones a Considerar

- [ ] Máximo tamaño de archivo
- [ ] Sanitización de URLs
- [ ] Rate limiting en uploads
- [ ] Validación de nombres largo
- [ ] Detección de inyección de código

### Implementación Futura Recomendada

```typescript
// Validar tamaño
if (file.size > 10 * 1024 * 1024) {  // 10MB max
  throw new Error('Archivo demasiado grande');
}

// Sanitizar URL
function isValidImageUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
}

// Rate limiting
const importQueue = new PQueue({ concurrency: 1, interval: 1000 });
```

---

## 📈 Escalabilidad

### Límites Actuales
- Archivos: Sin límite específico (depende de memoria)
- Imágenes: No hay límite de concurrencia
- Items por archivo: Probado hasta ~1000

### Mejoras para Escalabilidad
1. Procesar en chunks en backend
2. Usar streaming para archivos grandes
3. Caché de niveles/misiones
4. Batch operations en DB

```typescript
// Procesar en chunks
const CHUNK_SIZE = 100;
for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
  const chunk = rows.slice(i, i + CHUNK_SIZE);
  await processChunk(chunk);
  updateProgress((i + CHUNK_SIZE) / rows.length);
}
```

---

## 🧪 Testing (Recomendado)

### Unit Tests
```typescript
describe('LevelsImportModal', () => {
  it('debe calcular order_num correctamente', () => {
    const result = calculateOrderNum(['Z', 'A', 'M']);
    expect(result).toEqual([3, 1, 2]);
  });

  it('debe parsear variantes correctamente', () => {
    const result = 'SPF 30|50|70'.split('|');
    expect(result.length).toBe(3);
  });
});
```

### Integration Tests
```typescript
describe('Importador completo', () => {
  it('debe importar nivel con misiones e items', async () => {
    const file = createTestFile();
    const result = await handleImport(file);
    expect(result.levelsCreated).toBe(1);
    expect(result.itemsCreated).toBeGreaterThan(0);
  });
});
```

### E2E Tests
```typescript
describe('UI del Importador', () => {
  it('debe mostrar modal al hacer click', () => {
    cy.contains('Importador').click();
    cy.get('[role="dialog"]').should('be.visible');
  });

  it('debe procesar archivo y mostrar resultados', () => {
    cy.get('input[type="file"]').selectFile('test.xlsx');
    cy.contains('Importar').click();
    cy.contains('Importación completada').should('be.visible');
  });
});
```

---

## 📚 API Relacionadas

### Endpoints Utilizados

```
GET  /api/levels/world/{worldId}
POST /api/levels
PUT  /api/levels/{id}

GET  /api/missions/level/{levelId}
POST /api/missions
PUT  /api/missions/{id}

GET  /api/missions/{missionId}/items
POST /api/missions/{missionId}/items
PUT  /api/missions/items/{itemId}

POST /api/media/upload
GET  /api/media/{id}
```

### Headers Requeridos

```
Authorization: Bearer {token}
Content-Type: application/json (para JSON)
Content-Type: multipart/form-data (para archivos)
```

---

## 🔄 Versiones y Cambios

### v1.0 (Actual)
- ✅ Importación de "Niveles Normales - Contenidos"
- ✅ Cálculo automático de orden
- ✅ Descarga y subida de imágenes
- ✅ Deduplicación inteligente
- ✅ Manejo robusto de errores

### v1.1 (Planificado)
- ⏳ Importación de "Niveles Normales - Preguntas"
- ⏳ UI mejorada con wizard steps
- ⏳ Validación más robusta de datos

### v2.0 (Futuro)
- ⏳ Soporte para todos los tipos de niveles (normal, dorado, final)
- ⏳ Export a Excel
- ⏳ Historial de importaciones
- ⏳ Rollback de importación

---

## 💡 Tips de Desarrollo

### Agregar nuevo tipo de importación
1. Crear función `parseNuevaHoja()`
2. Agregar switch en modal por tipo de hoja
3. Crear lógica de procesamiento específica
4. Reutilizar componentes de progreso y resultado

### Debuggear parseo de Excel
```typescript
const rows = await parseExcel(file);
console.table(rows);  // Ver estructura
console.log(JSON.stringify(rows[0], null, 2));  // Ver primer fila
```

### Simular errores para testing
```typescript
// En handleImport()
if (Math.random() < 0.1) {  // 10% de chance
  throw new Error('Error simulado para testing');
}
```

---

## 📞 Referencias

- [XLSX Library Docs](https://docs.sheetjs.com/)
- [React File Input](https://react.dev/reference/react-dom/components/input)
- [Axios Documentation](https://axios-http.com/)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

**Última actualización**: 2025-09-24  
**Versión del documento**: 1.0  
**Mantenedor**: GitHub Copilot

# Guía de Prueba - Login Mejorado Frontend Participants

**Fecha de Implementación:** 2026-09-18

## 🎯 Objetivos de Testing

Verificar que la página de login funciona correctamente con:
1. Nuevo diseño visual usando imágenes
2. Fuentes personalizadas (Blinker y Bowlby One SC)
3. Fondo responsivo
4. Todos los elementos visuales cargando correctamente
5. Lógica de autenticación preservada

---

## 🚀 Pasos para Iniciar el Testing

### **1. Preparar el Entorno**

```bash
# Navegar al directorio del proyecto
cd /home/david/Escritorio/server/cuborojo-farmatour5/frontend-participants

# Instalar dependencias (si es la primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**Esperado:** El servidor inicia en `http://localhost:3000`

### **2. Acceder a la Página de Login**

- URL: `http://localhost:3000/login`
- Abrir en navegador

---

## ✅ Checklist de Verificación

### **A. Carga de Recursos**

- [ ] Fondo de imagen visible y responsive
  - [ ] Se ve correctamente en resolución 1920x1080
  - [ ] Se ve correctamente en resolución 768x1024 (tablet)
  - [ ] Se ve correctamente en resolución 375x667 (mobile)
  
- [ ] Logo del sistema visible
  - [ ] Posicionado correctamente en la parte superior
  - [ ] Tamaño apropiado para cada resolución
  - [ ] No se pixela (imagen clara)

- [ ] Modal del login visible
  - [ ] Fondo de imagen aplicado
  - [ ] Dimensiones correctas
  - [ ] Posicionado al centro de la pantalla

### **B. Elementos del Formulario**

- [ ] Input de DNI visible
  - [ ] Fondo de imagen aplicado
  - [ ] Placeholder visible ("12345678")
  - [ ] Aceptar solo números
  - [ ] Máximo 8 caracteres
  - [ ] Cursor enfocado automáticamente

- [ ] Botón "INGRESAR" visible
  - [ ] Fondo de imagen aplicado
  - [ ] Texto "INGRESAR" legible
  - [ ] Hover effect funciona (escala aumenta)
  - [ ] Click registra correctamente

### **C. Tipografías**

- [ ] Títulos usan fuente Blinker
  - [ ] "INGRESA TU DNI" - Blinker Bold
  - [ ] Texto legible y claro
  - [ ] No hay saltos de línea no deseados

- [ ] Texto general usa Blinker
  - [ ] Email de contacto legible
  - [ ] Todos los textos usan la fuente correcta

- [ ] Ningún error de FOUT (Flash of Unstyled Text)
  - [ ] Las fuentes cargan suavemente
  - [ ] No hay cambio de tamaño después de cargar

### **D. Funcionalidad de Login**

#### **Test 1: Login Exitoso**
```
Pasos:
1. Ingresar DNI válido (ej: 12345678)
2. Hacer click en "INGRESAR"

Esperado:
✓ Spinner de carga aparece
✓ Se redirige a /game/worlds (o la ruta configurada)
✓ Token se guarda en estado
```

#### **Test 2: Login Fallido**
```
Pasos:
1. Ingresar DNI inválido
2. Hacer click en "INGRESAR"

Esperado:
✓ Mensaje de error aparece en rojo
✓ Error está dentro del modal
✓ No se redirige
✓ Puede intentar de nuevo
```

#### **Test 3: Validación de Input**
```
Pasos:
1. Intentar escribir letras → Solo acepta números
2. Intentar escribir más de 8 dígitos → Se limita a 8
3. Dejar campo vacío → Botón deshabilitado
4. Escribir menos de 8 dígitos → Botón deshabilitado

Esperado:
✓ Solo se aceptan números
✓ Se limita a 8 caracteres
✓ Botón se habilita solo con 8 dígitos válidos
```

#### **Test 4: Autenticado Redirige**
```
Pasos:
1. Acceder a /login cuando ya está autenticado
2. Debería tener un token guardado

Esperado:
✓ Redirige automáticamente a /game/worlds
✓ No muestra el login
```

### **E. Responsividad**

#### **Desktop (1920x1080)**
```
- [ ] Fondo llena toda la pantalla sin distorsión
- [ ] Logo es grande y visible
- [ ] Modal centrado y proporcional
- [ ] Input y botón tamaño normal
- [ ] Texto legible sin zoom
- [ ] Espaciado adecuado
```

#### **Tablet (768x1024)**
```
- [ ] Fondo se ajusta al tamaño
- [ ] Logo reduce tamaño proporcionalmente
- [ ] Modal sigue centrado
- [ ] Input aumentado en altura (h-14)
- [ ] Texto con md:text-2xl visible
- [ ] Touch areas suficientemente grandes
```

#### **Mobile (375x667)**
```
- [ ] Fondo se ajusta al tamaño reducido
- [ ] Logo es visible pero reducido
- [ ] Modal ocupa ancho útil (max-w-md con px-4)
- [ ] Input readable sin zoom
- [ ] Botón fácil de presionar (h-14)
- [ ] Scroll vertical si es necesario
- [ ] Mensaje de contacto completo (puede ser pequeño)
```

### **F. Accesibilidad**

- [ ] Contraste suficiente entre texto y fondo
  - [ ] Texto blanco legible sobre overlay oscuro
  - [ ] Input text legible (negro sobre fondo claro)

- [ ] Labels y placeholders presentes
  - [ ] Placeholder "12345678" visible
  - [ ] Input tipo "text" correcto (o number)

- [ ] Navegación por teclado funciona
  - [ ] Tab navega entre inputs y botón
  - [ ] Enter en input envía el formulario
  - [ ] Shift+Tab navega hacia atrás

- [ ] Errores accesibles
  - [ ] Mensaje de error visible y legible
  - [ ] En color contrastante (rojo)

### **G. Performance**

- [ ] Tiempo de carga aceptable (<3 segundos)
  - [ ] Abrir DevTools → Network
  - [ ] Verificar tiempo total de carga

- [ ] Imágenes optimizadas
  - [ ] Mostrar peso en DevTools → Network
  - [ ] login-bg.jpeg: ~2.9 MB (alta calidad)
  - [ ] Otras imágenes: <20 KB cada una

- [ ] Fuentes cargadas correctamente
  - [ ] DevTools → Network → filtra "fonts"
  - [ ] .woff2 debería ser la más descargada
  - [ ] No hay errores 404 en fuentes

- [ ] No hay errores en consola
  - [ ] DevTools → Console
  - [ ] No debe haber mensajes de error rojo
  - [ ] Warnings no bloqueantes aceptables

---

## 🐛 Testing de Errores Comunes

### **Error: Imágenes no cargan**
```
Síntoma: Fondo/logo/modal/input/botón están vacíos
Verificar:
1. Archivos existen en /public/images/ ✓
2. Ruta en código es /images/... (no /public/images) ✓
3. DevTools Network muestra 200 para las imágenes ✓
4. Limpiar cache y recargar: Ctrl+Shift+R
```

### **Error: Fuentes no cargando**
```
Síntoma: Texto usa font genérica sans-serif
Verificar:
1. Archivos en /public/fonts/ ✓
2. globals.css tiene @font-face correctas ✓
3. DevTools → Network filtra por "fonts" ✓
4. URLs en CSS apuntan a /fonts/ ✓
5. Limpiar cache
```

### **Error: Layout roto en mobile**
```
Síntoma: Elementos fuera de posición, superpuestos
Verificar:
1. Responsive classes correctas (md:, lg:)
2. Max-width aplicado (max-w-md)
3. Padding horizontal (px-4)
4. Escala de imagen correcta
5. Probar en DevTools → Device Toolbar
```

### **Error: Botón no funciona**
```
Síntoma: Click no produce efecto
Verificar:
1. DNI tiene 8 dígitos
2. No está en estado loading
3. DevTools → Console sin errores
4. Network request se envía al backend
5. Verificar CORS si necesario
```

---

## 📱 Testing en Navegadores

### **Navegadores a Probar**

| Navegador | Versión | Desktop | Tablet | Mobile |
|-----------|---------|---------|--------|--------|
| Chrome | Latest | ✓ | ✓ | ✓ |
| Firefox | Latest | ✓ | ✓ | ✓ |
| Safari | Latest | ✓ | ✓ | ✓ |
| Edge | Latest | ✓ | - | - |
| Mobile Safari | iOS 17+ | - | - | ✓ |
| Chrome Mobile | Android | - | - | ✓ |

### **Casos Críticos**
- [ ] Chrome Desktop (mayor compatibilidad)
- [ ] Safari Mobile (verificar fuentes Apple)
- [ ] Firefox (verificar SVG fonts)

---

## 🔍 Herramientas de Desarrollo

### **DevTools Útiles**

#### **Network Tab**
```javascript
// Ver todas las imágenes y fuentes
// Filtrar por "fonts" y "images"
// Verificar status 200 (no 404)
// Verificar tamaños y tiempos
```

#### **Console Tab**
```javascript
// Verificar no hay errores
// Buscar mensajes de advertencia de fuentes
// Probar manualmente: document.fonts.ready
```

#### **Device Toolbar**
```javascript
// Acceder: Ctrl+Shift+M
// Probar resoluciones: 375, 768, 1024, 1920
// Probar orientaciones: Portrait, Landscape
```

#### **Performance Tab**
```javascript
// Medir tiempo de carga
// Identificar bottlenecks
// Optimizar si es necesario
```

---

## ✨ Demostración Visual

### **Interacciones Esperadas**

```
Estado: Inicial
┌─────────────────────┐
│   [Logo]            │
│ ┌─────────────────┐ │
│ │ INGRESA TU DNI  │ │
│ │ [________]      │ │  ← Input vacío
│ │ [INGRESAR]      │ │  ← Botón deshabilitado
│ └─────────────────┘ │
└─────────────────────┘

Estado: Escribiendo
┌─────────────────────┐
│   [Logo]            │
│ ┌─────────────────┐ │
│ │ INGRESA TU DNI  │ │
│ │ [12345___]      │ │  ← Escribiendo
│ │ [INGRESAR]      │ │  ← Botón deshabilitado
│ └─────────────────┘ │
└─────────────────────┘

Estado: Completo
┌─────────────────────┐
│   [Logo]            │
│ ┌─────────────────┐ │
│ │ INGRESA TU DNI  │ │
│ │ [12345678]      │ │  ← Completo
│ │ [INGRESAR]      │ │  ← Habilitado, hover color
│ └─────────────────┘ │
└─────────────────────┘

Estado: Cargando
┌─────────────────────┐
│   [Logo]            │
│ ┌─────────────────┐ │
│ │ INGRESA TU DNI  │ │
│ │ [12345678]      │ │
│ │ [⟳ Ingresando]  │ │  ← Spinner
│ └─────────────────┘ │
└─────────────────────┘

Estado: Error
┌─────────────────────┐
│   [Logo]            │
│ ┌─────────────────┐ │
│ │ INGRESA TU DNI  │ │
│ │ [12345678]      │ │
│ │ ⚠ DNI no existe │ │  ← Error message
│ │ [INGRESAR]      │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 📋 Documento de Resultados

Después de completar el testing, documentar:

```markdown
# Resultados de Testing - Login Mejorado

**Fecha:** [Completar]
**Tester:** [Nombre]
**Navegador:** [Nombre y Versión]
**Resolución:** [Ancho x Alto]

## Resultados Generales
- [ ] PASÓ - Todo funciona correctamente
- [ ] PASÓ CON NOTAS - Funciona pero con observaciones
- [ ] FALLÓ - Hay problemas críticos

## Problemas Encontrados
[Listar cualquier issue encontrado]

## Observaciones
[Notas adicionales]

## Recomendaciones
[Cambios sugeridos]
```

---

## 🎉 Conclusión

El testing debe verificar que:
1. ✅ Todas las imágenes cargan correctamente
2. ✅ Las fuentes se muestran sin problemas
3. ✅ El diseño es responsive en todas las resoluciones
4. ✅ La funcionalidad de login se mantiene
5. ✅ No hay errores en consola
6. ✅ Performance es aceptable

Si todos los puntos pasan, **la implementación está lista para producción**.

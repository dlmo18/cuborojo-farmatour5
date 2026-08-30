# 🚀 Inicio Rápido - Frontends Farmatour5

## ✅ Estado Actual

Ambos frontends han sido completados y están listos para ejecutarse:

- ✅ **Frontend Participantes** (Puerto 3000)
- ✅ **Frontend Manager** (Puerto 3002)

---

## 📦 Instalación

### 1. Instalar Dependencias

```bash
# Frontend Participantes
cd frontend-participants
npm install

# Frontend Manager  
cd ../frontend-manager
npm install
```

---

## 🎮 Ejecución en Desarrollo

### Frontend Participantes

```bash
cd frontend-participants
npm run dev
```

**URL:** http://localhost:3000

**Funcionalidades:**
- Login con DNI de participante
- Visualización de mundos del juego
- Navegación por niveles (normales y dorados)
- Sistema de estrellas

### Frontend Manager

```bash
cd frontend-manager
npm run dev
```

**URL:** http://localhost:3002

**Funcionalidades:**
- Login de administradores (username/password)
- Dashboard con KPIs y top 10
- Sidebar con navegación a todas las secciones
- 9 módulos de gestión (placeholder)

---

## 🏗️ Build de Producción

### Compilar

```bash
# Participantes
cd frontend-participants
npm run build

# Manager
cd frontend-manager
npm run build
```

### Ejecutar Build

```bash
# Participantes
cd frontend-participants
npm start

# Manager
cd frontend-manager
npm start
```

---

## 🔍 Verificación Automática

Ejecuta el script de verificación para confirmar que todo está funcionando:

```bash
bash scripts/verify-frontends.sh
```

Este script:
- ✅ Verifica archivos de configuración
- ✅ Verifica dependencias instaladas
- ✅ Ejecuta build de ambos frontends
- ✅ Muestra resumen del estado

---

## 📂 Estructura de Páginas

### Frontend Participants

```
/                           → Landing page con diseño atractivo
/login                      → Login con DNI
/game/worlds                → Selección de mundos y niveles
```

### Frontend Manager

```
/manager-system/login       → Login admin/reporter
/manager-system/dashboard   → Dashboard con métricas

Módulos de Gestión (placeholder):
/manager-system/usuarios
/manager-system/participantes  
/manager-system/grupos
/manager-system/mundos
/manager-system/misiones
/manager-system/preguntas
/manager-system/biblioteca
/manager-system/reporteria
/manager-system/configuracion
```

---

## 🔐 Credenciales de Prueba

**Importante:** Requiere backend ejecutándose en `http://localhost:3001`

### Participante
- **DNI:** Cualquier DNI registrado en la base de datos

### Administrador
- **Usuario:** admin
- **Contraseña:** (Según tu configuración en backend)

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 3.4
- **Estado:** Zustand (participants) / localStorage (manager)
- **HTTP Client:** Axios
- **UI:** Componentes custom con Tailwind

---

## 🐛 Solución de Problemas

### Puerto ocupado

Si el puerto está en uso:

```bash
# Frontend Participants (prueba puertos automáticamente: 3000, 3001, 3002, 3003)
npm run dev

# Frontend Manager
PORT=3004 npm run dev:alt
```

### Error de compilación

```bash
# Limpiar cache y reinstalar
rm -rf node_modules .next
npm install
npm run dev
```

### Error de conexión al backend

Verifica que el backend esté corriendo:

```bash
cd backend
npm run start:dev
```

Y que la URL en `.env` sea correcta:

```bash
# frontend-participants/.env o frontend-manager/.env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📝 Archivos de Configuración

### frontend-participants

- `package.json` - Dependencias y scripts
- `tailwind.config.ts` - Configuración de Tailwind
- `postcss.config.js` - PostCSS
- `tsconfig.json` - TypeScript
- `.env` - Variables de entorno
- `src/app/globals.css` - Estilos globales

### frontend-manager

- `package.json` - Dependencias y scripts  
- `tailwind.config.ts` - Configuración de Tailwind (con tema extendido)
- `postcss.config.js` - PostCSS
- `tsconfig.json` - TypeScript
- `.env` - Variables de entorno
- `src/app/globals.css` - Estilos globales con clases admin

---

## 🎯 Próximos Pasos

Las páginas del manager están creadas con placeholders. Para desarrollarlas:

1. Implementar componentes de formularios CRUD
2. Conectar con los endpoints del backend (ver Postman collection)
3. Agregar validaciones y manejo de errores
4. Implementar subida de archivos (biblioteca de medios)
5. Crear gráficas y reportes avanzados

**Referencia:** Consulta `docs/Farmatour5_API.postman_collection.json` para ver todos los endpoints disponibles.

---

## 📚 Documentación Adicional

- [FRONTEND_FIX.md](docs/FRONTEND_FIX.md) - Detalle de correcciones realizadas
- [API_SWAGGER.md](docs/API_SWAGGER.md) - Documentación de la API
- [ARQUITECTURA.md](docs/ARQUITECTURA.md) - Arquitectura del sistema
- [Postman Collection](docs/Farmatour5_API.postman_collection.json) - Colección de API

---

## ✅ Checklist de Inicio

- [ ] Backend ejecutándose en puerto 3001
- [ ] Base de datos PostgreSQL configurada
- [ ] `npm install` en frontend-participants
- [ ] `npm install` en frontend-manager
- [ ] Archivos `.env` configurados en ambos frontends
- [ ] `npm run dev` en ambos frontends
- [ ] Acceso a http://localhost:3000 y http://localhost:3002

---

**¡Todo listo para desarrollar! 🎉**

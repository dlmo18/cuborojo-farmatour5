# 🚀 Inicio Rápido - Frontends

## ✅ FRONTENDS COMPLETADOS

Ambos frontends han sido corregidos y completados exitosamente. Ya puedes ejecutarlos sin errores.

---

## 📦 Instalación Rápida

```bash
# Clonar repositorio (si aún no lo has hecho)
git clone <tu-repositorio>
cd cuborojo-farmatour5

# Instalar dependencias de ambos frontends
cd frontend-participants && npm install && cd ..
cd frontend-manager && npm install && cd ..
```

---

## 🚀 Ejecución

### Opción 1: Script Automático (Recomendado)

```bash
# Inicia ambos frontends simultáneamente
bash scripts/start-frontends.sh
```

Este script:
- ✅ Verifica dependencias
- ✅ Inicia frontend-participants en puerto 3000 (o siguiente disponible)
- ✅ Inicia frontend-manager en puerto 3002 (o siguiente disponible)
- ✅ Muestra URLs de acceso
- ✅ Logs en /tmp/farmatour5-*.log

**Para detener:** Presiona `Ctrl+C`

---

### Opción 2: Manual (Terminales Separadas)

```bash
# Terminal 1 - Frontend Participantes
cd frontend-participants
npm run dev
# Acceder: http://localhost:3000

# Terminal 2 - Frontend Manager
cd frontend-manager
npm run dev
# Acceder: http://localhost:3002
```

---

## 🌐 URLs de Acceso

Una vez iniciados:

- **Participantes:** http://localhost:3000
  - Login: `/login`
  - Mundos: `/game/worlds`

- **Manager:** http://localhost:3002
  - Login: `/manager-system/login`
  - Dashboard: `/manager-system/dashboard`

---

## 🔍 Verificación

Verifica que todo esté correctamente configurado:

```bash
# Ejecutar script de verificación
bash scripts/verify-frontends.sh
```

Este script compila ambos frontends y confirma que no hay errores.

---

## 📂 Estructura del Proyecto

```
cuborojo-farmatour5/
├── backend/                 # NestJS API (puerto 3001)
├── frontend-participants/   # NextJS participantes (puerto 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css          ✅ NUEVO
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── game/worlds/page.tsx
│   │   └── store/authStore.ts
│   ├── postcss.config.js            ✅ NUEVO
│   ├── tailwind.config.ts
│   └── package.json                 ✅ ACTUALIZADO
│
├── frontend-manager/        # NextJS manager (puerto 3002)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css          ✅ NUEVO
│   │   │   ├── layout.tsx
│   │   │   └── manager-system/
│   │   │       ├── layout.tsx
│   │   │       ├── login/page.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── usuarios/page.tsx       ✅ NUEVO
│   │   │       ├── participantes/page.tsx  ✅ NUEVO
│   │   │       ├── grupos/page.tsx         ✅ NUEVO
│   │   │       ├── mundos/page.tsx         ✅ NUEVO
│   │   │       ├── misiones/page.tsx       ✅ NUEVO
│   │   │       ├── preguntas/page.tsx      ✅ NUEVO
│   │   │       ├── biblioteca/page.tsx     ✅ NUEVO
│   │   │       ├── reporteria/page.tsx     ✅ NUEVO
│   │   │       └── configuracion/page.tsx  ✅ NUEVO
│   ├── postcss.config.js            ✅ NUEVO
│   ├── tailwind.config.ts           ✅ NUEVO
│   └── package.json                 ✅ ACTUALIZADO
│
├── scripts/
│   ├── start-frontends.sh           ✅ NUEVO
│   └── verify-frontends.sh          ✅ NUEVO
│
└── docs/
    ├── FRONTEND_FIX.md              ✅ NUEVO
    ├── FRONTEND_COMPLETION.md       ✅ NUEVO
    └── Farmatour5_API.postman_collection.json
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend Participants
- Next.js 14
- TypeScript
- Tailwind CSS 3.4
- Zustand (state management)
- Axios

### Frontend Manager
- Next.js 14
- TypeScript
- Tailwind CSS 3.4
- localStorage (auth)
- Axios

---

## 🔐 Credenciales de Prueba

### Backend Requerido

Los frontends requieren que el backend esté ejecutándose en:
```
http://localhost:3001/api
```

Para iniciar el backend:
```bash
cd backend
npm run start:dev
```

### Login Participantes
- **URL:** http://localhost:3000/login
- **DNI:** Cualquier DNI registrado en la base de datos

### Login Manager
- **URL:** http://localhost:3002/manager-system/login
- **Usuario:** admin (o según tu configuración)
- **Contraseña:** (según tu configuración en backend)

---

## 🎨 Funcionalidades Implementadas

### Frontend Participantes ✅
- Landing page con diseño atractivo
- Login por DNI
- Autenticación JWT con Zustand
- Visualización de mundos
- Navegación por niveles normales y dorados
- Indicador de estrellas
- Protección de rutas

### Frontend Manager ✅
- Login username/password
- Dashboard con KPIs:
  - Top 10 participantes
  - Top 10 grupos
  - Progreso de mundos
- Sidebar de navegación completo
- 9 módulos de gestión (estructura base)
- Logout funcional
- Protección de rutas

---

## 🐛 Problemas Resueltos

✅ Error: "Cannot find module './globals.css'"
✅ Error: PostCSS plugin not found
✅ Error: Tailwind CSS not installed
✅ Warning: tsconfig.json references
✅ Error: Pages not found in manager

**Ver detalles:** [docs/FRONTEND_FIX.md](docs/FRONTEND_FIX.md)

---

## 📚 Documentación Adicional

- **[FRONTEND_QUICKSTART.md](FRONTEND_QUICKSTART.md)** - Guía completa de inicio
- **[FRONTEND_COMPLETION.md](FRONTEND_COMPLETION.md)** - Resumen de completitud
- **[docs/FRONTEND_FIX.md](docs/FRONTEND_FIX.md)** - Detalle técnico de correcciones
- **[docs/API_SWAGGER.md](docs/API_SWAGGER.md)** - Documentación API
- **[docs/Farmatour5_API.postman_collection.json](docs/Farmatour5_API.postman_collection.json)** - Colección Postman

---

## 🎯 Próximos Pasos

Las siguientes funcionalidades están pendientes de implementación:

### Participantes
1. Página de misión individual con items informativos
2. Sistema de preguntas y respuestas
3. Animaciones de estrellas
4. Efectos de sonido
5. Sistema de regalos con contador
6. Rankings y puestos

### Manager
1. CRUD completo de todos los módulos
2. Importación CSV/Excel de participantes
3. Editor rich text para contenidos
4. Upload de imágenes y medios
5. Gráficas y reportes avanzados
6. Gestión de permisos RBAC

---

## ✅ Checklist Antes de Empezar

- [ ] Backend ejecutándose en puerto 3001
- [ ] PostgreSQL configurado y con datos
- [ ] `npm install` en frontend-participants
- [ ] `npm install` en frontend-manager
- [ ] Archivos `.env` configurados
- [ ] Ejecutar `bash scripts/verify-frontends.sh`
- [ ] Ejecutar `bash scripts/start-frontends.sh`

---

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que el backend esté corriendo
2. Revisa los logs en `/tmp/farmatour5-*.log`
3. Ejecuta `bash scripts/verify-frontends.sh`
4. Consulta [docs/FRONTEND_FIX.md](docs/FRONTEND_FIX.md)

---

**¡Todo listo para desarrollar! 🚀**

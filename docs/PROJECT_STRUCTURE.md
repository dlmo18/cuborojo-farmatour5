# 📁 Estructura del Repositorio Farmatour5

```
farmatour5-repo/
│
├── 📄 README.md                           # Descripción general del proyecto
├── 📄 DELIVERY.md                         # Resumen de entregables ← LEER PRIMERO
├── 📄 GITHUB_SETUP.md                     # Guía de setup en GitHub
├── 📄 CI_CD_QUICKSTART.md                 # Quick start de CI/CD (5 min)
│
├── 🔧 .github/
│   └── workflows/
│       └── deploy.yml                     # GitHub Actions CI/CD workflow
│
├── 🗄️ database/
│   ├── schema.sql                         # Schema PostgreSQL completo
│   ├── migrations/                        # (Para futuras migraciones)
│   └── backups/                           # Backups automáticos
│
├── 🚀 backend/                            # NestJS Application
│   ├── src/
│   │   ├── main.ts                        # Bootstrap con Swagger
│   │   ├── app.module.ts                  # Root module
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── jwt-participant.strategy.ts
│   │   │   │   └── guards.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   └── users.module.ts
│   │   │   │
│   │   │   ├── participants/
│   │   │   ├── groups/
│   │   │   ├── worlds/
│   │   │   ├── levels/
│   │   │   ├── missions/
│   │   │   ├── questions/
│   │   │   ├── progress/
│   │   │   ├── reports/
│   │   │   ├── media/
│   │   │   └── config/
│   │   │
│   │   └── common/
│   │       ├── dto/                       # DTOs compartidos
│   │       ├── pipes/                     # Validación
│   │       └── interceptors/              # Transformación de respuestas
│   │
│   ├── dist/                              # Build compilado
│   ├── package.json                       # Dependencias NestJS
│   ├── tsconfig.json                      # TypeScript config
│   ├── .env.example                       # Template de .env
│   └── ecosystem.config.js                # PM2 configuration
│
├── 🎮 frontend-participants/              # NextJS Application (Participantes)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                 # Root layout
│   │   │   ├── page.tsx                   # Landing page
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx               # Login por DNI
│   │   │   │
│   │   │   └── game/
│   │   │       ├── layout.tsx             # Protected layout
│   │   │       ├── worlds/
│   │   │       │   └── page.tsx           # Selección de mundos
│   │   │       ├── levels/
│   │   │       ├── missions/
│   │   │       ├── questions/
│   │   │       └── results/
│   │   │
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   │
│   │   └── store/
│   │       └── authStore.ts               # Zustand auth store
│   │
│   ├── .next/                             # Build compilado
│   ├── public/                            # Assets estáticos
│   ├── package.json                       # Dependencias NextJS
│   ├── tsconfig.json                      # TypeScript config
│   ├── tailwind.config.ts                 # Tailwind configuración
│   └── .env.example                       # Template de .env
│
├── 👨‍💼 frontend-manager/                   # NextJS Application (Admin)
│   ├── src/
│   │   ├── app/
│   │   │   └── manager-system/
│   │   │       ├── layout.tsx             # Sidebar navigation
│   │   │       ├── page.tsx               # Redirect to dashboard
│   │   │       │
│   │   │       ├── login/
│   │   │       │   └── page.tsx           # Login username/password
│   │   │       │
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx           # KPI Dashboard
│   │   │       │
│   │   │       ├── usuarios/
│   │   │       ├── participantes/
│   │   │       ├── misiones/
│   │   │       ├── biblioteca/
│   │   │       ├── reporteria/
│   │   │       └── configuracion/
│   │   │
│   │   ├── components/
│   │   ├── store/
│   │   └── services/
│   │
│   ├── .next/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.example
│
├── 🌐 nginx/
│   ├── farmatour5.conf                    # Nginx configuration (main)
│   └── proxy_headers.conf                 # Reusable proxy headers
│
├── 📚 docs/
│   ├── ARQUITECTURA.md                    # Documentación de arquitectura
│   ├── MANUAL_INSTALACION.md              # Guía de instalación (750+ líneas)
│   ├── MANUAL_CI_CD.md                    # Guía CI/CD (400+ líneas)
│   └── API_SWAGGER.md                     # Documentación API (40+ endpoints)
│
├── 🛠️ scripts/
│   ├── setup-github-secrets.sh            # Configurar secrets automáticamente
│   ├── backup.sh                          # Backup diario de BD
│   ├── health-check.sh                    # Monitoreo de servicios
│   └── restore.sh                         # Restaurar desde backup
│
├── 📦 deploy.sh                           # Script de deployment automático
│
├── 📝 logs/                               # Logs de aplicación
│   ├── backend-*.log
│   ├── nginx-access.log
│   ├── nginx-error.log
│   ├── deployments.log
│   └── health-check.log
│
├── 📤 uploads/                            # Media uploads (generado en producción)
│
└── 📑 backups/                            # Backups de BD (generado en producción)
```

---

## 📖 Guía de Navegación

### Para Empezar
1. **[DELIVERY.md](./DELIVERY.md)** - Resumen completo de lo entregado ← AQUÍ
2. **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - Configurar GitHub y CI/CD
3. **[CI_CD_QUICKSTART.md](./CI_CD_QUICKSTART.md)** - Setup en 5 minutos

### Documentación Técnica
- **[docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md)** - Diseño y patrones
- **[docs/MANUAL_INSTALACION.md](./docs/MANUAL_INSTALACION.md)** - Instalación completa
- **[docs/MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md)** - CI/CD detallado
- **[docs/API_SWAGGER.md](./docs/API_SWAGGER.md)** - API endpoints

### Instalación
- **[deploy.sh](./deploy.sh)** - Automatiza setup del servidor
- **[scripts/setup-github-secrets.sh](./scripts/setup-github-secrets.sh)** - Setup de GitHub

### Operaciones
- **[scripts/backup.sh](./scripts/backup.sh)** - Backups automáticos
- **[scripts/health-check.sh](./scripts/health-check.sh)** - Monitoreo
- **[scripts/restore.sh](./scripts/restore.sh)** - Restaurar backup

---

## 🚀 Quick Reference

### Setup Inicial (30 minutos)
```bash
# 1. Clonar repositorio
git clone REPO_URL
cd farmatour5-repo

# 2. Leer guía de inicio
cat DELIVERY.md
cat GITHUB_SETUP.md

# 3. Configurar GitHub
bash scripts/setup-github-secrets.sh usuario/repo

# 4. Deploy automático
git push origin main
# GitHub Actions se dispara automáticamente
```

### Acceso a Sistemas
```
Participantes:  https://farmatour5.com
Manager:        https://farmatour5.com/manager-system
API:            https://farmatour5.com/api
Swagger:        https://farmatour5.com/api/docs
```

### Monitoreo
```bash
# SSH al servidor
ssh farmatour5@SERVER_IP

# Ver status
pm2 status

# Logs en vivo
pm2 logs

# Health check
bash /var/www/farmatour5/scripts/health-check.sh
```

---

## 📊 Estructura de Directorios en Producción

En el servidor `/var/www/farmatour5/`:

```
/var/www/farmatour5/
├── backend/                 # NestJS dist + node_modules
│   ├── dist/
│   ├── node_modules/
│   ├── .env                 # ⚠️ Generado desde Secret
│   └── ecosystem.config.js
├── frontend-participants/   # NextJS .next + node_modules
│   ├── .next/
│   ├── node_modules/
│   └── .env.production.local
├── frontend-manager/        # NextJS .next + node_modules
│   ├── .next/
│   ├── node_modules/
│   └── .env.production.local
├── uploads/                 # Media library
├── logs/                    # Application logs
├── backups/                 # Daily backups
└── ssl/                     # SSL certificates
```

---

## 🔄 Ciclo de Desarrollo

```
Local Development
    ↓ git push
Feature Branch
    ↓ Create PR
GitHub Review
    ↓ Approve & Merge
Main Branch
    ↓ Webhook
GitHub Actions
    ├─ Build Backend
    ├─ Build Frontend Participants
    ├─ Build Frontend Manager
    ├─ Run Tests
    └─ Deploy to Production
        ├─ SSH Connect
        ├─ Backup Previous
        ├─ Transfer Files
        ├─ Restart Services
        ├─ Reload Nginx
        └─ Health Check
            ↓ Success/Failure
Systems Live!
```

---

## 📋 Checklist Antes de Deploy

- [ ] Código committeado en rama feature
- [ ] PR creada y reviada
- [ ] Tests pasan en local
- [ ] No hay secrets hardcodeados
- [ ] Variables de entorno correctas en GitHub Secrets
- [ ] SSH key agregada al servidor
- [ ] Dominio DNS apuntando correctamente
- [ ] Certificado SSL preparado

---

## 💡 Tips Importantes

1. **NUNCA commitar .env** - Usar GitHub Secrets
2. **NUNCA commitar SSH keys** - Usar GitHub Secrets
3. **Cambiar valores de secrets** antes de producción
4. **Revisar logs** regularmente
5. **Hacer backups** antes de cambios importantes
6. **Usar ramas** para desarrollo (no push a main)
7. **Escribir buenas mensajes de commit**
8. **Actualizar dependencias** regularmente

---

## 📞 Help & Support

| Pregunta | Recurso |
|----------|---------|
| ¿Cómo instalar manualmente? | [MANUAL_INSTALACION.md](./docs/MANUAL_INSTALACION.md) |
| ¿Cómo configurar CI/CD? | [MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md) |
| ¿Cómo usar GitHub? | [GITHUB_SETUP.md](./GITHUB_SETUP.md) |
| ¿Cómo ver API? | [API_SWAGGER.md](./docs/API_SWAGGER.md) |
| ¿Cómo entender arquitectura? | [ARQUITECTURA.md](./docs/ARQUITECTURA.md) |
| ¿Workflow falla? | Ver [MANUAL_CI_CD.md](./docs/MANUAL_CI_CD.md#-troubleshooting) |
| ¿Error en servidor? | `ssh user@server pm2 logs` |

---

**Última actualización**: Agosto 2026  
**Versión**: 1.0  
**Estado**: Production Ready ✅
